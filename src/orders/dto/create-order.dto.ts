import { IsNotEmpty, IsString, IsNumber, IsArray, IsOptional, ArrayNotEmpty, ArrayMaxSize, Min, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOrderDto {
  // Ignored on create: the server sets userId from the JWT. Kept so old clients don't get a 400.
  @ApiPropertyOptional({ example: 'uuid-string', description: 'Ignored – set from the auth token' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  userId?: string;

  @ApiProperty({ example: 'John', description: 'First name of the customer' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'Last name of the customer' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  lastName: string;

  @ApiProperty({ example: '+38970123456', description: 'Phone number' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(40)
  phone: string;

  @ApiProperty({ example: 'Skopje', description: 'City for delivery' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  city: string;

  @ApiProperty({ example: 'Partizanski Odredi 12', description: 'Address for delivery' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  address: string;

  @ApiProperty({ example: [{ productId: 'uuid', quantity: 2, price: 120.5 }], description: 'Array of order items' })
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(50)
  items: any[];

  @ApiProperty({ example: 241.0, description: 'Total amount of the order' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  totalAmount: number;

  @ApiPropertyOptional({ example: 'cash_on_delivery', description: 'Payment method chosen' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  paymentMethod?: string;

  @ApiPropertyOptional({ example: '192.168.1.1', description: 'IP address of the client' })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  ipAddress?: string;
}
