import { IsEmail, IsOptional, IsString, Matches, MaxLength } from 'class-validator';
import { NormalizePhone, NullableText, SanitizedText } from '../../common/utils/transforms';
import { IsArmenianPhone } from '../../common/utils/validators';

const URL_OR_UPLOAD = /^(https?:\/\/|\/uploads\/)/;

export class UpdateSettingsDto {
  @IsOptional() @SanitizedText() @IsString() @MaxLength(100)
  siteName?: string;

  @IsOptional() @IsString() @MaxLength(1000) @Matches(URL_OR_UPLOAD, { message: 'isUrl' })
  logoUrl?: string | null;

  @IsOptional() @IsString() @MaxLength(500)
  logoPath?: string | null;

  @IsOptional() @NormalizePhone({ nullable: true }) @IsString() @IsArmenianPhone()
  phone?: string | null;

  /** Second phone number (shown next to the main one) */
  @IsOptional() @NormalizePhone({ nullable: true }) @IsString() @IsArmenianPhone()
  phone2?: string | null;

  @IsOptional() @NormalizePhone({ nullable: true }) @IsString() @IsArmenianPhone()
  whatsapp?: string | null;

  @IsOptional() @NullableText() @IsEmail() @MaxLength(255)
  email?: string | null;

  @IsOptional() @NullableText() @IsString() @MaxLength(300)
  address?: string | null;

  @IsOptional() @NullableText() @IsString() @MaxLength(300)
  workingHours?: string | null;

  @IsOptional() @NullableText() @IsString() @MaxLength(500) @Matches(/^https:\/\/(www\.)?instagram\.com\//, { message: 'isUrl' })
  instagramUrl?: string | null;

  @IsOptional() @NullableText() @IsString() @MaxLength(500) @Matches(/^https:\/\/(www\.|m\.)?(facebook\.com|fb\.com)\//, { message: 'isUrl' })
  facebookUrl?: string | null;

  @IsOptional() @NullableText() @IsString() @MaxLength(500) @Matches(/^https:\/\/(www\.|m\.)?tiktok\.com\//, { message: 'isUrl' })
  tiktokUrl?: string | null;

  /** Google Maps "Embed a map" iframe src */
  @IsOptional() @NullableText() @IsString() @MaxLength(2000) @Matches(/^https:\/\/(www\.)?google\.[a-z.]+\/maps(\/embed|\?)/, { message: 'isUrl' })
  mapEmbedUrl?: string | null;

  @IsOptional() @NullableText() @IsString() @MaxLength(200)
  heroTitle?: string | null;

  @IsOptional() @NullableText() @IsString() @MaxLength(500)
  heroSubtitle?: string | null;

  @IsOptional() @IsString() @MaxLength(1000) @Matches(URL_OR_UPLOAD, { message: 'isUrl' })
  heroImageUrl?: string | null;

  @IsOptional() @IsString() @MaxLength(500)
  heroImagePath?: string | null;

  @IsOptional() @IsString() @MaxLength(1000) @Matches(URL_OR_UPLOAD, { message: 'isUrl' })
  aboutImage1Url?: string | null;

  @IsOptional() @IsString() @MaxLength(500)
  aboutImage1Path?: string | null;

  @IsOptional() @NullableText() @IsString() @MaxLength(255)
  aboutImage1Alt?: string | null;

  @IsOptional() @IsString() @MaxLength(1000) @Matches(URL_OR_UPLOAD, { message: 'isUrl' })
  aboutImage2Url?: string | null;

  @IsOptional() @IsString() @MaxLength(500)
  aboutImage2Path?: string | null;

  @IsOptional() @NullableText() @IsString() @MaxLength(255)
  aboutImage2Alt?: string | null;

  @IsOptional() @IsString() @MaxLength(1000) @Matches(URL_OR_UPLOAD, { message: 'isUrl' })
  aboutImage3Url?: string | null;

  @IsOptional() @IsString() @MaxLength(500)
  aboutImage3Path?: string | null;

  @IsOptional() @NullableText() @IsString() @MaxLength(255)
  aboutImage3Alt?: string | null;

  @IsOptional() @NullableText() @IsString() @MaxLength(3000)
  deliveryInfo?: string | null;

  @IsOptional() @NullableText() @IsString() @MaxLength(160)
  seoTitle?: string | null;

  @IsOptional() @NullableText() @IsString() @MaxLength(320)
  seoDescription?: string | null;
}
