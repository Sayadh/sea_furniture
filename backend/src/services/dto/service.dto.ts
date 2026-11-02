import { PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsBoolean, IsInt, IsOptional, IsString, Max, MaxLength, Min, MinLength, ValidateNested } from 'class-validator';
import { ImageInputDto } from '../../common/dto/image-input.dto';
import { NullableText, SanitizedText } from '../../common/utils/transforms';
import { IsSlug } from '../../common/utils/validators';

export class CreateServiceDto {
  @SanitizedText() @IsString() @MinLength(2) @MaxLength(200)
  title: string;

  @IsOptional() @SanitizedText() @IsString() @MaxLength(160) @IsSlug()
  slug?: string;

  @IsOptional() @NullableText() @IsString() @MaxLength(500)
  shortDescription?: string | null;

  @IsOptional() @NullableText() @IsString() @MaxLength(10000)
  description?: string | null;

  /** Starting price in AMD. null → "Գինը՝ գնահատումից հետո". */
  @IsOptional() @IsInt() @Min(0) @Max(100_000_000)
  priceFrom?: number | null;

  @IsOptional() @NullableText() @IsString() @MaxLength(120)
  duration?: string | null;

  @IsOptional() @IsBoolean()
  isActive?: boolean;

  @IsOptional() @IsInt() @Min(0)
  sortOrder?: number;

  @IsOptional() @NullableText() @IsString() @MaxLength(160)
  seoTitle?: string | null;

  @IsOptional() @NullableText() @IsString() @MaxLength(320)
  seoDescription?: string | null;

  @IsOptional() @IsArray() @ArrayMaxSize(12) @ValidateNested({ each: true }) @Type(() => ImageInputDto)
  images?: ImageInputDto[];
}

export class UpdateServiceDto extends PartialType(CreateServiceDto) {}
