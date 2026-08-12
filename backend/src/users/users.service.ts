import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../database/entities/User.entity';
import { UserRole } from './enums/user-role.enum';

export type SafeUser = Omit<User, 'password'>;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findOne(id: number): Promise<User | undefined> {
    return this.usersRepository.findOneBy({ id });
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.usersRepository.findOneBy({ email });
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.usersRepository.create(userData);
    return this.usersRepository.save(user);
  }

  /** Lista użytkowników bez pola password (dla panelu admina). */
  async findAll(): Promise<SafeUser[]> {
    const users = await this.usersRepository.find();
    return users.map(({ password: _pw, ...rest }) => rest);
  }

  /** Zmiana roli użytkownika (admin nadaje role pracownikom). */
  async updateRole(id: number, role: UserRole): Promise<SafeUser> {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.role = role;
    const saved = await this.usersRepository.save(user);
    const { password: _pw, ...rest } = saved;
    return rest;
  }
}