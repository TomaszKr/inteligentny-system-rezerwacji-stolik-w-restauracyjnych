import { Test, TestingModule } from '@nestjs/testing';
import { TablesAvailabilityService } from './tables-availability.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Table } from '../../database/entities/Table.entity';
import { Reservation } from '../../database/entities/Reservation.entity';
import { DataSource, QueryRunner } from 'typeorm';

describe('TablesAvailabilityService', () => {
  let service: TablesAvailabilityService;

  const mockTableRepository = {
    find: jest.fn(),
  };

  const mockReservationRepository = {
    find: jest.fn(),
  };

  const mockDataSource = {
    createQueryRunner: jest.fn(),
  };

  const mockQueryRunner = {
    connect: jest.fn(),
    startTransaction: jest.fn(),
    manager: {
      createQueryBuilder: jest.fn(),
    },
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
  };

  beforeEach(async () => {
    mockDataSource.createQueryRunner.mockReturnValue(mockQueryRunner);
    mockQueryRunner.manager.createQueryBuilder.mockReturnValue({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      leftJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([
        { id: 1, tableNumber: 1, capacity: 4 },
        { id: 2, tableNumber: 2, capacity: 6 }
      ])
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TablesAvailabilityService,
        {
          provide: getRepositoryToken(Table),
          useValue: mockTableRepository,
        },
        {
          provide: getRepositoryToken(Reservation),
          useValue: mockReservationRepository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<TablesAvailabilityService>(TablesAvailabilityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('checkAvailability', () => {
    it('should return available tables for a given time slot and guests count with optimized query', async () => {
      const dto = {
        restaurantId: 1,
        reservationTime: new Date('2026-05-20T19:00:00'),
        guests: 4
      };

      const result = await service.checkAvailability(dto);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(1);
      expect(result[0].tableNumber).toBe(1);
      expect(result[0].capacity).toBe(4);
      expect(result[1].id).toBe(2);
      expect(result[1].tableNumber).toBe(2);
      expect(result[1].capacity).toBe(6);
    });
  });
});