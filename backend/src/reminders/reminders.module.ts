import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reservation } from '../database/entities/Reservation.entity';
import { MailModule } from '../mail/mail.module';
import { RemindersService } from './reminders.service';

@Module({
  imports: [TypeOrmModule.forFeature([Reservation]), MailModule],
  providers: [RemindersService],
  exports: [RemindersService],
})
export class RemindersModule {}
