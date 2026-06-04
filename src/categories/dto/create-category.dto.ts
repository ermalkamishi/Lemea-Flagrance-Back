import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Perfumes', description: 'The name of the category in English' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Парфеми', description: 'The name of the category in Macedonian' })
  @IsOptional()
  @IsString()
  name_mk?: string;

  @ApiPropertyOptional({ example: 'Collection of premium perfumes', description: 'Description in English' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'Колекција на премиум парфеми', description: 'Description in Macedonian' })
  @IsOptional()
  @IsString()
  description_mk?: string;
}
