import { ReservationsController } from './reservations.controller';
import { AdminReservationsController } from './admin-reservations.controller';

describe('ReservationsController', () => {
  const svc = {
    create: jest.fn().mockResolvedValue({ id: 1 }),
    cancel: jest.fn().mockResolvedValue({ id: 1, status: 'Anulowana' }),
  };
  const ctrl = new ReservationsController(svc as any);
  beforeEach(() => jest.clearAllMocks());

  it('create przekazuje dane + user z req', async () => {
    const dto = { reservationTime: new Date(), guests: 2, tableId: 5 } as any;
    await ctrl.create(dto, { user: { id: 42 } });
    expect(svc.create).toHaveBeenCalledWith(
      expect.objectContaining({ guests: 2, tableId: 5, user: { id: 42 } }),
    );
  });

  it('cancel deleguje z id i userId', async () => {
    await ctrl.cancel(7, { user: { id: 42 } });
    expect(svc.cancel).toHaveBeenCalledWith(7, 42);
  });
});

describe('AdminReservationsController', () => {
  const svc = {
    findAll: jest.fn().mockResolvedValue([]),
    update: jest.fn().mockResolvedValue({ id: 1 }),
  };
  const ctrl = new AdminReservationsController(svc as any);
  beforeEach(() => jest.clearAllMocks());

  it('findAll przekazuje date', async () => {
    await ctrl.findAll('2026-12-24');
    expect(svc.findAll).toHaveBeenCalledWith('2026-12-24');
  });

  it('updateStatus deleguje status', async () => {
    await ctrl.updateStatus(3, { status: 'Zrealizowana' } as any);
    expect(svc.update).toHaveBeenCalledWith(3, { status: 'Zrealizowana' });
  });
});
