import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reservation } from '../database/entities/Reservation.entity';
import { TransientMailError, PermanentMailError } from './interfaces/mail-error.interface';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  private readonly MAX_RETRIES = 3;
  private readonly BASE_DELAY_MS = 1000;

  constructor(
    private readonly mailerService: MailerService,
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
  ) {}

  /**
   * Sends a reservation confirmation email to the user.
   * Implements exponential backoff retry for transient failures.
   *
   * @param reservationId - ID of the reservation to send confirmation for
   */
  async sendReservationConfirmation(reservationId: number): Promise<void> {
    const reservation = await this.reservationRepository.findOne({
      where: { id: reservationId },
      relations: ['user', 'table', 'table.restaurant'],
    });

    if (!reservation) {
      this.logger.warn(`Reservation ${reservationId} not found — skipping email`);
      return;
    }

    const { user, table, guests } = reservation;
    const restaurant = table?.restaurant;

    if (!user || !restaurant || !table) {
      this.logger.error(
        `Incomplete reservation data for id=${reservationId} — cannot send email`,
      );
      return;
    }

    const reservationDate = this.formatDate(reservation.reservationTime);
    const reservationTime = this.formatTime(reservation.reservationTime);

    const mailOptions = {
      to: user.email,
      subject: `Potwierdzenie rezerwacji #${reservation.id}`,
      template: './reservation-confirmation',
      context: {
        userName: `${user.firstName} ${user.lastName}`,
        reservationDate,
        reservationTime,
        tableNumber: table.tableNumber,
        guestsCount: guests,
        restaurantName: restaurant.name,
        restaurantAddress: restaurant.address,
        reservationId: reservation.id,
      },
    };

    await this.sendWithRetry(mailOptions, reservation.id);
  }

  /**
   * Wysyła e-mail weryfikacyjny z linkiem aktywacyjnym (#81, OWASP A04).
   */
  async sendVerificationEmail(
    to: string,
    userName: string,
    token: string,
  ): Promise<void> {
    const baseUrl = process.env.APP_URL || 'http://localhost';
    const verificationUrl = `${baseUrl}/api/auth/verify-email?token=${token}`;
    const mailOptions = {
      to,
      subject: 'Potwierdź adres e-mail',
      template: './email-verification',
      context: { userName, verificationUrl },
    };
    await this.sendWithRetry(mailOptions, 0, 1, 'Verification');
  }

  /**
   * Wysyła przypomnienie o rezerwacji (~2h przed wizytą, #21).
   */
  async sendReservationReminder(reservationId: number): Promise<void> {
    const reservation = await this.reservationRepository.findOne({
      where: { id: reservationId },
      relations: ['user', 'table', 'table.restaurant'],
    });

    if (!reservation) {
      this.logger.warn(`Reservation ${reservationId} not found — skipping reminder`);
      return;
    }

    const { user, table, guests } = reservation;
    const restaurant = table?.restaurant;

    if (!user || !restaurant || !table) {
      this.logger.error(
        `Incomplete reservation data for id=${reservationId} — cannot send reminder`,
      );
      return;
    }

    const mailOptions = {
      to: user.email,
      subject: `Przypomnienie o rezerwacji #${reservation.id}`,
      template: './reservation-reminder',
      context: {
        userName: `${user.firstName} ${user.lastName}`,
        reservationDate: this.formatDate(reservation.reservationTime),
        reservationTime: this.formatTime(reservation.reservationTime),
        tableNumber: table.tableNumber,
        guestsCount: guests,
        restaurantName: restaurant.name,
        restaurantAddress: restaurant.address,
        reservationId: reservation.id,
      },
    };

    await this.sendWithRetry(mailOptions, reservation.id, 1, 'Reminder');
  }

  /**
   * Sends an email with retry logic for transient errors.
   * Exponential backoff: 1s, 2s, 4s.
   */
  private async sendWithRetry(
    mailOptions: any,
    reservationId: number,
    attempt: number = 1,
    label: string = 'Confirmation',
  ): Promise<void> {
    try {
      await this.mailerService.sendMail(mailOptions);
      this.logger.log(
        `${label} email sent for reservation #${reservationId}`,
      );
    } catch (error) {
      const classifiedError = this.classifyError(error);

      if (!classifiedError.isTransient || attempt >= this.MAX_RETRIES) {
        const kind = classifiedError.isTransient ? 'transient (max retries reached)' : 'permanent';
        this.logger.error(
          `Failed to send email for reservation #${reservationId} — ${kind}: ${classifiedError.message}`,
        );
        throw classifiedError;
      }

      const delayMs = this.BASE_DELAY_MS * Math.pow(2, attempt - 1);
      this.logger.warn(
        `Email send attempt ${attempt}/${this.MAX_RETRIES} failed for reservation #${reservationId}. Retrying in ${delayMs}ms...`,
      );

      await this.sleep(delayMs);
      await this.sendWithRetry(mailOptions, reservationId, attempt + 1, label);
    }
  }

  /**
   * Classifies an SMTP/network error as transient or permanent.
   * - 4xx codes, network errors, timeouts → transient (retryable)
   * - 5xx codes, authentication errors → permanent (not retryable)
   */
  private classifyError(error: any): TransientMailError | PermanentMailError {
    const code = error?.code || error?.responseCode || error?.statusCode;
    const message = error?.message || 'Unknown mail error';

    // Authentication failures — permanent
    if (code === 'EAUTH' || code === 'ESASL' || code === 535 || code === 534) {
      return new PermanentMailError(message, code);
    }

    // SMTP 5xx — permanent
    if (typeof code === 'number' && code >= 500) {
      return new PermanentMailError(message, code);
    }

    // SMTP 4xx — transient
    if (typeof code === 'number' && code >= 400 && code < 500) {
      return new TransientMailError(message, code);
    }

    // Network errors, timeouts — transient
    if (
      code === 'ETIMEDOUT' ||
      code === 'ECONNREFUSED' ||
      code === 'ECONNRESET' ||
      code === 'ENOTFOUND' ||
      code === 'ESOCKETTIMEOUT'
    ) {
      return new TransientMailError(message, code);
    }

    // Default: treat unknown errors as transient for safety
    return new TransientMailError(message, code);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  private formatTime(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleTimeString('pl-PL', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
