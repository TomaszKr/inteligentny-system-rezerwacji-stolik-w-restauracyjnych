import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_GUARD } from '@nestjs/core';
import { User } from './database/entities/User.entity';
import { Reservation } from './database/entities/Reservation.entity';
import { Table } from './database/entities/Table.entity';
import { Restaurant } from './database/entities/Restaurant.entity';
import { AuthModule } from './auth/auth.module';
import { ReservationsModule } from './reservations/reservations.module';
import { TablesModule } from './tables/tables.module';
import { MailModule } from './mail/mail.module';
import { RemindersModule } from './reminders/reminders.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      username: process.env.DB_USER || 'appuser',
      password: process.env.DB_PASSWORD || 'changeme',
      database: process.env.DB_NAME || 'appdb',
      entities: [User, Reservation, Table, Restaurant],
      synchronize: true,
    }),
    // Rate limiting — domyślny (prywatny) limit dla endpointów uwierzytelnionych.
    // Publiczne endpointy (auth) mają ostrzejszy limit przez @Throttle w kontrolerze.
    ThrottlerModule.forRoot([
      {
        ttl: parseInt(process.env.RATE_LIMIT_TTL, 10) || 60000,
        limit: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
      },
    ]),
    ScheduleModule.forRoot(),
    AuthModule,
    ReservationsModule,
    TablesModule,
    MailModule,
    RemindersModule,
  ],
  controllers: [],
  providers: [
    // Globalny guard rate limitingu — zwraca 429 po przekroczeniu limitu
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}