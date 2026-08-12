import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';

// getJwtSecret wymaga JWT_SECRET przy konstrukcji strategii
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

describe('JwtStrategy (#78 tokenVersion)', () => {
  const makeStrategy = (findOne: jest.Mock) =>
    new JwtStrategy({ findOne } as any);

  it('akceptuje token gdy tv zgodne z użytkownikiem', async () => {
    const strategy = makeStrategy(
      jest.fn().mockResolvedValue({ id: 1, tokenVersion: 2 }),
    );
    const res = await strategy.validate({ sub: 1, email: 'a@a.pl', role: 'user', tv: 2 });
    expect(res).toEqual({ id: 1, email: 'a@a.pl', role: 'user' });
  });

  it('odrzuca token z nieaktualnym tv (po logout)', async () => {
    const strategy = makeStrategy(
      jest.fn().mockResolvedValue({ id: 1, tokenVersion: 3 }),
    );
    await expect(
      strategy.validate({ sub: 1, email: 'a@a.pl', role: 'user', tv: 2 }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('odrzuca gdy użytkownik nie istnieje', async () => {
    const strategy = makeStrategy(jest.fn().mockResolvedValue(null));
    await expect(
      strategy.validate({ sub: 999, email: 'x', role: 'user', tv: 0 }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
