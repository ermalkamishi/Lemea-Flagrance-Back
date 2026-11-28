import { IsNotEmpty, IsString, IsInt, Min, Max, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({ example: 'Alice', description: 'Name of the reviewer' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
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
  @MaxLength(3000)
  comment?: string;

  @ApiPropertyOptional({ example: 'uuid-string', description: 'ID of the product being reviewed' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  productId?: string;
}
