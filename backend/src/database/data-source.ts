import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from './entities/User.entity';
import { Reservation } from './entities/Reservation.entity';
import { Table } from './entities/Table.entity';
import { Restaurant } from './entities/Restaurant.entity';

/**
 * Samodzielny DataSource dla TypeORM CLI (migration:generate/run/revert) (#92).
 * Runtime aplikacji używa TypeOrmModule.forRoot w app.module.ts — tu utrzymujemy
 * spójne parametry połączenia i ścieżki, żeby CLI operowało na tej samej bazie.
 */
export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  username: process.env.DB_USER || 'appuser',
  password: process.env.DB_PASSWORD || 'changeme',
  database: process.env.DB_NAME || 'appdb',
  entities: [User, Reservation, Table, Restaurant],
  migrations: [__dirname + '/migrations/*.{ts,js}'],
  synchronize: false,
});
