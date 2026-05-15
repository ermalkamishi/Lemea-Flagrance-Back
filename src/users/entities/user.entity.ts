import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional } from 'class-validator';
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  @MinLength(4, { message: "Full name must be at least 4 characters long" })
  fullName: string;

  @Column({ unique: true })
  @IsNotEmpty({ message: "Email is required" })
  @IsEmail()
  @IsString()
  email: string;

  @Column({ nullable: true, select: false })
  @IsNotEmpty({ message: "Password is required" })
  @IsString()
  @MinLength(6, { message: "Password must be at least 6 characters long" })
  password: string; // Stored hashed; excluded from default queries

  @Column()
  @IsNotEmpty({ message: "First name is required" })
  @IsString()
  @MinLength(4, { message: "First name must be at least 4 characters long" })
  firstName: string;

  @Column()
  lastName: string;

  @Column({ default: 'user' })
  role: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
