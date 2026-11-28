import { PartialType, PickType, ApiPropertyOptional } from '@nestjs/swagger';
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

// Only customer contact details and status can be edited. The owner (userId),
// client IP, items and total of an existing order are never rewritten.
export class UpdateOrderDto extends PartialType(
  PickType(CreateOrderDto, ['firstName', 'lastName', 'phone', 'city', 'address', 'paymentMethod'] as const),
) {
  // Without this field the global ValidationPipe (whitelist: true) silently
  // stripped "status" from PATCH requests, so order status could never change.
  @ApiPropertyOptional({ enum: ORDER_STATUSES, example: 'confirmed' })
  @IsOptional()
  @IsIn(ORDER_STATUSES)
  status?: OrderStatus;
}
