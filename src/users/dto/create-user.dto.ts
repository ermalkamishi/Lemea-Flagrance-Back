import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty({ message: "Email is required" })
  email: string;

  @IsNotEmpty({ message: "Password is required" })
  @IsString()
  @MinLength(6, { message: "Password must be at least 6 characters long" })
  password: string;

  @IsNotEmpty({ message: "First name is required" })
  @IsString()
  @MinLength(4, { message: "First name must be at least 4 characters long" })
  firstName: string;

  @IsNotEmpty({ message: "Last name is required" })
  @IsString()
  @MinLength(4, { message: "Last name must be at least 4 characters long" })
  lastName: string;
}
