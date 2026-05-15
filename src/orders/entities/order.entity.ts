import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { IsArray, IsNotEmpty, IsNumber, IsString, MinLength } from 'class-validator';

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: true })
  userId: string;

  @Column()
  @IsNotEmpty({ message: "First name is required" })
  @IsString()
  @MinLength(2, { message: "First name must be at least 2 characters long" })
  firstName: string;

  @Column()
  @IsNotEmpty({ message: "Last name is required" })
  @IsString()
  @MinLength(2, { message: "Last name must be at least 2 characters long" })
  lastName: string;

  @Column()
  @IsNotEmpty({ message: "Phone is required" })
  @IsString()
  @MinLength(9, { message: "Phone must be at least 9 characters long" })
  phone: string;

  @Column()
  @IsNotEmpty({ message: "City is required" })
  @IsString()
  @MinLength(3, { message: "City must be at least 3 characters long" })
  city: string;

  @Column()
  @IsNotEmpty({ message: "Address is required" })
  @IsString()
  @MinLength(10, { message: "Address must be at least 10 characters long" })
  address: string;

  @Column('jsonb')
  @IsNotEmpty({ message: "Items are required" })
  @IsArray({ message: "Items must be an array" })
  items: any[];

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  @IsNotEmpty({ message: "Total amount is required" })
  @IsNumber()
  totalAmount: number;

  @Column({ default: 'cod' })
  @IsNotEmpty({ message: "Payment method is required" })
  @IsString()
  paymentMethod: string;

  @Column({ default: 'pending' })
  status: OrderStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
