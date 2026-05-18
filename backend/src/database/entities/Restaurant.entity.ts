import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Table } from './Table.entity';

@Entity()
export class Restaurant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 255 })
  address: string;

  @Column({ length: 100 })
  phone: string;

  @Column({ length: 255 })
  email: string;

  @OneToMany(() => Table, table => table.restaurant)
  tables: Table[];
}