import { describe, it, beforeEach } from 'node:test';
import * as assert from 'node:assert/strict';
import { UserRole } from '@prisma/client';
import { RestaurantsService } from './restaurants.service';
import { AuthService } from '../auth/auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtPayload } from '../../common/decorators/current-user.decorator';

type WritePayload = Record<string, unknown>;

function fakeHash(password: string) {
  return `$2b$04$testhash.${Buffer.from(password).toString('base64url')}`;
}

describe('RestaurantsService owner password hardening', () => {
  let userCreateData: WritePayload | null;
  let userUpdateData: WritePayload | null;
  let service: RestaurantsService;

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
  const actorBusiness: JwtPayload = {
    sub: 'biz-1',
    email: 'owner@test.local',
    role: UserRole.BUSINESS,
  };

  beforeEach(() => {
    userCreateData = null;
    userUpdateData = null;

    const prisma = {
      businessStaff: {
        findFirst: async () => ({
          businessId: 'biz-1',
          userId: 'owner-1',
          deletedAt: null,
          user: {
            email: 'owner@test.local',
            phone: null,
            fullName: 'Owner',
          },
        }),
        findMany: async () => [
          {
            businessId: 'biz-1',
            userId: 'owner-1',
            deletedAt: null,
            createdAt: new Date('2026-01-01T00:00:00Z'),
            user: {
              email: 'owner@test.local',
              phone: null,
              fullName: 'Owner',
            },
          },
        ],
        create: async () => ({}),
      },
      user: {
        findFirst: async () => null,
        create: async ({ data }: { data: WritePayload }) => {
          userCreateData = data;
          return { id: 'owner-new', ...data };
        },
        update: async ({ data }: { data: WritePayload }) => {
          userUpdateData = data;
          return { id: 'owner-1', ...data };
        },
      },
      business: {
        findFirst: async () => ({
          id: 'biz-1',
          name: 'Demo',
          deletedAt: null,
          branches: [],
          commissionRate: 10,
          kind: 'RESTAURANT',
        }),
      },
    } as unknown as PrismaService;

    const auth = {
      hashPassword: async (password: string) => fakeHash(password),
    } as unknown as AuthService;

    // constructor: prisma, audit, adminNotifications, schedule, settings, auth
    service = new RestaurantsService(
      prisma,
      { log: async () => undefined } as never,
      {} as never,
      {} as never,
      {} as never,
      auth,
    );
  });

  it('createBusinessOwner stores only passwordHash', async () => {
    const plain = 'OwnerCreatePass1!';
    await (service as unknown as {
      createBusinessOwner: (p: {
        businessId: string;
        login: string;
        password: string;
        fullName?: string;
      }) => Promise<unknown>;
    }).createBusinessOwner({
      businessId: 'biz-1',
      login: 'newowner@test.local',
      password: plain,
      fullName: 'New Owner',
    });

    assert.ok(userCreateData);
    assert.equal(Object.prototype.hasOwnProperty.call(userCreateData, 'adminPasswordNote'), false);
    assert.equal(userCreateData!.passwordHash, fakeHash(plain));
    assert.notEqual(userCreateData!.passwordHash, plain);
  });

  it('resetBusinessOwnerPassword updates hash only', async () => {
    const plain = 'OwnerResetPass2!';
    await (service as unknown as {
      resetBusinessOwnerPassword: (businessId: string, password: string) => Promise<void>;
    }).resetBusinessOwnerPassword('biz-1', plain);

    assert.ok(userUpdateData);
    assert.equal(Object.prototype.hasOwnProperty.call(userUpdateData, 'adminPasswordNote'), false);
    assert.equal(userUpdateData!.passwordHash, fakeHash(plain));
  });

  it('owner password map never returns recoverable passwords for any role', async () => {
    const loadOwners = (
      service as unknown as {
        loadOwnerCredentialsByBusinessIds: (
          ids: string[],
          viewer: JwtPayload,
        ) => Promise<
          Map<string, { ownerLogin: string | null; ownerFullName: string | null; ownerPassword: string | null }>
        >;
      }
    ).loadOwnerCredentialsByBusinessIds.bind(service);

    for (const actor of [actorSuper, actorManager, actorBusiness]) {
      const map = await loadOwners(['biz-1'], actor);
      if (actor.role === UserRole.BUSINESS) {
        assert.equal(map.size, 0);
        continue;
      }
      const row = map.get('biz-1');
      assert.ok(row);
      assert.equal(row!.ownerPassword, null);
      assert.equal(row!.ownerLogin, 'owner@test.local');
    }
  });
});
