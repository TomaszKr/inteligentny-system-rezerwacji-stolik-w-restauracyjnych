import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../database/entities/User.entity';
import { UsersService } from './users.service';
import { AdminUsersController } from './admin-users.controller';
import { AdminSeederService } from './admin-seeder.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [AdminUsersController],
  providers: [UsersService, AdminSeederService],
  exports: [UsersService],
})
export class UsersModule {}
