import { IsBoolean, IsEnum, IsIn, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';
import { RequestSource, RequestStatus } from '@prisma/client';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { NormalizePhone, NullableText, SanitizedText, ToBoolean } from '../../common/utils/transforms';
import { IsArmenianPhone } from '../../common/utils/validators';

/** multipart/form-data: fields + up to 5 `images` files */
export class CreateRepairRequestDto {
  @SanitizedText() @IsString() @MinLength(2) @MaxLength(100)
  name: string;

  @NormalizePhone() @IsString() @IsArmenianPhone()
  phone: string;

  @IsOptional() @SanitizedText() @IsUUID('4')
  serviceId?: string;

  @IsOptional() @SanitizedText() @IsString() @MaxLength(300)
  address?: string;

  @SanitizedText() @IsString() @MinLength(5) @MaxLength(3000)
  description: string;

  @IsOptional() @IsString() @MaxLength(0, { message: 'whitelistValidation' })
  website?: string;
}

export class CreateContactRequestDto {
  @SanitizedText() @IsString() @MinLength(2) @MaxLength(100)
  name: string;

  @NormalizePhone() @IsString() @IsArmenianPhone()
  phone: string;

  @IsOptional() @SanitizedText() @IsString() @MaxLength(3000)
  message?: string;

  @IsOptional() @IsIn([RequestSource.CONTACT, RequestSource.CONSULTATION])
  source?: 'CONTACT' | 'CONSULTATION';

  @IsOptional() @SanitizedText() @IsUUID('4')
  serviceId?: string;

  @IsOptional() @IsString() @MaxLength(0, { message: 'whitelistValidation' })
  website?: string;
}

export class AdminRequestQueryDto extends PaginationQueryDto {
  @IsOptional() @SanitizedText() @IsString() @MaxLength(50)
  search?: string;

  @IsOptional() @IsEnum(RequestStatus)
  status?: RequestStatus;

  @IsOptional() @IsEnum(RequestSource)
  source?: RequestSource;

  @IsOptional() @ToBoolean() @IsBoolean()
  archived?: boolean;
}

export class UpdateRequestStatusDto {
  @IsEnum(RequestStatus)
  status: RequestStatus;
}

export class UpdateRequestNoteDto {
  @IsOptional() @NullableText() @IsString() @MaxLength(5000)
  adminNote: string | null;
}
