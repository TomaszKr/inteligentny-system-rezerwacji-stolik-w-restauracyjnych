import { AdminTablesController } from './admin-tables.controller';
import { AdminRestaurantsController } from './admin-restaurants.controller';
import { TableStatus } from '../enums/table-status.enum';

describe('AdminTablesController', () => {
  const svc = {
    createTable: jest.fn().mockResolvedValue({ id: 1 }),
    findTables: jest.fn().mockResolvedValue([]),
    updateTable: jest.fn().mockResolvedValue({ id: 1 }),
    updateStatus: jest.fn().mockResolvedValue({ id: 1 }),
    deleteTable: jest.fn().mockResolvedValue({ deleted: true }),
  };
  const ctrl = new AdminTablesController(svc as any);
  beforeEach(() => jest.clearAllMocks());

  it('create deleguje do serwisu', async () => {
    await ctrl.create({ tableNumber: 1, capacity: 4, restaurantId: 1 } as any);
    expect(svc.createTable).toHaveBeenCalled();
  });
  it('findAll przekazuje restaurantId jako number', async () => {
    await ctrl.findAll('3');
    expect(svc.findTables).toHaveBeenCalledWith(3);
  });
  it('findAll bez param → undefined', async () => {
    await ctrl.findAll(undefined);
    expect(svc.findTables).toHaveBeenCalledWith(undefined);
  });
  it('update deleguje', async () => {
    await ctrl.update(1, { capacity: 6 } as any);
    expect(svc.updateTable).toHaveBeenCalledWith(1, { capacity: 6 });
  });
  it('updateStatus deleguje', async () => {
    await ctrl.updateStatus(1, { status: TableStatus.OCCUPIED } as any);
    expect(svc.updateStatus).toHaveBeenCalledWith(1, TableStatus.OCCUPIED);
  });
  it('remove deleguje', async () => {
    await ctrl.remove(1);
    expect(svc.deleteTable).toHaveBeenCalledWith(1);
  });
});

describe('AdminRestaurantsController', () => {
  const svc = {
    createRestaurant: jest.fn().mockResolvedValue({ id: 1 }),
    findRestaurants: jest.fn().mockResolvedValue([]),
  };
  const ctrl = new AdminRestaurantsController(svc as any);
  beforeEach(() => jest.clearAllMocks());

  it('create deleguje', async () => {
    await ctrl.create({ name: 'X' } as any);
    expect(svc.createRestaurant).toHaveBeenCalled();
  });
  it('findAll deleguje', async () => {
    await ctrl.findAll();
    expect(svc.findRestaurants).toHaveBeenCalled();
  });
});
