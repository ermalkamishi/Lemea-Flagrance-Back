import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  name_mk: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  description_mk: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  oldPrice: number | null;

  @Column({ type: 'varchar', nullable: true })
  discount: string | null;

  @Column({ default: 0 })
  stockQuantity: number;

  @Column({ default: true })
  inStock: boolean;

  @Column({ nullable: true })
  image: string;

  @Column('text', { array: true, nullable: true })
  images: string[];

  @Column({ nullable: true })
  brand: string;

  @Column({ nullable: true })
  category: string;

  @Column({ default: false })
  isPopular: boolean;

  @Column({ default: false })
  isNew: boolean;

  @Column({ type: 'decimal', precision: 3, scale: 1, default: 0 })
  rating: number;

  @Column({ default: 0 })
  reviewsCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
