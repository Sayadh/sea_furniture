import { PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize, IsArray, IsBoolean, IsEnum, IsInt, IsOptional, IsString, IsUUID, Max, MaxLength, Min, MinLength,
  ValidateNested,
} from 'class-validator';
import { ProductAvailability } from '@prisma/client';
import { ImageInputDto } from '../../common/dto/image-input.dto';
import { NullableText, SanitizedText } from '../../common/utils/transforms';
import { IsSlug } from '../../common/utils/validators';

const MAX_PRICE = 100_000_000;

export class CreateProductDto {
  @SanitizedText() @IsString() @MinLength(2) @MaxLength(200)
  name: string;

  @IsOptional() @SanitizedText() @IsString() @MaxLength(160) @IsSlug()
  slug?: string;

  @IsUUID('4')
  categoryId: string;

  @IsOptional() @NullableText() @IsString() @MaxLength(500)
  shortDescription?: string | null;

  @IsOptional() @NullableText() @IsString() @MaxLength(10000)
  description?: string | null;

  @IsInt() @Min(0) @Max(MAX_PRICE)
  price: number;

  @IsOptional() @IsInt() @Min(0) @Max(MAX_PRICE)
  oldPrice?: number | null;

  @IsOptional() @NullableText() @IsString() @MaxLength(64)
  sku?: string | null;

  @IsOptional() @NullableText() @IsString() @MaxLength(200)
  dimensions?: string | null;

  @IsOptional() @NullableText() @IsString() @MaxLength(200)
  material?: string | null;

  @IsOptional() @NullableText() @IsString() @MaxLength(200)
  color?: string | null;

  @IsOptional() @IsEnum(ProductAvailability)
  availability?: ProductAvailability;

  @IsOptional() @IsInt() @Min(0) @Max(100000)
  stockQuantity?: number;

  @IsOptional() @NullableText() @IsString() @MaxLength(120)
  productionTime?: string | null;

  @IsOptional() @IsBoolean() isFeatured?: boolean;
  @IsOptional() @IsBoolean() isNew?: boolean;
  @IsOptional() @IsBoolean() isOnSale?: boolean;
  @IsOptional() @IsBoolean() isActive?: boolean;

  /** Show in the home page hero slider (max 10; adding an 11th removes the oldest). */
  @IsOptional() @IsBoolean() isHeroSlide?: boolean;

  @IsOptional() @IsInt() @Min(0)
  sortOrder?: number;

  @IsOptional() @NullableText() @IsString() @MaxLength(160)
  seoTitle?: string | null;

  @IsOptional() @NullableText() @IsString() @MaxLength(320)
  seoDescription?: string | null;

  /** Full ordered image list; replaces existing images on update. */
  @IsOptional() @IsArray() @ArrayMaxSize(20) @ValidateNested({ each: true }) @Type(() => ImageInputDto)
  images?: ImageInputDto[];
}

export class UpdateProductDto extends PartialType(CreateProductDto) {}
