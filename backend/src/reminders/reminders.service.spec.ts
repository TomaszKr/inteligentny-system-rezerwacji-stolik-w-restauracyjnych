import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RemindersService } from './reminders.service';
import { Reservation } from '../database/entities/Reservation.entity';
import { MailService } from '../mail/mail.service';
import { ReservationStatus } from '../reservations/enums/reservation-status.enum';

describe('RemindersService', () => {
  let service: RemindersService;

  const mockRepo = {
    find: jest.fn(),
    save: jest.fn((r) => Promise.resolve(r)),
  };
  const mockMail = {
    sendReservationReminder: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RemindersService,
        { provide: getRepositoryToken(Reservation), useValue: mockRepo },
        { provide: MailService, useValue: mockMail },
      ],
    }).compile();
    service = module.get<RemindersService>(RemindersService);
  });

  it('wysyła przypomnienie i oznacza reminderSent dla należnej rezerwacji', async () => {
    mockRepo.find.mockResolvedValue([{ id: 1, status: null, reminderSent: false }]);

    const sent = await service.sendDueReminders();

    expect(mockMail.sendReservationReminder).toHaveBeenCalledWith(1);
    expect(mockRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ id: 1, reminderSent: true }),
    );
    expect(sent).toBe(1);
  });

  it('pomija anulowane rezerwacje', async () => {
    mockRepo.find.mockResolvedValue([
      { id: 2, status: ReservationStatus.CANCELLED, reminderSent: false },
    ]);

    const sent = await service.sendDueReminders();

    expect(mockMail.sendReservationReminder).not.toHaveBeenCalled();
    expect(mockRepo.save).not.toHaveBeenCalled();
    expect(sent).toBe(0);
  });

  it('nie oznacza reminderSent gdy wysyłka zawiedzie', async () => {
    mockRepo.find.mockResolvedValue([{ id: 3, status: null, reminderSent: false }]);
    mockMail.sendReservationReminder.mockRejectedValueOnce(new Error('SMTP down'));

    const sent = await service.sendDueReminders();

    expect(mockRepo.save).not.toHaveBeenCalled();
    expect(sent).toBe(0);
  });
});
