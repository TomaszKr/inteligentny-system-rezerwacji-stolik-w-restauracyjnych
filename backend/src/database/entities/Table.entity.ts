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

  @ManyToOne(() => Restaurant, restaurant => restaurant.tables)
  @JoinColumn({ name: 'restaurantId' })
  restaurant: Restaurant;
}