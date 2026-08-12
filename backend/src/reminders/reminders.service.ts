import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Reservation } from '../database/entities/Reservation.entity';
import { MailService } from '../mail/mail.service';
import { ReservationStatus } from '../reservations/enums/reservation-status.enum';

/**
 * Wysyła przypomnienia o rezerwacji ~2h przed wizytą (#21).
 * Cron uruchamia się cyklicznie; flaga reminderSent zapobiega duplikatom.
 */
@Injectable()
export class RemindersService {
  private readonly logger = new Logger(RemindersService.name);
  private static readonly REMINDER_WINDOW_MS = 2 * 60 * 60 * 1000; // 2h

  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    private readonly mailService: MailService,
  ) {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  async handleReminderCron(): Promise<void> {
    const count = await this.sendDueReminders();
    if (count > 0) {
      this.logger.log(`Wysłano ${count} przypomnień o rezerwacji`);
    }
  }

  /**
   * Znajduje rezerwacje w oknie [teraz, teraz+2h] bez wysłanego przypomnienia
   * (i nieanulowane), wysyła przypomnienie i oznacza reminderSent. Zwraca liczbę wysłanych.
   */
  async sendDueReminders(): Promise<number> {
    const now = new Date();
    const windowEnd = new Date(now.getTime() + RemindersService.REMINDER_WINDOW_MS);

    const due = await this.reservationRepository.find({
      where: {
        reservationTime: Between(now, windowEnd),
        reminderSent: false,
      },
    });

    let sent = 0;
    for (const reservation of due) {
      if (reservation.status === ReservationStatus.CANCELLED) {
        continue;
      }
      try {
        await this.mailService.sendReservationReminder(reservation.id);
        reservation.reminderSent = true;
        await this.reservationRepository.save(reservation);
        sent++;
      } catch (err) {
        this.logger.error(
          `Nie udało się wysłać przypomnienia dla rezerwacji #${reservation.id}`,
          err as Error,
        );
      }
    }
    return sent;
  }
}
