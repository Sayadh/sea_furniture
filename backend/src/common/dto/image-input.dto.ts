import { IsBoolean, IsInt, IsOptional, IsString, Matches, MaxLength, Min } from 'class-validator';
import { SanitizedText } from '../utils/transforms';

/** Image reference returned by POST /admin/uploads and attached to an entity. */
export class ImageInputDto {
  /** Public URL (absolute https URL or a local /uploads/... path). */
  @IsString()
  @MaxLength(1000)
  @Matches(/^(https?:\/\/|\/uploads\/)/, { message: 'isUrl' })
  url: string;

  /** Storage object path (used for deletion). Omit for external images. */
  @IsOptional()
  @IsString()
  @MaxLength(500)
  path?: string;

  @IsOptional()
  @SanitizedText()
  @IsString()
  @MaxLength(255)
  alt?: string;

  @IsOptional()
  @IsBoolean()
  isMain?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
