import { describe, it } from 'node:test';
import * as assert from 'node:assert/strict';
import {
  getLocalDayAndMinutes,
  isOpenOutsideClosedPeriod,
  resolveRestaurantAvailability,
} from './restaurant-hours.util';

/** DB stores openTime=work resumes, closeTime=work pauses. UI: closed 01:00-09:00. */
const hours = [
  { dayOfWeek: 0, openTime: '09:00', closeTime: '01:00', isClosed: false },
  { dayOfWeek: 1, openTime: '09:00', closeTime: '01:00', isClosed: false },
  { dayOfWeek: 2, openTime: '09:00', closeTime: '01:00', isClosed: false },
  { dayOfWeek: 3, openTime: '09:00', closeTime: '01:00', isClosed: false },
  { dayOfWeek: 4, openTime: '09:00', closeTime: '01:00', isClosed: false },
  { dayOfWeek: 5, openTime: '09:00', closeTime: '01:00', isClosed: false },
  { dayOfWeek: 6, openTime: '09:00', closeTime: '01:00', isClosed: false },
];

const hoursEightAm = [
  { dayOfWeek: 0, openTime: '08:00', closeTime: '01:00', isClosed: false },
  { dayOfWeek: 1, openTime: '08:00', closeTime: '01:00', isClosed: false },
  { dayOfWeek: 2, openTime: '08:00', closeTime: '01:00', isClosed: false },
  { dayOfWeek: 3, openTime: '08:00', closeTime: '01:00', isClosed: false },
  { dayOfWeek: 4, openTime: '08:00', closeTime: '01:00', isClosed: false },
  { dayOfWeek: 5, openTime: '08:00', closeTime: '01:00', isClosed: false },
  { dayOfWeek: 6, openTime: '08:00', closeTime: '01:00', isClosed: false },
];

describe('isOpenOutsideClosedPeriod', () => {
  it('treats 01:00-09:00 closed block as open the rest of the day', () => {
    const closedFrom = 1 * 60;
    const closedUntil = 9 * 60;

    assert.equal(isOpenOutsideClosedPeriod(closedFrom, closedUntil, 9 * 60 + 30), true);
    assert.equal(isOpenOutsideClosedPeriod(closedFrom, closedUntil, 0 * 60 + 30), true);
    assert.equal(isOpenOutsideClosedPeriod(closedFrom, closedUntil, 2 * 60), false);
    assert.equal(isOpenOutsideClosedPeriod(closedFrom, closedUntil, 8 * 60 + 30), false);
  });

  it('handles evening closed block 22:00-09:00', () => {
    const closedFrom = 22 * 60;
    const closedUntil = 9 * 60;

    assert.equal(isOpenOutsideClosedPeriod(closedFrom, closedUntil, 10 * 60), true);
    assert.equal(isOpenOutsideClosedPeriod(closedFrom, closedUntil, 23 * 60), false);
  });
});

describe('resolveRestaurantAvailability', () => {
  it('is open at 09:30 when closed 01:00-09:00 in Asia/Tashkent', () => {
    const now = new Date('2026-06-02T04:30:00.000Z');
    const result = resolveRestaurantAvailability(hours, [], now, 'Asia/Tashkent');
    assert.equal(result.isOpen, true);
  });

  it('is closed during non-working morning hours', () => {
    const now = new Date('2026-06-02T02:30:00.000Z'); // 07:30 in Tashkent
    const result = resolveRestaurantAvailability(hours, [], now, 'Asia/Tashkent');
    assert.equal(result.isOpen, false);
  });

  it('is open at 08:00 when closed block ends at 08:00 in Asia/Tashkent', () => {
    const now = new Date('2026-06-02T03:00:00.000Z'); // 08:00 Tashkent
    const result = resolveRestaurantAvailability(hoursEightAm, [], now, 'Asia/Tashkent');
    assert.equal(result.isOpen, true);
  });

  it('is open after midnight before closed block starts', () => {
    const now = new Date('2026-06-01T19:30:00.000Z'); // Tue 00:30 in Tashkent
    const { dayOfWeek } = getLocalDayAndMinutes(now, 'Asia/Tashkent');
    assert.equal(dayOfWeek, 2);

    const result = resolveRestaurantAvailability(hours, [], now, 'Asia/Tashkent');
    assert.equal(result.isOpen, true);
  });

  it('uses template row when current weekday is missing from schedule', () => {
    const partial = [{ dayOfWeek: 1, openTime: '08:00', closeTime: '01:00', isClosed: false }];
    const now = new Date('2026-06-02T04:30:00.000Z'); // Tue 09:30 Tashkent
    const result = resolveRestaurantAvailability(partial, [], now, 'Asia/Tashkent');
    assert.equal(result.isOpen, true);
  });
});
