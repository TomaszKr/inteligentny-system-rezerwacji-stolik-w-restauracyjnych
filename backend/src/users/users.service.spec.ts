import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from '../database/entities/User.entity';
import { UserRole } from './enums/user-role.enum';

describe('UsersService', () => {
  let service: UsersService;

  const mockRepo = {
    find: jest.fn(),
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    count: jest.fn(),
    increment: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: mockRepo },
      ],
    }).compile();
    service = module.get<UsersService>(UsersService);
  });

  describe('findAll', () => {
    it('zwraca użytkowników bez pola password', async () => {
      mockRepo.find.mockResolvedValue([
        { id: 1, email: 'a@a.pl', password: 'hash', role: 'user' },
      ]);

      const result = await service.findAll();

      expect(result[0]).not.toHaveProperty('password');
      expect(result[0]).toEqual(
        expect.objectContaining({ id: 1, email: 'a@a.pl', role: 'user' }),
      );
    });
  });

  describe('updateRole', () => {
    it('rzuca NotFoundException gdy użytkownik nie istnieje', async () => {
      mockRepo.findOneBy.mockResolvedValue(null);

      await expect(service.updateRole(999, UserRole.MANAGER)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockRepo.save).not.toHaveBeenCalled();
    });

    it('zmienia rolę i zwraca użytkownika bez hasła', async () => {
      mockRepo.findOneBy.mockResolvedValue({
        id: 2,
        email: 'b@b.pl',
        password: 'hash',
        role: 'user',
      });
      mockRepo.save.mockImplementation((u) => Promise.resolve(u));

      const result = await service.updateRole(2, UserRole.MANAGER);

      expect(mockRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ id: 2, role: UserRole.MANAGER }),
      );
      expect(result).not.toHaveProperty('password');
      expect(result.role).toBe(UserRole.MANAGER);
    });

    it('blokuje degradację własnego konta admina (#65)', async () => {
      mockRepo.findOneBy.mockResolvedValue({ id: 1, role: UserRole.ADMIN, password: 'h' });

      await expect(
        service.updateRole(1, UserRole.USER, 1),
      ).rejects.toThrow(ForbiddenException);
      expect(mockRepo.save).not.toHaveBeenCalled();
    });

    it('blokuje degradację ostatniego admina (#65)', async () => {
      mockRepo.findOneBy.mockResolvedValue({ id: 2, role: UserRole.ADMIN, password: 'h' });
      mockRepo.count.mockResolvedValue(1);

      await expect(
        service.updateRole(2, UserRole.USER, 99),
      ).rejects.toThrow(ConflictException);
      expect(mockRepo.save).not.toHaveBeenCalled();
    });

    it('pozwala zdegradować admina gdy jest inny admin', async () => {
      mockRepo.findOneBy.mockResolvedValue({ id: 2, role: UserRole.ADMIN, password: 'h' });
      mockRepo.count.mockResolvedValue(2);
      mockRepo.save.mockImplementation((u) => Promise.resolve(u));

      const result = await service.updateRole(2, UserRole.USER, 99);

      expect(result.role).toBe(UserRole.USER);
    });
  });

  describe('incrementTokenVersion (#78)', () => {
    it('inkrementuje tokenVersion', async () => {
      mockRepo.increment.mockResolvedValue({ affected: 1 });
      await service.incrementTokenVersion(5);
      expect(mockRepo.increment).toHaveBeenCalledWith({ id: 5 }, 'tokenVersion', 1);
    });

    it('rzuca NotFoundException gdy user nie istnieje', async () => {
      mockRepo.increment.mockResolvedValue({ affected: 0 });
      await expect(service.incrementTokenVersion(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('recordFailedLogin / resetFailedLogins (#81)', () => {
    it('blokuje konto po przekroczeniu limitu prób', async () => {
      process.env.LOGIN_MAX_ATTEMPTS = '3';
      await service.recordFailedLogin({ id: 1, failedLoginAttempts: 2 } as any);
      const arg = mockRepo.update.mock.calls[0][1];
      expect(arg.failedLoginAttempts).toBe(3);
      expect(arg.lockedUntil).toBeInstanceOf(Date);
    });

    it('nie blokuje przed osiągnięciem limitu', async () => {
      process.env.LOGIN_MAX_ATTEMPTS = '5';
      await service.recordFailedLogin({ id: 1, failedLoginAttempts: 1 } as any);
      const arg = mockRepo.update.mock.calls[0][1];
      expect(arg.failedLoginAttempts).toBe(2);
      expect(arg.lockedUntil).toBeNull();
    });

    it('reset zeruje licznik i odblokowuje', async () => {
      await service.resetFailedLogins(1);
      expect(mockRepo.update).toHaveBeenCalledWith(1, {
        failedLoginAttempts: 0,
        lockedUntil: null,
      });
    });
  });
});
