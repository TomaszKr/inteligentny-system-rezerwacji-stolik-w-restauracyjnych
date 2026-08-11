import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUser = {
    id: 1,
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    password: '$2b$10$hashedPassword',
    phone: '123456789',
    role: 'user',
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
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user if credentials are valid', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      const result = await authService.validateUser('test@example.com', 'password');

      expect(result).toEqual({
        id: 1,
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        phone: '123456789',
        role: 'user',
      });
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

      const result = await authService.register('test@example.com', 'password', 'Test User');
      
      expect(result).toEqual(mockUser);
    });
  });
});