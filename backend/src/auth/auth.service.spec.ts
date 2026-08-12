import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;
  let mailService: MailService;

  const mockUser = {
    id: 1,
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    password: '$2b$10$hashedPassword',
    phone: '123456789',
    role: 'user',
    tokenVersion: 0,
    failedLoginAttempts: 0,
    lockedUntil: null,
    emailVerified: true,
    verificationToken: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            create: jest.fn(),
            incrementTokenVersion: jest.fn().mockResolvedValue(undefined),
            recordFailedLogin: jest.fn().mockResolvedValue(undefined),
            resetFailedLogins: jest.fn().mockResolvedValue(undefined),
            findByVerificationToken: jest.fn(),
            markEmailVerified: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
        {
          provide: MailService,
          useValue: {
            sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
    mailService = module.get<MailService>(MailService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user if credentials are valid', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      const result = await authService.validateUser('test@example.com', 'password');

      expect(result).toEqual(
        expect.objectContaining({
          id: 1,
          email: 'test@example.com',
          role: 'user',
        }),
      );
      expect(result).not.toHaveProperty('password');
    });

    it('rzuca UnauthorizedException gdy konto zablokowane (#81)', async () => {
      const locked = { ...mockUser, lockedUntil: new Date(Date.now() + 60000) };
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(locked as any);

      await expect(
        authService.validateUser('test@example.com', 'password'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('rejestruje nieudaną próbę przy złym haśle (#81)', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(mockUser as any);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);
      const spy = jest.spyOn(usersService, 'recordFailedLogin');

      const result = await authService.validateUser('test@example.com', 'zle');

      expect(result).toBeNull();
      expect(spy).toHaveBeenCalled();
    });

    it('should return null if user not found', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(null);

      const result = await authService.validateUser('nonexistent@example.com', 'password');
      
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return a JWT token', async () => {
      jest.spyOn(jwtService, 'sign').mockReturnValue('fake-jwt-token');

      const result = await authService.login(mockUser);
      
      expect(result).toEqual({
        access_token: 'fake-jwt-token'
      });
    });
  });

  describe('register', () => {
    it('should create a new user with hashed password', async () => {
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword' as never);
      jest.spyOn(usersService, 'create').mockResolvedValue(mockUser);

      const result = await authService.register('test@example.com', 'password', 'Test', 'User', '+48123456789');

      expect(result).toEqual(
        expect.objectContaining({ id: 1, email: 'test@example.com', role: 'user' }),
      );
      // create wywołane z tokenem weryfikacyjnym i emailVerified=false (#81)
      expect(usersService.create).toHaveBeenCalledWith(
        expect.objectContaining({ emailVerified: false, verificationToken: expect.any(String) }),
      );
    });

    it('should not expose the password in the response', async () => {
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword' as never);
      jest.spyOn(usersService, 'create').mockResolvedValue(mockUser);

      const result = await authService.register('test@example.com', 'password', 'Test', 'User', '+48123456789');

      expect(result).not.toHaveProperty('password');
    });

    it('wysyła e-mail weryfikacyjny (#81)', async () => {
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword' as never);
      jest.spyOn(usersService, 'create').mockResolvedValue(mockUser);
      const mailSpy = jest.spyOn(mailService, 'sendVerificationEmail');

      await authService.register('test@example.com', 'password', 'Test', 'User', '+48123456789');

      expect(mailSpy).toHaveBeenCalled();
    });

    it('rzuca ConflictException gdy email już istnieje (#68)', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(mockUser as any);
      const createSpy = jest.spyOn(usersService, 'create');

      await expect(
        authService.register('test@example.com', 'password', 'Test', 'User', '+48123456789'),
      ).rejects.toThrow(ConflictException);
      expect(createSpy).not.toHaveBeenCalled();
    });
  });

  describe('logout (#78)', () => {
    it('inkrementuje tokenVersion użytkownika', async () => {
      const spy = jest.spyOn(usersService, 'incrementTokenVersion');
      const result = await authService.logout(7);
      expect(spy).toHaveBeenCalledWith(7);
      expect(result).toEqual({ success: true });
    });
  });

  describe('weryfikacja e-mail (#81)', () => {
    it('odrzuca logowanie niezweryfikowanego konta', async () => {
      const unverified = { ...mockUser, emailVerified: false };
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(unverified as any);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      await expect(
        authService.validateUser('test@example.com', 'password'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('verifyEmail oznacza konto jako zweryfikowane', async () => {
      jest.spyOn(usersService, 'findByVerificationToken').mockResolvedValue({ id: 3 } as any);
      const spy = jest.spyOn(usersService, 'markEmailVerified');

      const result = await authService.verifyEmail('tok123');

      expect(spy).toHaveBeenCalledWith(3);
      expect(result).toEqual({ verified: true });
    });

    it('verifyEmail z nieprawidłowym tokenem → BadRequest', async () => {
      jest.spyOn(usersService, 'findByVerificationToken').mockResolvedValue(undefined);
      await expect(authService.verifyEmail('zly')).rejects.toThrow(BadRequestException);
    });
  });
});