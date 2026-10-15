import { describe, it, beforeEach } from 'node:test';
import * as assert from 'node:assert/strict';
import {
  BadRequestException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { BruteForceService } from '../../common/security/brute-force.service';
import { LoginDto } from './dto/login.dto';

const PLAIN = 'DummyPass123!';

describe('AuthService.login client policy (unit, mocked DB)', () => {
  let passwordHash: string;
  let signedPayload: Record<string, unknown> | null;
  let clearFailuresCalls: number;
  let recordFailureCalls: number;
  let lastLoginUpdated: boolean;

  const usersByEmail: Record<
    string,
    {
      id: string;
      email: string;
      phone: string | null;
      fullName: string;
      role: UserRole;
      passwordHash: string;
      deletedAt: null;
      isActive: true;
    }
  > = {};

  let service: AuthService;

  beforeEach(async () => {
    passwordHash = await bcrypt.hash(PLAIN, 4);
    signedPayload = null;
    clearFailuresCalls = 0;
    recordFailureCalls = 0;
    lastLoginUpdated = false;

    usersByEmail['admin@test.local'] = {
      id: 'u-admin',
      email: 'admin@test.local',
      phone: null,
      fullName: 'Super Admin',
      role: UserRole.SUPER_ADMIN,
      passwordHash,
      deletedAt: null,
      isActive: true,
    };
    usersByEmail['manager@test.local'] = {
      id: 'u-mgr',
      email: 'manager@test.local',
      phone: null,
      fullName: 'Manager',
      role: UserRole.MANAGER,
      passwordHash,
      deletedAt: null,
      isActive: true,
    };
    usersByEmail['owner@test.local'] = {
      id: 'u-biz',
      email: 'owner@test.local',
      phone: null,
      fullName: 'Owner',
      role: UserRole.BUSINESS,
      passwordHash,
      deletedAt: null,
      isActive: true,
    };
    usersByEmail['courier@test.local'] = {
      id: 'u-courier',
      email: 'courier@test.local',
      phone: null,
      fullName: 'Courier',
      role: UserRole.COURIER,
      passwordHash,
      deletedAt: null,
      isActive: true,
    };

    const prisma = {
      user: {
        findFirst: async ({ where }: { where: { email?: string } }) => {
          if (!where.email) return null;
          return usersByEmail[where.email] ?? null;
        },
        update: async () => {
          lastLoginUpdated = true;
          return {};
        },
      },
    } as unknown as PrismaService;

    const jwt = {
      sign: (payload: Record<string, unknown>) => {
        signedPayload = payload;
        return 'test.jwt.token';
      },
    } as unknown as JwtService;

    const bruteForce = {
      assertNotBlocked: async () => undefined,
      recordFailure: async () => {
        recordFailureCalls += 1;
      },
      clearFailures: async () => {
        clearFailuresCalls += 1;
      },
    } as unknown as BruteForceService;

    service = new AuthService(prisma, jwt, bruteForce);
  });

  async function login(
    email: string,
    client?: LoginDto['client'],
  ) {
    return service.login(
      {
        email,
        password: PLAIN,
        ...(client ? { client } : {}),
      },
      '127.0.0.1',
    );
  }

  it('legacy login without client still issues JWT for SUPER_ADMIN', async () => {
    const res = await login('admin@test.local');
    assert.equal(res.accessToken, 'test.jwt.token');
    assert.equal(res.user.role, UserRole.SUPER_ADMIN);
    assert.deepEqual(signedPayload, {
      sub: 'u-admin',
      email: 'admin@test.local',
      role: UserRole.SUPER_ADMIN,
    });
    assert.equal(Object.prototype.hasOwnProperty.call(signedPayload, 'client'), false);
    assert.equal(Object.prototype.hasOwnProperty.call(signedPayload, 'aud'), false);
    assert.equal(lastLoginUpdated, true);
    assert.equal(clearFailuresCalls, 1);
  });

  it('legacy login without client still works for MANAGER, BUSINESS, COURIER', async () => {
    for (const email of [
      'manager@test.local',
      'owner@test.local',
      'courier@test.local',
    ]) {
      const res = await login(email);
      assert.ok(res.accessToken);
    }
  });

  it('control accepts SUPER_ADMIN and rejects other roles', async () => {
    const ok = await login('admin@test.local', 'control');
    assert.equal(ok.user.role, UserRole.SUPER_ADMIN);

    await assert.rejects(
      () => login('manager@test.local', 'control'),
      ForbiddenException,
    );
    await assert.rejects(
      () => login('owner@test.local', 'control'),
      ForbiddenException,
    );
  });

  it('business accepts MANAGER/BUSINESS and rejects SUPER_ADMIN', async () => {
    assert.equal((await login('manager@test.local', 'business')).user.role, UserRole.MANAGER);
    assert.equal((await login('owner@test.local', 'business')).user.role, UserRole.BUSINESS);
    await assert.rejects(
      () => login('admin@test.local', 'business'),
      ForbiddenException,
    );
  });

  it('web_admin accepts MANAGER only and rejects SUPER_ADMIN/BUSINESS', async () => {
    assert.equal((await login('manager@test.local', 'web_admin')).user.role, UserRole.MANAGER);
    await assert.rejects(
      () => login('admin@test.local', 'web_admin'),
      ForbiddenException,
    );
    await assert.rejects(
      () => login('owner@test.local', 'web_admin'),
      ForbiddenException,
    );
  });

  it('unknown client is rejected and does not issue a token', async () => {
    await assert.rejects(
      () =>
        service.login(
          {
            email: 'admin@test.local',
            password: PLAIN,
            client: 'hacker' as LoginDto['client'],
          },
          '127.0.0.1',
        ),
      BadRequestException,
    );
    assert.equal(signedPayload, null);
  });

  it('wrong password remains Unauthorized and does not clear failures', async () => {
    await assert.rejects(
      () =>
        service.login(
          { email: 'admin@test.local', password: 'WrongPass999!', client: 'control' },
          '127.0.0.1',
        ),
      UnauthorizedException,
    );
    assert.equal(recordFailureCalls, 1);
    assert.equal(clearFailuresCalls, 0);
    assert.equal(signedPayload, null);
  });

  it('JWT payload stays role-based without client/aud claims when client is set', async () => {
    await login('admin@test.local', 'control');
    assert.deepEqual(signedPayload, {
      sub: 'u-admin',
      email: 'admin@test.local',
      role: UserRole.SUPER_ADMIN,
    });
  });
});
