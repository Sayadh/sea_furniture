import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { PrismaService } from './prisma/prisma.service';

@ApiTags('health')
@Controller('health')
export class AppController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @SkipThrottle()
  async health() {
    await this.prisma.$queryRaw`SELECT 1`;
    return { status: 'ok', time: new Date().toISOString() };
  }
}
