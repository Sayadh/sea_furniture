import { PartialType } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString, Matches, MaxLength, Min, MinLength } from 'class-validator';
import { NullableText, SanitizedText } from '../../common/utils/transforms';
import { IsSlug } from '../../common/utils/validators';

export class CreateCategoryDto {
  @SanitizedText()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name: string;

  /** Generated from the name when omitted. */
  @IsOptional()
  @SanitizedText()
  @IsString()
  @MaxLength(120)
  @IsSlug()
  slug?: string;

  @IsOptional()
  @NullableText()
  @IsString()
  @MaxLength(2000)
  description?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  @Matches(/^(https?:\/\/|\/uploads\/)/, { message: 'isUrl' })
  imageUrl?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  imagePath?: string | null;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @NullableText()
  @IsString()
  @MaxLength(160)
  seoTitle?: string | null;

  @IsOptional()
  @NullableText()
  @IsString()
  @MaxLength(320)
  seoDescription?: string | null;
}

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}
