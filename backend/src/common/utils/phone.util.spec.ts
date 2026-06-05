import { describe, it } from 'node:test';
import * as assert from 'node:assert/strict';
import { normalizePhone, phoneLookupValues } from './phone.util';

describe('normalizePhone', () => {
  it('normalizes +998 format', () => {
    assert.equal(normalizePhone('+998 90 123 45 67'), '+998901234567');
  });

  it('normalizes 9-digit local format', () => {
    assert.equal(normalizePhone('901234567'), '+998901234567');
  });

  it('normalizes 998 prefix without plus', () => {
    assert.equal(normalizePhone('998901234567'), '+998901234567');
  });

  it('normalizes trunk prefix 8', () => {
    assert.equal(normalizePhone('8901234567'), '+998901234567');
  });
});

describe('phoneLookupValues', () => {
  it('includes legacy variants for login lookup', () => {
    const values = phoneLookupValues('901234567');
    assert.ok(values.includes('+998901234567'));
    assert.ok(values.includes('998901234567'));
    assert.ok(values.includes('901234567'));
  });
});
