import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
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
  });
});
