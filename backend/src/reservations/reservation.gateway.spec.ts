import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ReservationGateway } from './reservation.gateway';
import { UsersService } from '../users/users.service';

describe('ReservationGateway', () => {
  let gateway: ReservationGateway;
  const mockJwt = { verify: jest.fn() };
  const mockUsers = { findOne: jest.fn() };

  const makeClient = (auth?: string) =>
    ({
      id: 'client-1',
      handshake: { headers: auth ? { authorization: auth } : {} },
      disconnect: jest.fn(),
    }) as any;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationGateway,
        { provide: JwtService, useValue: mockJwt },
        { provide: UsersService, useValue: mockUsers },
      ],
    }).compile();
    gateway = module.get<ReservationGateway>(ReservationGateway);
    (gateway as any).server = { emit: jest.fn() };
  });

  it('menedżer z ważnym tokenem (sub) zostaje połączony', async () => {
    mockJwt.verify.mockReturnValue({ sub: 5, role: 'manager' });
    mockUsers.findOne.mockResolvedValue({ id: 5, role: 'manager' });
    const client = makeClient('Bearer tok');

    await gateway.handleConnection(client);

    expect(mockUsers.findOne).toHaveBeenCalledWith(5);
    expect(client.disconnect).not.toHaveBeenCalled();
  });

  it('brak tokenu → rozłączenie', async () => {
    const client = makeClient();
    await gateway.handleConnection(client);
    expect(client.disconnect).toHaveBeenCalled();
  });

  it('nie-menedżer → rozłączenie', async () => {
    mockJwt.verify.mockReturnValue({ sub: 9, role: 'user' });
    mockUsers.findOne.mockResolvedValue({ id: 9, role: 'user' });
    const client = makeClient('Bearer tok');

    await gateway.handleConnection(client);

    expect(client.disconnect).toHaveBeenCalled();
  });

  it('handleNewReservation emituje new-reservation gdy menedżer połączony', async () => {
    mockJwt.verify.mockReturnValue({ sub: 5, role: 'manager' });
    mockUsers.findOne.mockResolvedValue({ id: 5, role: 'manager' });
    await gateway.handleConnection(makeClient('Bearer tok'));

    await gateway.handleNewReservation({ id: 1 });

    expect((gateway as any).server.emit).toHaveBeenCalledWith('new-reservation', { id: 1 });
  });
});
