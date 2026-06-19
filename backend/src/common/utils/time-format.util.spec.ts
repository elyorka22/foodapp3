import { describe, it } from 'node:test';
import * as assert from 'node:assert/strict';
import { normalizeNonWorkingPeriodTimes } from './time-format.util';

describe('normalizeNonWorkingPeriodTimes', () => {
  it('keeps correct morning closed block 01:00–08:00', () => {
    const result = normalizeNonWorkingPeriodTimes('01:00', '08:00');
    assert.deepEqual(result, { closeTime: '01:00', openTime: '08:00' });
  });

  it('fixes swapped morning block 08:00–01:00', () => {
    const result = normalizeNonWorkingPeriodTimes('08:00', '01:00');
    assert.deepEqual(result, { closeTime: '01:00', openTime: '08:00' });
  });

  it('keeps overnight closed block 22:00–09:00', () => {
    const result = normalizeNonWorkingPeriodTimes('22:00', '09:00');
    assert.deepEqual(result, { closeTime: '22:00', openTime: '09:00' });
  });
});
