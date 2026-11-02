import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { AuthAdmin, AuthedRequest } from '../guards/jwt-auth.guard';

export const CurrentAdmin = createParamDecorator((_: unknown, ctx: ExecutionContext): AuthAdmin | undefined => {
  return ctx.switchToHttp().getRequest<AuthedRequest>().admin;
});
