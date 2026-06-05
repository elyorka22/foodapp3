import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { BruteForceService } from '../../common/security/brute-force.service';
import { normalizePhone, phoneLookupValues } from '../../common/utils/phone.util';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private bruteForce: BruteForceService,
  ) {}

  async login(dto: LoginDto, clientIp: string) {
    if (!dto.email && !dto.phone) {
      throw new BadRequestException('Email or phone is required');
    }

    const loginId = dto.email
      ? dto.email.trim().toLowerCase()
      : normalizePhone(dto.phone!);
    const scopeKey = `${clientIp}:${loginId}`;

    await this.bruteForce.assertNotBlocked('staff-login', scopeKey);

    const user = await this.prisma.user.findFirst({
      where: {
        deletedAt: null,
        isActive: true,
        ...(dto.email
          ? { email: loginId }
          : { phone: { in: phoneLookupValues(dto.phone!) } }),
      },
    });

    if (!user?.passwordHash) {
      await this.bruteForce.recordFailure('staff-login', scopeKey);
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      await this.bruteForce.recordFailure('staff-login', scopeKey);
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.bruteForce.clearFailures('staff-login', scopeKey);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const payload = { sub: user.id, email: user.email ?? '', role: user.role };
    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email ?? '',
        phone: user.phone ?? undefined,
        fullName: user.fullName,
        role: user.role,
      },
    };
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }
}
