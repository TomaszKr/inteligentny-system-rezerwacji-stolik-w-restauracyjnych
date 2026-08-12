import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { TablesManagementService } from './tables-management.service';
import { Restaurant } from '../../database/entities/Restaurant.entity';
import { Table } from '../../database/entities/Table.entity';
import { Reservation } from '../../database/entities/Reservation.entity';
import { TableStatus } from '../enums/table-status.enum';

describe('TablesManagementService', () => {
  let service: TablesManagementService;

  const mockRestaurantRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOneBy: jest.fn(),
  };

  const mockTableRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOneBy: jest.fn(),
    findBy: jest.fn(),
    delete: jest.fn(),
  };

  const mockReservationRepository = {
    count: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TablesManagementService,
        {
          provide: getRepositoryToken(Restaurant),
          useValue: mockRestaurantRepository,
        },
        {
          provide: getRepositoryToken(Table),
          useValue: mockTableRepository,
        },
        {
          provide: getRepositoryToken(Reservation),
          useValue: mockReservationRepository,
        },
      ],
    }).compile();

    service = module.get<TablesManagementService>(TablesManagementService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createRestaurant', () => {
    it('should create and save a restaurant', async () => {
      const dto = {
        name: 'Test',
        address: 'ul. Testowa 1',
        phone: '+48 111 222 333',
        email: 'test@test.pl',
      };
      const created = { ...dto };
      const saved = { id: 1, ...dto };
      mockRestaurantRepository.create.mockReturnValue(created);
      mockRestaurantRepository.save.mockResolvedValue(saved);

      const result = await service.createRestaurant(dto);

      expect(mockRestaurantRepository.create).toHaveBeenCalledWith(dto);
      expect(mockRestaurantRepository.save).toHaveBeenCalledWith(created);
      expect(result).toEqual(saved);
    });
  });

  describe('createTable', () => {
    it('should save table with restaurant relation when restaurant exists', async () => {
      const dto = { tableNumber: 5, capacity: 4, restaurantId: 1 };
      mockRestaurantRepository.findOneBy.mockResolvedValue({ id: 1 });
      const created = { tableNumber: 5, capacity: 4, restaurant: { id: 1 } };
      const saved = { id: 10, ...created };
      mockTableRepository.create.mockReturnValue(created);
      mockTableRepository.save.mockResolvedValue(saved);

      const result = await service.createTable(dto);

      expect(mockRestaurantRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(mockTableRepository.create).toHaveBeenCalledWith({
        tableNumber: 5,
        capacity: 4,
        restaurant: { id: 1 },
      });
      expect(mockTableRepository.save).toHaveBeenCalledWith(created);
      expect(result).toEqual(saved);
    });

    it('should throw NotFoundException when restaurant does not exist', async () => {
      const dto = { tableNumber: 5, capacity: 4, restaurantId: 999 };
      mockRestaurantRepository.findOneBy.mockResolvedValue(null);

      await expect(service.createTable(dto)).rejects.toThrow(NotFoundException);
      expect(mockTableRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('updateTable', () => {
    it('should throw NotFoundException when table does not exist', async () => {
      mockTableRepository.findOneBy.mockResolvedValue(null);

      await expect(service.updateTable(1, { capacity: 8 })).rejects.toThrow(NotFoundException);
      expect(mockTableRepository.save).not.toHaveBeenCalled();
    });

    it('should update and save the table when it exists', async () => {
      const existing = { id: 1, tableNumber: 1, capacity: 4 };
      mockTableRepository.findOneBy.mockResolvedValue({ ...existing });
      mockTableRepository.save.mockImplementation((t) => Promise.resolve(t));

      const result = await service.updateTable(1, { capacity: 8 });

      expect(mockTableRepository.save).toHaveBeenCalledWith({ id: 1, tableNumber: 1, capacity: 8 });
      expect(result.capacity).toBe(8);
    });
  });

  describe('updateStatus (#18)', () => {
    it('zmienia status stolika gdy istnieje', async () => {
      mockTableRepository.findOneBy.mockResolvedValue({ id: 1, status: 'wolny' });
      mockTableRepository.save.mockImplementation((t) => Promise.resolve(t));

      const result = await service.updateStatus(1, TableStatus.OCCUPIED);

      expect(mockTableRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ id: 1, status: 'zajęty' }),
      );
      expect(result.status).toBe('zajęty');
    });

    it('rzuca NotFoundException gdy stolik nie istnieje', async () => {
      mockTableRepository.findOneBy.mockResolvedValue(null);

      await expect(service.updateStatus(999, TableStatus.OCCUPIED)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockTableRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('deleteTable', () => {
    it('should throw NotFoundException when table does not exist', async () => {
      mockTableRepository.findOneBy.mockResolvedValue(null);

      await expect(service.deleteTable(1)).rejects.toThrow(NotFoundException);
      expect(mockTableRepository.delete).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when table has reservations', async () => {
      mockTableRepository.findOneBy.mockResolvedValue({ id: 1 });
      mockReservationRepository.count.mockResolvedValue(2);

      await expect(service.deleteTable(1)).rejects.toThrow(ConflictException);
      expect(mockTableRepository.delete).not.toHaveBeenCalled();
    });

    it('should delete and return { deleted: true } when table has no reservations', async () => {
      mockTableRepository.findOneBy.mockResolvedValue({ id: 1 });
      mockReservationRepository.count.mockResolvedValue(0);
      mockTableRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await service.deleteTable(1);

      expect(mockTableRepository.delete).toHaveBeenCalledWith(1);
      expect(result).toEqual({ deleted: true });
    });
  });
});
