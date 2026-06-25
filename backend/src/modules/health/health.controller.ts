import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
import { StorageService } from '../storage/storage.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private storage: StorageService,
  ) {}

  @Get('storage')
  async storageHealth() {
    const status = await this.storage.checkConnectivity();
    return { status };
  }

  @Get('system')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserRole.SUPER_ADMIN)
  async system() {
    let database = 'ok';
    let redisStatus = 'ok';

    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      database = 'error';
    }

    try {
      await this.redis.getClient().ping();
    } catch {
      redisStatus = 'error';
    }

    const storage = await this.storage.checkConnectivity();

    return {
      api: 'ok',
      database,
      redis: redisStatus,
      storage,
      version: process.env.APP_VERSION ?? '1.2.1',
      environment: process.env.NODE_ENV ?? 'development',
      build: process.env.BUILD_SHA ?? 'local',
      timestamp: new Date().toISOString(),
    };
  }

  @Get()
  async check() {
    let db = 'ok';
    let redis = 'ok';

    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      db = 'error';
    }

    try {
      await this.redis.getClient().ping();
    } catch {
      redis = 'error';
    }

    const healthy = db === 'ok' && redis === 'ok';
    return {
      status: healthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      services: { database: db, redis },
    };
  }
}
