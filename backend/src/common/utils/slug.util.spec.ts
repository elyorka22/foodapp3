import { describe, it } from 'node:test';
import * as assert from 'node:assert/strict';
import { BadRequestException } from '@nestjs/common';
import {
  generateUniqueSlug,
  resolveSlugForCreate,
  resolveSlugForUpdate,
  slugifyName,
} from './slug.util';

describe('slugifyName', () => {
  it('converts title to kebab-case', () => {
    assert.equal(slugifyName('Pizza House'), 'pizza-house');
  });

  it('strips leading and trailing dashes', () => {
    assert.equal(slugifyName('  --Hello--  '), 'hello');
  });
});

describe('generateUniqueSlug', () => {
  it('returns base when free', async () => {
    const slug = await generateUniqueSlug('Pizza House', async () => false);
    assert.equal(slug, 'pizza-house');
  });

  it('appends increment when base is taken', async () => {
    const taken = new Set(['pizza-house', 'pizza-house-2']);
    const slug = await generateUniqueSlug('Pizza House', async (s) => taken.has(s));
    assert.equal(slug, 'pizza-house-3');
  });
});

describe('resolveSlugForCreate', () => {
  it('auto-generates when slug omitted', async () => {
    const slug = await resolveSlugForCreate({
      name: 'Pizza House',
      isTaken: async () => false,
    });
    assert.equal(slug, 'pizza-house');
  });

  it('auto-increments when slug matches name-derived slug and is taken', async () => {
    const taken = new Set(['pizza-house']);
    const slug = await resolveSlugForCreate({
      name: 'Pizza House',
      slug: 'pizza-house',
      isTaken: async (s) => taken.has(s),
    });
    assert.equal(slug, 'pizza-house-2');
  });

  it('rejects duplicate manual slug with 400', async () => {
    await assert.rejects(
      () =>
        resolveSlugForCreate({
          name: 'Other Name',
          slug: 'custom-slug',
          isTaken: async (s) => s === 'custom-slug',
        }),
      (err: unknown) => {
        assert.ok(err instanceof BadRequestException);
        return true;
      },
    );
  });

  it('allows unique manual slug', async () => {
    const slug = await resolveSlugForCreate({
      name: 'Pizza House',
      slug: 'best-pizza',
      isTaken: async () => false,
    });
    assert.equal(slug, 'best-pizza');
  });
});

describe('resolveSlugForUpdate', () => {
  it('rejects taken slug', async () => {
    await assert.rejects(
      () =>
        resolveSlugForUpdate({
          slug: 'taken',
          isTaken: async () => true,
        }),
      (err: unknown) => err instanceof BadRequestException,
    );
  });
});
