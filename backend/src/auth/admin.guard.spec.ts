import { AdminGuard } from './admin.guard';

describe('AdminGuard', () => {
  const guard = new AdminGuard();

  const ctx = (user: any) =>
    ({
      switchToHttp: () => ({ getRequest: () => ({ user }) }),
    }) as any;

  it('przepuszcza użytkownika z rolą admin', () => {
    expect(guard.canActivate(ctx({ id: 1, role: 'admin' }))).toBe(true);
  });

  it('odrzuca nie-admina', () => {
    expect(guard.canActivate(ctx({ id: 2, role: 'user' }))).toBe(false);
  });

  it('odrzuca brak użytkownika', () => {
    expect(guard.canActivate(ctx(undefined))).toBeFalsy();
  });
});
