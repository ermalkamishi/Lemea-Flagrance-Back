import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin@company.com', description: 'The email of the user' })
  @IsEmail()
  @IsNotEmpty({ message: "Email is required" })
  email: string;

  @ApiProperty({ example: 'SecureP@ss1', description: 'The password of the user' })
  @IsNotEmpty({ message: "Password is required" })
  @IsString()
  password: string;
}
