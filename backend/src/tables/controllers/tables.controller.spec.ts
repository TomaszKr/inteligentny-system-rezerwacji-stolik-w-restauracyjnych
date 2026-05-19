import { Test, TestingModule } from '@nestjs/testing';
import { TablesController } from './tables.controller';
import { TablesAvailabilityService } from '../services/tables-availability.service';
import { CheckAvailabilityDto } from '../dto/check-availability.dto';

describe('TablesController', () => {
  let controller: TablesController;

  const mockTablesAvailabilityService = {
    checkAvailability: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TablesController],
      providers: [
        {
          provide: TablesAvailabilityService,
          useValue: mockTablesAvailabilityService,
        },
      ],
    }).compile();

    controller = module.get<TablesController>(TablesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('checkAvailability', () => {
    it('should return available tables for a given time slot and guests count', async () => {
      const mockResult = [
        { id: 1, tableNumber: 1, capacity: 4 },
        { id: 2, tableNumber: 2, capacity: 6 }
      ];

      mockTablesAvailabilityService.checkAvailability.mockResolvedValue(mockResult);

      const dto: CheckAvailabilityDto = {
        restaurantId: 1,
        reservationTime: new Date('2026-05-20T19:00:00'),
        guests: 4
      };

      const result = await controller.checkAvailability(dto);

      expect(result).toBe(mockResult);
      expect(mockTablesAvailabilityService.checkAvailability).toHaveBeenCalledWith(dto);
    });
  });
});