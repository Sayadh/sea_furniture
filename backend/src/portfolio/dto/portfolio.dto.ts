import { PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsBoolean, IsEnum, IsInt, IsOptional, IsString, IsUUID, MaxLength, Min, MinLength, ValidateNested } from 'class-validator';
import { PortfolioImageKind } from '@prisma/client';
import { ImageInputDto } from '../../common/dto/image-input.dto';
import { NullableText, SanitizedText } from '../../common/utils/transforms';

export class PortfolioImageInputDto extends ImageInputDto {
  @IsEnum(PortfolioImageKind)
  kind: PortfolioImageKind;
}

export class CreatePortfolioDto {
  @SanitizedText() @IsString() @MinLength(2) @MaxLength(200)
  title: string;

  @IsOptional() @NullableText() @IsString() @MaxLength(5000)
  description?: string | null;

  @IsOptional() @IsUUID('4')
  serviceId?: string | null;

  @IsOptional() @IsBoolean()
  isActive?: boolean;

  @IsOptional() @IsInt() @Min(0)
  sortOrder?: number;

  @IsOptional() @IsArray() @ArrayMaxSize(20) @ValidateNested({ each: true }) @Type(() => PortfolioImageInputDto)
  images?: PortfolioImageInputDto[];
}

export class UpdatePortfolioDto extends PartialType(CreatePortfolioDto) {}
