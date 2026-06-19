import { describe, it } from 'node:test';
import * as assert from 'node:assert/strict';
import {
  NOTIFICATION_RETENTION_HOURS,
  notificationRetentionCutoff,
} from './notification-retention.util';

describe('notificationRetentionCutoff', () => {
  it('uses a 24 hour window', () => {
    assert.equal(NOTIFICATION_RETENTION_HOURS, 24);
    const cutoff = notificationRetentionCutoff();
    const diffHours = (Date.now() - cutoff.getTime()) / (60 * 60 * 1000);
    assert.ok(diffHours >= 23.9 && diffHours <= 24.1);
  });
});
