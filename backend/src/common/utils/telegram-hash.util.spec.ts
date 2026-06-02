import { describe, it } from 'node:test';
import * as assert from 'node:assert/strict';
import { createHmac, createHash } from 'crypto';
import { verifyTelegramLoginHash } from './telegram-hash.util';

function signPayload(
  data: Record<string, string | number>,
  botToken: string,
): string {
  const checkString = Object.keys(data)
    .sort()
    .map((k) => `${k}=${data[k]}`)
    .join('\n');
  const secretKey = createHash('sha256').update(botToken).digest();
  return createHmac('sha256', secretKey).update(checkString).digest('hex');
}

describe('verifyTelegramLoginHash', () => {
  const botToken = '123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11';

  it('accepts valid signature', () => {
    const auth_date = Math.floor(Date.now() / 1000);
    const fields = {
      id: 42,
      first_name: 'Test',
      username: 'testuser',
      auth_date,
    };
    const hash = signPayload(fields, botToken);
    assert.equal(
      verifyTelegramLoginHash(
        { ...fields, hash, last_name: undefined, photo_url: undefined },
        botToken,
      ),
      true,
    );
  });

  it('rejects tampered hash', () => {
    const auth_date = Math.floor(Date.now() / 1000);
    assert.equal(
      verifyTelegramLoginHash(
        {
          id: 1,
          first_name: 'A',
          auth_date,
          hash: 'deadbeef'.repeat(8),
        },
        botToken,
      ),
      false,
    );
  });

  it('rejects expired auth_date', () => {
    const auth_date = Math.floor(Date.now() / 1000) - 90000;
    const fields = { id: 1, first_name: 'A', auth_date };
    const hash = signPayload(fields, botToken);
    assert.equal(verifyTelegramLoginHash({ ...fields, hash }, botToken), false);
  });
});
