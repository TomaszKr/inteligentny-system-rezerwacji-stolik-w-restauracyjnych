import { AdminSeederService } from './admin-seeder.service';
import { UserRole } from './enums/user-role.enum';

describe('AdminSeederService', () => {
  const makeService = (findByEmail: jest.Mock, create: jest.Mock) =>
    new AdminSeederService({ findByEmail, create } as any);

  it('tworzy konto admina gdy nie istnieje', async () => {
    const findByEmail = jest.fn().mockResolvedValue(null);
    const create = jest.fn().mockResolvedValue({ id: 1 });
    const service = makeService(findByEmail, create);

    await service.onModuleInit();

    expect(create).toHaveBeenCalledTimes(1);
    const arg = create.mock.calls[0][0];
    expect(arg.role).toBe(UserRole.ADMIN);
    expect(typeof arg.password).toBe('string');
    expect(arg.password).not.toBe('admin12345'); // zahaszowane
  });

  it('pomija tworzenie gdy admin już istnieje', async () => {
    const findByEmail = jest.fn().mockResolvedValue({ id: 1, role: 'admin' });
    const create = jest.fn();
    const service = makeService(findByEmail, create);

    await service.onModuleInit();

    expect(create).not.toHaveBeenCalled();
  });

  it('nie rzuca gdy usersService zawiedzie (boot nie pada)', async () => {
    const findByEmail = jest.fn().mockRejectedValue(new Error('db down'));
    const create = jest.fn();
    const service = makeService(findByEmail, create);

    await expect(service.onModuleInit()).resolves.toBeUndefined();
  });
});
