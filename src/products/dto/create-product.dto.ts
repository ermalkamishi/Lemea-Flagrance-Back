import { IsNotEmpty, IsNumber, IsString, IsOptional, IsBoolean, IsArray } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class CreateProductDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    name_mk?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    description_mk?: string;

    @IsNotEmpty()
    @IsNumber()
    @Type(() => Number)
    price: number;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    oldPrice?: number | null;

    @IsOptional()
    @IsString()
    discount?: string | null;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    stockQuantity?: number;

    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => value === 'true' || value === true)
    inStock?: boolean;

    @IsOptional()
    @IsString()
    image?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    images?: string[];

    @IsOptional()
    @IsString()
    brand?: string;

    @IsOptional()
    @IsString()
    category?: string;

    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => value === 'true' || value === true)
    isPopular?: boolean;

    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => value === 'true' || value === true)
    isNew?: boolean;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    rating?: number;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    reviewsCount?: number;
}