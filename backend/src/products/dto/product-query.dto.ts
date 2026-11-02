import { IsBoolean, IsIn, IsInt, IsOptional, IsString, IsUUID, Max, MaxLength, Min } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { SanitizedText, ToBoolean, ToInt } from '../../common/utils/transforms';

export const PRODUCT_SORTS = ['default', 'newest', 'price_asc', 'price_desc', 'popular'] as const;
export type ProductSort = (typeof PRODUCT_SORTS)[number];

export class PublicProductQueryDto extends PaginationQueryDto {
  /** Category slug */
  @IsOptional() @SanitizedText() @IsString() @MaxLength(160)
  category?: string;

  @IsOptional() @SanitizedText() @IsString() @MaxLength(100)
  search?: string;

  @IsOptional() @ToInt() @IsInt() @Min(0)
  minPrice?: number;

  @IsOptional() @ToInt() @IsInt() @Min(0)
  maxPrice?: number;

  @IsOptional() @IsIn(PRODUCT_SORTS)
  sort?: ProductSort;

  @IsOptional() @ToBoolean() @IsBoolean()
  inStock?: boolean;

  @IsOptional() @ToBoolean() @IsBoolean()
  featured?: boolean;

  @IsOptional() @ToBoolean() @IsBoolean()
  isNew?: boolean;

  @IsOptional() @ToBoolean() @IsBoolean()
  onSale?: boolean;

  @IsOptional() @ToInt() @IsInt() @Min(1) @Max(48)
  override limit?: number = 12;
}

export class AdminProductQueryDto extends PaginationQueryDto {
  @IsOptional() @SanitizedText() @IsString() @MaxLength(100)
  search?: string;

  @IsOptional() @IsUUID('4')
  categoryId?: string;

  @IsOptional() @IsIn(['all', 'active', 'hidden'])
  status?: 'all' | 'active' | 'hidden';
}
