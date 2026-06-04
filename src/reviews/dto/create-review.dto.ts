import { IsNotEmpty, IsString, IsInt, Min, Max, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({ example: 'Alice', description: 'Name of the reviewer' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 5, description: 'Rating from 1 to 5' })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiPropertyOptional({ example: 'Great product!', description: 'Review comment' })
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiPropertyOptional({ example: 'uuid-string', description: 'ID of the product being reviewed' })
  @IsOptional()
  @IsString()
  productId?: string;
}
