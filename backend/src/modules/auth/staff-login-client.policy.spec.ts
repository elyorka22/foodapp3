import { describe, it } from 'node:test';
import * as assert from 'node:assert/strict';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import {
  assertStaffLoginClientAllowed,
  isStaffLoginClient,
  rolesAllowedForStaffClient,
  STAFF_LOGIN_CLIENTS,
} from './staff-login-client.policy';

describe('staff-login-client.policy', () => {
  it('exposes the explicit client allowlist', () => {
    assert.deepEqual([...STAFF_LOGIN_CLIENTS], ['control', 'business', 'web_admin']);
    assert.equal(isStaffLoginClient('control'), true);
    assert.equal(isStaffLoginClient('unknown'), false);
  });

  it('documents intended role matrix', () => {
    assert.deepEqual(rolesAllowedForStaffClient('control'), [UserRole.SUPER_ADMIN]);
    assert.deepEqual(rolesAllowedForStaffClient('business'), [
      UserRole.MANAGER,
      UserRole.BUSINESS,
    ]);
    assert.deepEqual(rolesAllowedForStaffClient('web_admin'), [UserRole.MANAGER]);
  });

  it('preserves legacy behavior when client is omitted or blank', () => {
    for (const role of [
      UserRole.SUPER_ADMIN,
      UserRole.MANAGER,
      UserRole.BUSINESS,
      UserRole.COURIER,
    ]) {
      assert.doesNotThrow(() => assertStaffLoginClientAllowed(undefined, role));
      assert.doesNotThrow(() => assertStaffLoginClientAllowed(null, role));
      assert.doesNotThrow(() => assertStaffLoginClientAllowed('', role));
      assert.doesNotThrow(() => assertStaffLoginClientAllowed('   ', role));
    }
  });

  it('rejects unrecognized client values (no bypass)', () => {
    assert.throws(
      () => assertStaffLoginClientAllowed('hacker', UserRole.SUPER_ADMIN),
      BadRequestException,
    );
    assert.throws(
      () => assertStaffLoginClientAllowed('customer', UserRole.MANAGER),
      BadRequestException,
    );
  });

  it('control allows SUPER_ADMIN only', () => {
    assert.doesNotThrow(() =>
      assertStaffLoginClientAllowed('control', UserRole.SUPER_ADMIN),
    );
    for (const role of [UserRole.MANAGER, UserRole.BUSINESS, UserRole.COURIER]) {
      assert.throws(
        () => assertStaffLoginClientAllowed('control', role),
        ForbiddenException,
      );
    }
  });

  it('business allows MANAGER and BUSINESS; denies SUPER_ADMIN and COURIER', () => {
    assert.doesNotThrow(() =>
      assertStaffLoginClientAllowed('business', UserRole.MANAGER),
    );
    assert.doesNotThrow(() =>
      assertStaffLoginClientAllowed('business', UserRole.BUSINESS),
    );
    assert.throws(
      () => assertStaffLoginClientAllowed('business', UserRole.SUPER_ADMIN),
      ForbiddenException,
    );
    assert.throws(
      () => assertStaffLoginClientAllowed('business', UserRole.COURIER),
      ForbiddenException,
    );
  });

  it('web_admin allows MANAGER only; denies SUPER_ADMIN and BUSINESS', () => {
    assert.doesNotThrow(() =>
      assertStaffLoginClientAllowed('web_admin', UserRole.MANAGER),
    );
    assert.throws(
      () => assertStaffLoginClientAllowed('web_admin', UserRole.SUPER_ADMIN),
      ForbiddenException,
    );
    assert.throws(
      () => assertStaffLoginClientAllowed('web_admin', UserRole.BUSINESS),
      ForbiddenException,
    );
    assert.throws(
      () => assertStaffLoginClientAllowed('web_admin', UserRole.COURIER),
      ForbiddenException,
    );
  });
});
