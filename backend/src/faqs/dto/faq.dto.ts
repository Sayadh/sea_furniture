import { PartialType } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString, MaxLength, Min, MinLength } from 'class-validator';
import { SanitizedText } from '../../common/utils/transforms';

export class CreateFaqDto {
  @SanitizedText() @IsString() @MinLength(3) @MaxLength(500)
  question: string;

  @SanitizedText() @IsString() @MinLength(3) @MaxLength(5000)
  answer: string;

  @IsOptional() @IsBoolean()
  isActive?: boolean;

  @IsOptional() @IsInt() @Min(0)
  sortOrder?: number;
}

export class UpdateFaqDto extends PartialType(CreateFaqDto) {}
