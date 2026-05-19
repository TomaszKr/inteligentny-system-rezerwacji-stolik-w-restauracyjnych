import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User.entity';
import { Table } from './Table.entity';

@Entity()
export class Reservation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'timestamp' })
  reservationTime: Date;

  @Column({ type: 'integer' })
  guests: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  status: string;

  @ManyToOne(() => User, user => user.id)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Table, table => table.id)
  @JoinColumn({ name: 'tableId' })
  table: Table;
}