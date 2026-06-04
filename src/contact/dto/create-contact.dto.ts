import { IsNotEmpty, IsString, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateContactDto {
  @ApiProperty({ example: 'John Doe', description: 'Name of the sender' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'john@example.com', description: 'Email address of the sender' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Product Inquiry', description: 'Subject of the message' })
  @IsNotEmpty()
  @IsString()
  subject: string;

  @ApiProperty({ example: 'I would like to know more about...', description: 'Content of the message' })
  @IsNotEmpty()
  @IsString()
  message: string;
}
