import { Body, Controller, Get, HttpCode, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { CurrentAdmin } from '../common/decorators/current-admin.decorator';
import { AuthAdmin, JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ACCESS_COOKIE, baseCookieOptions, REFRESH_COOKIE, REFRESH_COOKIE_PATH } from '../common/utils/cookies';
import { AuthService, IssuedTokens } from './auth.service';
import { LoginDto } from './dto/login.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly config: ConfigService,
  ) {}

  private setCookies(res: Response, tokens: IssuedTokens): void {
    const base = baseCookieOptions(this.config);
    res.cookie(ACCESS_COOKIE, tokens.accessToken, { ...base, path: '/', maxAge: tokens.accessMaxAgeMs });
    res.cookie(REFRESH_COOKIE, tokens.refreshToken, {
      ...base,
      sameSite: 'strict',
      path: REFRESH_COOKIE_PATH,
      maxAge: tokens.refreshMaxAgeMs,
    });
  }

  private clearCookies(res: Response): void {
    const base = baseCookieOptions(this.config);
    res.clearCookie(ACCESS_COOKIE, { ...base, path: '/' });
    res.clearCookie(REFRESH_COOKIE, { ...base, sameSite: 'strict', path: REFRESH_COOKIE_PATH });
  }

  private meta(req: Request) {
    return { userAgent: req.headers['user-agent'], ip: req.ip };
  }

  @Post('login')
  @HttpCode(200)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  async login(@Body() dto: LoginDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const { admin, tokens } = await this.auth.login(dto.email, dto.password, this.meta(req));
    this.setCookies(res, tokens);
    return { admin };
  }

  @Post('refresh')
  @HttpCode(200)
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    try {
      const tokens = await this.auth.refresh(req.cookies?.[REFRESH_COOKIE], this.meta(req));
      this.setCookies(res, tokens);
      return { ok: true };
    } catch (e) {
      this.clearCookies(res);
      throw e;
    }
  }

  @Post('logout')
  @HttpCode(200)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    await this.auth.logout(req.cookies?.[REFRESH_COOKIE]);
    this.clearCookies(res);
    return { ok: true };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('sf_access')
  me(@CurrentAdmin() admin: AuthAdmin) {
    return { admin };
  }
}
