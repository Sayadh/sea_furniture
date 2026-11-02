import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

/** Marks a controller as admin-only and groups it in Swagger. */
export function AdminOnly(tag: string): ClassDecorator & MethodDecorator {
  return applyDecorators(UseGuards(JwtAuthGuard), ApiTags(`admin / ${tag}`), ApiCookieAuth('sf_access'), ApiBearerAuth());
}
