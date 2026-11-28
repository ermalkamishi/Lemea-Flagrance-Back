import { IsNotEmpty, IsString, IsEmail, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateContactDto {
  @ApiProperty({ example: 'John Doe', description: 'Name of the sender' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'john@example.com', description: 'Email address of the sender' })
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(254)
  email: string;

  @ApiProperty({ example: 'Product Inquiry', description: 'Subject of the message' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  subject: string;

  @ApiProperty({ example: 'I would like to know more about...', description: 'Content of the message' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(5000)
  message: string;
}
