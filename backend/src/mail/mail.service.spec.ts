import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MailerService } from '@nestjs-modules/mailer';
import { MailService } from './mail.service';
import { Reservation } from '../database/entities/Reservation.entity';
import { TransientMailError, PermanentMailError } from './interfaces/mail-error.interface';

describe('MailService', () => {
  let mailService: MailService;

  const mockReservation = {
    id: 1,
    reservationTime: new Date('2025-07-15T19:00:00Z'),
    guests: 4,
    status: 'confirmed',
    user: {
      id: 1,
      firstName: 'Jan',
      lastName: 'Kowalski',
      email: 'jan.kowalski@example.com',
    },
    table: {
      id: 1,
      tableNumber: 5,
      capacity: 4,
      restaurant: {
        id: 1,
        name: 'Restauracja Testowa',
        address: 'ul. Testowa 1, Warszawa',
      },
    },
  };

  const mockMailerService = {
    sendMail: jest.fn(),
  };

  const mockReservationRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: MailerService,
          useValue: mockMailerService,
        },
        {
          provide: getRepositoryToken(Reservation),
          useValue: mockReservationRepository,
        },
      ],
    }).compile();

    mailService = module.get<MailService>(MailService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(mailService).toBeDefined();
  });

  describe('sendReservationConfirmation', () => {
    it('should send confirmation email when reservation exists with full data', async () => {
      mockReservationRepository.findOne.mockResolvedValue(mockReservation);
      mockMailerService.sendMail.mockResolvedValue(true);

      await mailService.sendReservationConfirmation(1);

      expect(mockReservationRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['user', 'table', 'table.restaurant'],
      });

      expect(mockMailerService.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'jan.kowalski@example.com',
          subject: 'Potwierdzenie rezerwacji #1',
          template: './reservation-confirmation',
          context: expect.objectContaining({
            userName: 'Jan Kowalski',
            tableNumber: 5,
            guestsCount: 4,
            restaurantName: 'Restauracja Testowa',
            restaurantAddress: 'ul. Testowa 1, Warszawa',
            reservationId: 1,
          }),
        }),
      );
    });

    it('should not send email when reservation is not found', async () => {
      mockReservationRepository.findOne.mockResolvedValue(null);

      await mailService.sendReservationConfirmation(999);

      expect(mockMailerService.sendMail).not.toHaveBeenCalled();
    });

    it('should not send email when user data is missing', async () => {
      mockReservationRepository.findOne.mockResolvedValue({
        ...mockReservation,
        user: null,
      });

      await mailService.sendReservationConfirmation(1);

      expect(mockMailerService.sendMail).not.toHaveBeenCalled();
    });

    it('should not send email when restaurant data is missing', async () => {
      mockReservationRepository.findOne.mockResolvedValue({
        ...mockReservation,
        table: { ...mockReservation.table, restaurant: null },
      });

      await mailService.sendReservationConfirmation(1);

      expect(mockMailerService.sendMail).not.toHaveBeenCalled();
    });
  });

  describe('retry mechanism', () => {
    // Use real timers for retry tests so setTimeout in sleep() actually fires
    beforeEach(() => {
      jest.useRealTimers();
    });

    it('should retry on transient error and succeed on second attempt', async () => {
      mockReservationRepository.findOne.mockResolvedValue(mockReservation);

      let callCount = 0;
      mockMailerService.sendMail.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.reject(new Error('Temporary network error'));
        }
        return Promise.resolve(true);
      });

      await mailService.sendReservationConfirmation(1);

      expect(mockMailerService.sendMail).toHaveBeenCalledTimes(2);
    }, 15000);

    it('should retry up to 3 times on transient errors', async () => {
      mockReservationRepository.findOne.mockResolvedValue(mockReservation);
      mockMailerService.sendMail.mockRejectedValue(
        new Error('Connection refused'),
      );

      await expect(
        mailService.sendReservationConfirmation(1),
      ).rejects.toThrow();

      expect(mockMailerService.sendMail).toHaveBeenCalledTimes(3);
    }, 15000);

    it('should not retry on permanent errors', async () => {
      mockReservationRepository.findOne.mockResolvedValue(mockReservation);
      mockMailerService.sendMail.mockRejectedValue({
        message: 'Authentication failed',
        code: 535,
      });

      await expect(
        mailService.sendReservationConfirmation(1),
      ).rejects.toThrow();

      expect(mockMailerService.sendMail).toHaveBeenCalledTimes(1);
    });
  });

  describe('error classification', () => {
    beforeEach(() => {
      jest.useRealTimers();
    });

    it('should classify 4xx errors as transient', async () => {
      mockReservationRepository.findOne.mockResolvedValue(mockReservation);
      mockMailerService.sendMail.mockRejectedValue({
        message: 'Temporary failure',
        code: 450,
      });

      await expect(
        mailService.sendReservationConfirmation(1),
      ).rejects.toThrow();

      // Should have retried (3 attempts for transient)
      expect(mockMailerService.sendMail).toHaveBeenCalledTimes(3);
    }, 15000);

    it('should classify 5xx errors as permanent', async () => {
      mockReservationRepository.findOne.mockResolvedValue(mockReservation);
      mockMailerService.sendMail.mockRejectedValue({
        message: 'Internal server error',
        code: 550,
      });

      await expect(
        mailService.sendReservationConfirmation(1),
      ).rejects.toThrow();

      // No retry for permanent errors
      expect(mockMailerService.sendMail).toHaveBeenCalledTimes(1);
    });

    it('should classify network errors as transient', async () => {
      mockReservationRepository.findOne.mockResolvedValue(mockReservation);

      let callCount = 0;
      mockMailerService.sendMail.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.reject({ code: 'ETIMEDOUT', message: 'Timeout' });
        }
        return Promise.resolve(true);
      });

      await mailService.sendReservationConfirmation(1);

      expect(mockMailerService.sendMail).toHaveBeenCalledTimes(2);
    }, 15000);
  });
});
