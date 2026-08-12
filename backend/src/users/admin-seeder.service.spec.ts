import { AdminSeederService } from './admin-seeder.service';
import { UserRole } from './enums/user-role.enum';

describe('AdminSeederService', () => {
  const makeService = (findByEmail: jest.Mock, create: jest.Mock) =>
    new AdminSeederService({ findByEmail, create } as any);

  const OLD_ENV = process.env;
  beforeEach(() => {
    process.env = { ...OLD_ENV, ADMIN_PASSWORD: 'silneHaslo123', ADMIN_EMAIL: 'admin@x.pl' };
  });
  afterAll(() => {
    process.env = OLD_ENV;
  });

  it('tworzy konto admina gdy nie istnieje i ADMIN_PASSWORD ustawione', async () => {
    const findByEmail = jest.fn().mockResolvedValue(null);
    const create = jest.fn().mockResolvedValue({ id: 1 });
    const service = makeService(findByEmail, create);

    await service.onModuleInit();

    expect(create).toHaveBeenCalledTimes(1);
    const arg = create.mock.calls[0][0];
    expect(arg.role).toBe(UserRole.ADMIN);
    expect(typeof arg.password).toBe('string');
    expect(arg.password).not.toBe('silneHaslo123'); // zahaszowane
  });

  it('pomija tworzenie gdy admin już istnieje', async () => {
    const findByEmail = jest.fn().mockResolvedValue({ id: 1, role: 'admin' });
    const create = jest.fn();
    const service = makeService(findByEmail, create);

    await service.onModuleInit();

    expect(create).not.toHaveBeenCalled();
  });

  it('pomija seed gdy brak ADMIN_PASSWORD (#63)', async () => {
    delete process.env.ADMIN_PASSWORD;
    const findByEmail = jest.fn();
    const create = jest.fn();
    const service = makeService(findByEmail, create);

    await service.onModuleInit();

    expect(findByEmail).not.toHaveBeenCalled();
    expect(create).not.toHaveBeenCalled();
  });

  it('pomija seed gdy ADMIN_PASSWORD za krótkie', async () => {
    process.env.ADMIN_PASSWORD = 'krotkie';
    const create = jest.fn();
    const service = makeService(jest.fn(), create);

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
