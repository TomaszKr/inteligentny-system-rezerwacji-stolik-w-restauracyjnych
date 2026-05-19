import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './database/entities/User.entity';
import { Reservation } from './database/entities/Reservation.entity';
import { Table } from './database/entities/Table.entity';
import { Restaurant } from './database/entities/Restaurant.entity';
import { AuthModule } from './auth/auth.module';
import { ReservationsModule } from './reservations/reservations.module';

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
    AuthModule,
    ReservationsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}