import { AdminUsersController } from './admin-users.controller';
import { UserRole } from './enums/user-role.enum';

describe('AdminUsersController', () => {
  const svc = {
    findAll: jest.fn().mockResolvedValue([]),
    updateRole: jest.fn().mockResolvedValue({ id: 1, role: 'manager' }),
  };
  const ctrl = new AdminUsersController(svc as any);
  beforeEach(() => jest.clearAllMocks());

  it('findAll deleguje', async () => {
    await ctrl.findAll();
    expect(svc.findAll).toHaveBeenCalled();
  });

  it('updateRole deleguje id, rolę i id działającego admina', async () => {
    await ctrl.updateRole(2, { role: UserRole.MANAGER } as any, { user: { id: 1 } });
    expect(svc.updateRole).toHaveBeenCalledWith(2, UserRole.MANAGER, 1);
  });
});
