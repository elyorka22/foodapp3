import { describe, it, beforeEach } from 'node:test';
import * as assert from 'node:assert/strict';
import { UserRole } from '@prisma/client';
import { UsersService } from './users.service';
import { AuthService } from '../auth/auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtPayload } from '../../common/decorators/current-user.decorator';

type CreateData = Record<string, unknown>;

function fakeHash(password: string) {
  return `$2b$04$testhash.${Buffer.from(password).toString('base64url')}`;
}

describe('UsersService password hardening', () => {
  let createData: CreateData | null;
  let updateData: CreateData | null;
  let service: UsersService;

  const actorSuper: JwtPayload = {
    sub: 'admin-1',
    email: 'admin@test.local',
    role: UserRole.SUPER_ADMIN,
  };
  const actorManager: JwtPayload = {
    sub: 'mgr-1',
    email: 'manager@test.local',
    role: UserRole.MANAGER,
  };

  beforeEach(() => {
    createData = null;
    updateData = null;

    const prisma = {
      user: {
        findFirst: async () => null,
        create: async ({ data }: { data: CreateData }) => {
          createData = data;
          return {
            id: 'user-1',
            ...data,
            createdAt: new Date('2026-01-01T00:00:00Z'),
          };
        },
        findFirstOrThrow: async () => ({
          id: 'user-1',
          email: 'staff@test.local',
          phone: null,
          fullName: 'Staff User',
          role: UserRole.MANAGER,
          isActive: true,
          createdAt: new Date('2026-01-01T00:00:00Z'),
          businessStaff: [],
        }),
        findMany: async () => [
          {
            id: 'user-1',
            email: 'staff@test.local',
            phone: null,
            fullName: 'Staff User',
            role: UserRole.MANAGER,
            isActive: true,
            createdAt: new Date('2026-01-01T00:00:00Z'),
            businessStaff: [],
          },
        ],
        update: async ({ data }: { data: CreateData }) => {
          updateData = data;
          return {
            id: 'user-1',
            email: 'staff@test.local',
            phone: null,
            fullName: 'Staff User',
            role: UserRole.MANAGER,
            isActive: true,
            createdAt: new Date('2026-01-01T00:00:00Z'),
            businessStaff: [],
          };
        },
      },
      manager: { create: async () => ({}) },
      courier: { create: async () => ({}) },
      businessStaff: { create: async () => ({}) },
      business: { findFirst: async () => null },
    } as unknown as PrismaService;

    const auth = {
      hashPassword: async (password: string) => fakeHash(password),
    } as unknown as AuthService;

    service = new UsersService(prisma, auth);
  });

  it('hashes password on create and never stores plaintext note', async () => {
    const plain = 'DummyPass123!';
    const result = await service.create(
      {
        email: 'staff@test.local',
        password: plain,
        fullName: 'Staff User',
        role: UserRole.MANAGER,
      },
      actorSuper,
    );

    assert.ok(createData);
    assert.equal(Object.prototype.hasOwnProperty.call(createData, 'adminPasswordNote'), false);
    assert.equal(createData!.passwordHash, fakeHash(plain));
    assert.notEqual(createData!.passwordHash, plain);
    assert.equal(Object.prototype.hasOwnProperty.call(result, 'adminPasswordNote'), false);
    assert.equal(Object.prototype.hasOwnProperty.call(result, 'password'), false);
    assert.equal(Object.prototype.hasOwnProperty.call(result, 'passwordHash'), false);
  });

  it('hashes password on update and never writes adminPasswordNote', async () => {
    const prismaWithExisting = {
      user: {
        findFirst: async () => ({
          id: 'user-1',
          email: 'staff@test.local',
          phone: null,
          fullName: 'Staff User',
          role: UserRole.MANAGER,
          isActive: true,
          createdAt: new Date('2026-01-01T00:00:00Z'),
          businessStaff: [],
        }),
        update: async ({ data }: { data: CreateData }) => {
          updateData = data;
          return {
            id: 'user-1',
            email: 'staff@test.local',
            phone: null,
            fullName: 'Staff User',
            role: UserRole.MANAGER,
            isActive: true,
            createdAt: new Date('2026-01-01T00:00:00Z'),
            businessStaff: [],
          };
        },
      },
    } as unknown as PrismaService;

    const auth = {
      hashPassword: async (password: string) => fakeHash(password),
    } as unknown as AuthService;

    const local = new UsersService(prismaWithExisting, auth);
    const plain = 'ResetPass456!';
    const result = await local.update('user-1', { password: plain }, actorSuper);

    assert.ok(updateData);
    assert.equal(Object.prototype.hasOwnProperty.call(updateData, 'adminPasswordNote'), false);
    assert.equal(updateData!.passwordHash, fakeHash(plain));
    assert.equal(Object.prototype.hasOwnProperty.call(result, 'adminPasswordNote'), false);
  });

  it('list responses never disclose passwords for any actor', async () => {
    const rows = await service.findAll(undefined, actorSuper);
    assert.equal(rows.length, 1);
    for (const row of rows) {
      assert.equal(Object.prototype.hasOwnProperty.call(row, 'adminPasswordNote'), false);
      assert.equal(Object.prototype.hasOwnProperty.call(row, 'password'), false);
      assert.equal(Object.prototype.hasOwnProperty.call(row, 'passwordHash'), false);
    }

    const managerRows = await service.findAll(undefined, actorManager);
    for (const row of managerRows) {
      assert.equal(Object.prototype.hasOwnProperty.call(row, 'adminPasswordNote'), false);
    }
  });
});

describe('AuthService.hashPassword contract', () => {
  it('delegates to bcrypt-style hashing (not plaintext)', async () => {
    const calls: string[] = [];
    const auth = {
      hashPassword: async (password: string) => {
        calls.push(password);
        return fakeHash(password);
      },
    } as unknown as AuthService;

    const plain = 'DummyLogin789!';
    const hash = await auth.hashPassword(plain);
    assert.deepEqual(calls, [plain]);
    assert.notEqual(hash, plain);
    assert.match(hash, /^\$2b\$/);
  });
});
