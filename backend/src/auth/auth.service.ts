import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes, randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

const INVALID_CREDENTIALS = 'Էլ. փոստը կամ գաղտնաբառը սխալ է';
// Used to keep timing similar when the user does not exist.
const DUMMY_HASH = '$2b$12$dslxDJ7tIdG.lYfu0sFr4OanpZqiTioaUAx15d1hjbmIu7hSFuI7m';

export interface IssuedTokens {
  accessToken: string;
  refreshToken: string;
  accessMaxAgeMs: number;
  refreshMaxAgeMs: number;
}

interface ClientMeta {
  userAgent?: string;
  ip?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  private get accessTtlMin(): number {
    return Number(this.config.get('JWT_ACCESS_TTL_MINUTES', 15));
  }

  private get refreshTtlDays(): number {
    return Number(this.config.get('JWT_REFRESH_TTL_DAYS', 30));
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token + this.config.getOrThrow<string>('JWT_REFRESH_SECRET')).digest('hex');
  }

  async login(email: string, password: string, meta: ClientMeta) {
    const admin = await this.prisma.adminUser.findUnique({ where: { email } });
    const ok = await bcrypt.compare(password, admin?.passwordHash ?? DUMMY_HASH);
    if (!admin || !ok || !admin.isActive) throw new UnauthorizedException(INVALID_CREDENTIALS);

    await this.prisma.adminUser.update({ where: { id: admin.id }, data: { lastLoginAt: new Date() } });
    const tokens = await this.issueTokens(admin.id, randomUUID(), meta);
    return { admin: { id: admin.id, email: admin.email, name: admin.name }, tokens };
  }

  /** Refresh token rotation with reuse detection. */
  async refresh(rawToken: string | undefined, meta: ClientMeta): Promise<IssuedTokens> {
    if (!rawToken) throw new UnauthorizedException('Սեսիան ավարտվել է');
    const record = await this.prisma.refreshToken.findUnique({ where: { tokenHash: this.hashToken(rawToken) } });
    if (!record) throw new UnauthorizedException('Սեսիան ավարտվել է');

    if (record.revokedAt) {
      // A rotated token was presented again → possible theft. Kill the whole family.
      await this.revokeFamily(record.familyId);
      throw new UnauthorizedException('Սեսիան ավարտվել է');
    }
    if (record.expiresAt < new Date()) throw new UnauthorizedException('Սեսիան ավարտվել է');

    const admin = await this.prisma.adminUser.findUnique({ where: { id: record.adminUserId } });
    if (!admin?.isActive) {
      await this.revokeFamily(record.familyId);
      throw new UnauthorizedException('Սեսիան ավարտվել է');
    }

    const tokens = await this.issueTokens(admin.id, record.familyId, meta, record.id);
    return tokens;
  }

  async logout(rawToken: string | undefined): Promise<void> {
    if (!rawToken) return;
    const record = await this.prisma.refreshToken.findUnique({ where: { tokenHash: this.hashToken(rawToken) } });
    if (record) await this.revokeFamily(record.familyId);
  }

  private async revokeFamily(familyId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { familyId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  private async issueTokens(adminId: string, familyId: string, meta: ClientMeta, replaceId?: string): Promise<IssuedTokens> {
    const accessMaxAgeMs = this.accessTtlMin * 60_000;
    const refreshMaxAgeMs = this.refreshTtlDays * 86_400_000;

    const accessToken = await this.jwt.signAsync(
      { sub: adminId, type: 'access' },
      { secret: this.config.getOrThrow('JWT_ACCESS_SECRET'), expiresIn: `${this.accessTtlMin}m` },
    );
    const refreshToken = randomBytes(48).toString('base64url');

    await this.prisma.$transaction(async (tx) => {
      const created = await tx.refreshToken.create({
        data: {
          tokenHash: this.hashToken(refreshToken),
          familyId,
          adminUserId: adminId,
          expiresAt: new Date(Date.now() + refreshMaxAgeMs),
          userAgent: meta.userAgent?.slice(0, 255),
          ip: meta.ip?.slice(0, 64),
        },
      });
      if (replaceId) {
        // Conditional update guards against two concurrent refreshes using the same token.
        const res = await tx.refreshToken.updateMany({
          where: { id: replaceId, revokedAt: null },
          data: { revokedAt: new Date(), replacedById: created.id },
        });
        if (res.count === 0) throw new UnauthorizedException('Սեսիան ավարտվել է');
      }
    });

    // Opportunistic cleanup of long-expired tokens.
    if (Math.random() < 0.05) {
      await this.prisma.refreshToken.deleteMany({ where: { expiresAt: { lt: new Date(Date.now() - 7 * 86_400_000) } } });
    }

    return { accessToken, refreshToken, accessMaxAgeMs, refreshMaxAgeMs };
  }
}
