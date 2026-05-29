/**
 * One-time migration: local /uploads files → DigitalOcean Spaces + CDN URLs in DB.
 *
 * Run from backend directory (needs node_modules + Prisma client):
 *   cd backend && npm run migrate:images
 *
 * Requires: DATABASE_URL, SPACES_*, UPLOAD_DIR in .env (repo root or backend/.env)
 */
import { existsSync, readFileSync } from 'fs';
import { join, resolve } from 'path';
import { PrismaClient } from '@prisma/client';
import { HeadBucketCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

function loadEnv() {
  const paths = [
    resolve(process.cwd(), '.env'),
    resolve(process.cwd(), '../.env'),
    resolve(__dirname, '../.env'),
    resolve(__dirname, '../backend/.env'),
  ];
  for (const p of paths) {
    if (!existsSync(p)) continue;
    const lines = readFileSync(p, 'utf8').split('\n');
    for (const line of lines) {
      const m = line.match(/^([^#=]+)=(.*)$/);
      if (!m) continue;
      const key = m[1].trim();
      const val = m[2].trim().replace(/^["']|["']$/g, '');
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

function createS3(): { client: S3Client; bucket: string; cdn: string } {
  const endpoint = process.env.SPACES_ENDPOINT!.trim();
  const region = process.env.SPACES_REGION!.trim();
  const bucket = process.env.SPACES_BUCKET!.trim();
  const cdn = process.env.SPACES_CDN_URL!.trim().replace(/\/$/, '');

  const client = new S3Client({
    endpoint,
    region,
    credentials: {
      accessKeyId: process.env.SPACES_ACCESS_KEY!.trim(),
      secretAccessKey: process.env.SPACES_SECRET_KEY!.trim(),
    },
    forcePathStyle: false,
  });

  return { client, bucket, cdn };
}

function isLocalUploadUrl(url: string): boolean {
  if (!url) return false;
  if (url.startsWith('/uploads/')) return true;
  if (url.includes('/uploads/')) return true;
  return false;
}

function localFilenameFromUrl(url: string): string | null {
  const idx = url.indexOf('/uploads/');
  if (idx === -1) return null;
  return url.slice(idx + '/uploads/'.length).split('?')[0];
}

function contentTypeFromExt(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
  if (ext === 'png') return 'image/png';
  if (ext === 'webp') return 'image/webp';
  if (ext === 'gif') return 'image/gif';
  return 'application/octet-stream';
}

async function uploadFile(
  client: S3Client,
  bucket: string,
  cdn: string,
  localPath: string,
  folder: 'products' | 'restaurants' | 'banners',
): Promise<string> {
  const buffer = readFileSync(localPath);
  const ext = localPath.split('.').pop()?.toLowerCase() ?? 'webp';
  const key = `${folder}/${uuidv4()}.${ext === 'jpeg' ? 'jpg' : ext}`;
  const contentType = contentTypeFromExt(localPath);

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      ACL: 'public-read',
      CacheControl: 'public, max-age=31536000, immutable',
    }),
  );

  return `${cdn}/${key}`;
}

async function main() {
  loadEnv();

  const required = [
    'DATABASE_URL',
    'SPACES_ENDPOINT',
    'SPACES_REGION',
    'SPACES_BUCKET',
    'SPACES_ACCESS_KEY',
    'SPACES_SECRET_KEY',
    'SPACES_CDN_URL',
  ];
  const missing = required.filter((k) => !process.env[k]?.trim());
  if (missing.length) {
    console.error('Missing env:', missing.join(', '));
    process.exit(1);
  }

  const uploadDir =
    process.env.UPLOAD_DIR?.trim() ||
    resolve(__dirname, '../backend/uploads') ||
    resolve(__dirname, '../uploads');

  const { client, bucket, cdn } = createS3();
  await client.send(new HeadBucketCommand({ Bucket: bucket }));
  console.log('Spaces bucket OK:', bucket);

  const prisma = new PrismaClient();
  let migrated = 0;
  let skipped = 0;
  let failed = 0;

  const resolveLocal = (url: string): string | null => {
    const name = localFilenameFromUrl(url);
    if (!name) return null;
    const path = join(uploadDir, name);
    return existsSync(path) ? path : null;
  };

  const productImages = await prisma.productImage.findMany();
  for (const row of productImages) {
    if (!isLocalUploadUrl(row.url)) {
      skipped++;
      continue;
    }
    const local = resolveLocal(row.url);
    if (!local) {
      console.warn('Missing file for ProductImage', row.id, row.url);
      failed++;
      continue;
    }
    try {
      const newUrl = await uploadFile(client, bucket, cdn, local, 'products');
      await prisma.productImage.update({ where: { id: row.id }, data: { url: newUrl } });
      migrated++;
      console.log('ProductImage', row.id, '→', newUrl);
    } catch (e) {
      console.error('ProductImage', row.id, e);
      failed++;
    }
  }

  const restaurants = await prisma.restaurant.findMany({
    where: {
      OR: [{ logoUrl: { not: null } }, { coverUrl: { not: null } }],
    },
  });
  for (const r of restaurants) {
    for (const field of ['logoUrl', 'coverUrl'] as const) {
      const url = r[field];
      if (!url || !isLocalUploadUrl(url)) continue;
      const local = resolveLocal(url);
      if (!local) {
        console.warn(`Missing file for Restaurant.${field}`, r.id, url);
        failed++;
        continue;
      }
      try {
        const newUrl = await uploadFile(client, bucket, cdn, local, 'restaurants');
        await prisma.restaurant.update({ where: { id: r.id }, data: { [field]: newUrl } });
        migrated++;
        console.log(`Restaurant.${field}`, r.id, '→', newUrl);
      } catch (e) {
        console.error(`Restaurant.${field}`, r.id, e);
        failed++;
      }
    }
  }

  const banners = await prisma.banner.findMany();
  for (const b of banners) {
    if (!isLocalUploadUrl(b.imageUrl)) {
      skipped++;
      continue;
    }
    const local = resolveLocal(b.imageUrl);
    if (!local) {
      console.warn('Missing file for Banner', b.id, b.imageUrl);
      failed++;
      continue;
    }
    try {
      const newUrl = await uploadFile(client, bucket, cdn, local, 'banners');
      await prisma.banner.update({ where: { id: b.id }, data: { imageUrl: newUrl } });
      migrated++;
      console.log('Banner', b.id, '→', newUrl);
    } catch (e) {
      console.error('Banner', b.id, e);
      failed++;
    }
  }

  await prisma.$disconnect();
  console.log('\nDone.', { migrated, skipped, failed });
  console.log('CDN base:', cdn);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
