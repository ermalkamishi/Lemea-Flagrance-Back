import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  name_mk: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  description_mk: string;

  @CreateDateColumn()
  createdAt: Date;
}
