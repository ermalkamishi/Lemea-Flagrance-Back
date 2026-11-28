import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'admin@company.com', description: 'The email of the user' })
  @IsEmail()
  @IsNotEmpty({ message: "Email is required" })
  @MaxLength(254)
  email: string;

  @ApiProperty({ example: 'SecureP@ss1', description: 'The password of the user' })
  @IsNotEmpty({ message: "Password is required" })
  @IsString()
  @MinLength(6, { message: "Password must be at least 6 characters long" })
  @MaxLength(128)
  password: string;

  @ApiProperty({ example: 'John', description: 'The first name of the user' })
  @IsNotEmpty({ message: "First name is required" })
  @IsString()
  @MinLength(4, { message: "First name must be at least 4 characters long" })
  @MaxLength(100)
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'The last name of the user' })
  @IsNotEmpty({ message: "Last name is required" })
  @IsString()
  @MinLength(4, { message: "Last name must be at least 4 characters long" })
  @MaxLength(100)
  lastName: string;
}
