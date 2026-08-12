// Virtual mock: '@nestjs-modules/mailer' nie jest zainstalowany w tym środowisku
// (transitywna zależność MailService), a node_modules jest tylko do odczytu.
jest.mock(
  '@nestjs-modules/mailer',
  () => ({ MailerService: class {} }),
  { virtual: true },
);

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Reservation } from '../database/entities/Reservation.entity';
import { ReservationService, CreateReservationInput } from './reservation.service';
import { ReservationGateway } from './reservation.gateway';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';

describe('ReservationService', () => {
  let service: ReservationService;

  const mockRepo = {
    create: jest.fn((x) => x),
    findOne: jest.fn().mockResolvedValue({ id: 1 }),
    findOneBy: jest.fn(),
    save: jest.fn((x) => Promise.resolve(x)),
  };

  const mockDataSource = {
    createQueryRunner: jest.fn(),
  };

  const mockGateway = {
    handleNewReservation: jest.fn(),
  };

  const mockUsersService = {};

  const mockMailService = {
    sendReservationConfirmation: jest.fn().mockResolvedValue(undefined),
  };

  const mockQueryRunner = {
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    manager: {
      findOne: jest.fn(),
      save: jest.fn((x) => Promise.resolve({ id: 1, ...x })),
      createQueryBuilder: jest.fn(),
    },
  };

  const collisionQB = (existing: any) => ({
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getOne: jest.fn().mockResolvedValue(existing),
  });

  const futureDate = new Date(Date.now() + 86400000);

  beforeEach(async () => {
    jest.clearAllMocks();
    mockDataSource.createQueryRunner.mockReturnValue(mockQueryRunner);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationService,
        {
          provide: getRepositoryToken(Reservation),
          useValue: mockRepo,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
        {
          provide: ReservationGateway,
          useValue: mockGateway,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: MailService,
          useValue: mockMailService,
        },
      ],
    }).compile();

    service = module.get<ReservationService>(ReservationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('(a) tworzy rezerwację z relacją table i commituje transakcję', async () => {
    mockQueryRunner.manager.findOne.mockResolvedValue({ id: 5 });
    mockQueryRunner.manager.createQueryBuilder.mockReturnValue(collisionQB(null));

    const input: CreateReservationInput = {
      reservationTime: futureDate,
      guests: 4,
      tableId: 5,
      user: { id: 1 },
    };

    await service.create(input);

    expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
    expect(mockQueryRunner.manager.save).toHaveBeenCalledWith(
      expect.objectContaining({ table: { id: 5 } }),
    );
    expect(mockRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ table: { id: 5 } }),
    );
  });

  it('(a2) po udanej rezerwacji wysyła potwierdzenie e-mail do klienta (#14)', async () => {
    mockQueryRunner.manager.findOne.mockResolvedValue({ id: 5 });
    mockQueryRunner.manager.createQueryBuilder.mockReturnValue(collisionQB(null));
    // fullReservation ładowany po commicie (repo.findOne) — id trafia do maila
    mockRepo.findOne.mockResolvedValueOnce({ id: 1 });

    const input: CreateReservationInput = {
      reservationTime: futureDate,
      guests: 4,
      tableId: 5,
      user: { id: 1 },
    };

    await service.create(input);

    expect(mockMailService.sendReservationConfirmation).toHaveBeenCalledWith(1);
  });

  it('(b) rzuca ConflictException przy kolizji i nie zapisuje', async () => {
    mockQueryRunner.manager.findOne.mockResolvedValue({ id: 5 });
    mockQueryRunner.manager.createQueryBuilder.mockReturnValue(
      collisionQB({ id: 99 }),
    );

    const input: CreateReservationInput = {
      reservationTime: futureDate,
      guests: 4,
      tableId: 5,
      user: { id: 1 },
    };

    await expect(service.create(input)).rejects.toThrow(ConflictException);
    expect(mockQueryRunner.manager.save).not.toHaveBeenCalled();
    expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
  });

  it('(c) różne stoliki w tym samym czasie są dozwolone', async () => {
    mockQueryRunner.manager.findOne
      .mockResolvedValueOnce({ id: 5 })
      .mockResolvedValueOnce({ id: 6 });

    const qb5 = collisionQB(null);
    const qb6 = collisionQB(null);
    mockQueryRunner.manager.createQueryBuilder
      .mockReturnValueOnce(qb5)
      .mockReturnValueOnce(qb6);

    const input5: CreateReservationInput = {
      reservationTime: futureDate,
      guests: 4,
      tableId: 5,
      user: { id: 1 },
    };
    const input6: CreateReservationInput = {
      reservationTime: futureDate,
      guests: 4,
      tableId: 6,
      user: { id: 1 },
    };

    await expect(service.create(input5)).resolves.toBeDefined();
    await expect(service.create(input6)).resolves.toBeDefined();

    expect(qb5.where).toHaveBeenCalledWith(expect.anything(), { tableId: 5 });
    expect(qb6.where).toHaveBeenCalledWith(expect.anything(), { tableId: 6 });
  });

  it('(d) rzuca NotFoundException gdy stolik nie istnieje', async () => {
    mockQueryRunner.manager.findOne.mockResolvedValue(null);

    const input: CreateReservationInput = {
      reservationTime: futureDate,
      guests: 4,
      tableId: 999,
      user: { id: 1 },
    };

    await expect(service.create(input)).rejects.toThrow(NotFoundException);
    expect(mockQueryRunner.manager.createQueryBuilder).not.toHaveBeenCalled();
    expect(mockQueryRunner.manager.save).not.toHaveBeenCalled();
    expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
  });

  describe('update', () => {
    it('rzuca NotFoundException gdy rezerwacja nie istnieje (404, nie 500)', async () => {
      mockRepo.findOneBy.mockResolvedValueOnce(null);

      await expect(
        service.update(999, { status: 'Anulowana' }),
      ).rejects.toThrow(NotFoundException);
      expect(mockRepo.save).not.toHaveBeenCalled();
    });

    it('aktualizuje istniejącą rezerwację', async () => {
      mockRepo.findOneBy.mockResolvedValueOnce({ id: 1, status: 'W toku' });

      const result = await service.update(1, { status: 'Zrealizowana' });

      expect(mockRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ id: 1, status: 'Zrealizowana' }),
      );
      expect(result).toEqual(expect.objectContaining({ status: 'Zrealizowana' }));
    });
  });
});
