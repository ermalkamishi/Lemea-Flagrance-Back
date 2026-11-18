import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import { CreateOrderDto } from './create-order.dto';
import type { OrderStatus } from '../entities/order.entity';

export const ORDER_STATUSES: OrderStatus[] = [
  'pending',
  'confirmed',
  'shipped',
  'delivered',
  'cancelled',
];

export class UpdateOrderDto extends PartialType(CreateOrderDto) {
  // Without this field the global ValidationPipe (whitelist: true) silently
  // stripped "status" from PATCH requests, so order status could never change.
  @ApiPropertyOptional({ enum: ORDER_STATUSES, example: 'confirmed' })
  @IsOptional()
  @IsIn(ORDER_STATUSES)
  status?: OrderStatus;
}
