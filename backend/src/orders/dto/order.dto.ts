import { Type } from 'class-transformer';
import {
  ArrayMaxSize, ArrayMinSize, IsArray, IsBoolean, IsDateString, IsEnum, IsIn, IsInt, IsOptional, IsString, IsUUID,
  Max, MaxLength, Min, MinLength, ValidateNested,
} from 'class-validator';
import { OrderStatus } from '@prisma/client';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { NormalizePhone, NullableText, SanitizedText, ToBoolean } from '../../common/utils/transforms';
import { IsArmenianPhone } from '../../common/utils/validators';

export class OrderItemInputDto {
  @IsUUID('4')
  productId: string;

  @IsInt() @Min(1) @Max(99)
  quantity: number;
}

export class CreateOrderDto {
  @SanitizedText() @IsString() @MinLength(2) @MaxLength(80)
  firstName: string;

  @SanitizedText() @IsString() @MinLength(2) @MaxLength(80)
  lastName: string;

  @NormalizePhone() @IsString() @IsArmenianPhone()
  phone: string;

  @IsOptional() @NormalizePhone() @IsString() @IsArmenianPhone()
  altPhone?: string;

  @SanitizedText() @IsString() @MinLength(2) @MaxLength(80)
  region: string;

  @SanitizedText() @IsString() @MinLength(3) @MaxLength(300)
  address: string;

  @IsOptional() @SanitizedText() @IsString() @MaxLength(1000)
  deliveryNotes?: string;

  @IsOptional() @SanitizedText() @IsString() @MaxLength(2000)
  comment?: string;

  @IsArray() @ArrayMinSize(1) @ArrayMaxSize(50) @ValidateNested({ each: true }) @Type(() => OrderItemInputDto)
  items: OrderItemInputDto[];

  /** Honeypot — must stay empty (bots fill every field). */
  @IsOptional() @IsString() @MaxLength(0, { message: 'whitelistValidation' })
  website?: string;
}

export class AdminOrderQueryDto extends PaginationQueryDto {
  /** Order number or phone */
  @IsOptional() @SanitizedText() @IsString() @MaxLength(50)
  search?: string;

  @IsOptional() @IsEnum(OrderStatus)
  status?: OrderStatus;

  @IsOptional() @IsDateString()
  dateFrom?: string;

  @IsOptional() @IsDateString()
  dateTo?: string;

  @IsOptional() @ToBoolean() @IsBoolean()
  archived?: boolean;

  @IsOptional() @IsIn(['newest', 'oldest', 'total_desc'])
  sort?: 'newest' | 'oldest' | 'total_desc';
}

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  status: OrderStatus;
}

export class UpdateOrderNoteDto {
  @IsOptional() @NullableText() @IsString() @MaxLength(5000)
  adminNote: string | null;
}
