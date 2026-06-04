import { IsNotEmpty, IsString, IsNumber, IsArray, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiPropertyOptional({ example: 'uuid-string', description: 'User ID if logged in' })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({ example: 'John', description: 'First name of the customer' })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'Last name of the customer' })
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty({ example: '+38970123456', description: 'Phone number' })
  @IsNotEmpty()
  @IsString()
  phone: string;

  @ApiProperty({ example: 'Skopje', description: 'City for delivery' })
  @IsNotEmpty()
  @IsString()
  city: string;

  @ApiProperty({ example: 'Partizanski Odredi 12', description: 'Address for delivery' })
  @IsNotEmpty()
  @IsString()
  address: string;

  @ApiProperty({ example: [{ productId: 'uuid', quantity: 2, price: 120.5 }], description: 'Array of order items' })
  @IsNotEmpty()
  @IsArray()
  items: any[];

  @ApiProperty({ example: 241.0, description: 'Total amount of the order' })
  @IsNotEmpty()
  @IsNumber()
  totalAmount: number;

  @ApiPropertyOptional({ example: 'cash_on_delivery', description: 'Payment method chosen' })
  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @ApiPropertyOptional({ example: '192.168.1.1', description: 'IP address of the client' })
  @IsOptional()
  @IsString()
  ipAddress?: string;
}
