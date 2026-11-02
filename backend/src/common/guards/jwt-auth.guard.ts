import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import { ACCESS_COOKIE } from '../utils/cookies';

export interface AuthAdmin {
  id: string;
  email: string;
  name: string;
}

export interface AuthedRequest extends Request {
  admin?: AuthAdmin;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<AuthedRequest>();
    const header = req.headers.authorization;
    const token: string | undefined =
      req.cookies?.[ACCESS_COOKIE] ?? (header?.startsWith('Bearer ') ? header.slice(7) : undefined);
    if (!token) throw new UnauthorizedException('Անհրաժեշտ է մուտք գործել');

    let payload: { sub: string; type?: string };
    try {
      payload = await this.jwt.verifyAsync(token, { secret: this.config.getOrThrow('JWT_ACCESS_SECRET') });
    } catch {
      throw new UnauthorizedException('Սեսիան ավարտվել է։ Խնդրում ենք կրկին մուտք գործել');
    }
    if (payload.type !== 'access') throw new UnauthorizedException('Անհրաժեշտ է մուտք գործել');

    const admin = await this.prisma.adminUser.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, name: true, isActive: true },
    });
    if (!admin || !admin.isActive) throw new UnauthorizedException('Անհրաժեշտ է մուտք գործել');

    req.admin = { id: admin.id, email: admin.email, name: admin.name };
    return true;
  }
}
