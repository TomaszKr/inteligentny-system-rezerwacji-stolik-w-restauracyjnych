import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Restaurant } from './Restaurant.entity';

@Entity()
export class Table {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  tableNumber: number;

  @Column({ type: 'integer' })
  capacity: number;

  // Ręczny status stolika ustawiany przez menedżera (#18): 'wolny' | 'zajęty'
  @Column({ type: 'varchar', length: 20, default: 'wolny' })
  status: string;

  @ManyToOne(() => Restaurant, restaurant => restaurant.tables)
  @JoinColumn({ name: 'restaurantId' })
  restaurant: Restaurant;
}