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

  // Czy wysłano przypomnienie 2h przed wizytą (#21) — zapobiega duplikatom
  @Column({ type: 'boolean', default: false })
  reminderSent: boolean;

  @ManyToOne(() => User, user => user.id)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Table, table => table.id)
  @JoinColumn({ name: 'tableId' })
  table: Table;
}