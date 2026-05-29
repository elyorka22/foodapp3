import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
  DeleteObjectCommand,
  HeadBucketCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

export type StorageFolder = 'products' | 'restaurants' | 'banners';

const MIME_TO_CONTENT_TYPE: Record<string, string> = {
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private client: S3Client | null = null;
  private bucket = '';
  private cdnBase = '';

  onModuleInit() {
    if (process.env.NODE_ENV === 'production') {
      this.ensureConfigured();
    }
    this.initClient();
  }

  private ensureConfigured() {
    const required = [
      'SPACES_ENDPOINT',
      'SPACES_REGION',
      'SPACES_BUCKET',
      'SPACES_ACCESS_KEY',
      'SPACES_SECRET_KEY',
      'SPACES_CDN_URL',
    ];
    const missing = required.filter((k) => !process.env[k]?.trim());
    if (missing.length) {
      throw new Error(
        `Missing DigitalOcean Spaces configuration in production: ${missing.join(', ')}`,
      );
    }
  }

  private initClient() {
    const endpoint = process.env.SPACES_ENDPOINT?.trim();
    const region = process.env.SPACES_REGION?.trim() ?? 'us-east-1';
    const accessKey = process.env.SPACES_ACCESS_KEY?.trim();
    const secretKey = process.env.SPACES_SECRET_KEY?.trim();

    this.bucket = process.env.SPACES_BUCKET?.trim() ?? '';
    this.cdnBase = (process.env.SPACES_CDN_URL?.trim() ?? '').replace(/\/$/, '');

    if (!endpoint || !accessKey || !secretKey || !this.bucket || !this.cdnBase) {
      this.logger.warn('Spaces storage not fully configured — uploads will fail until env is set');
      return;
    }

    this.client = new S3Client({
      endpoint,
      region,
      credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
      forcePathStyle: false,
    });
  }

  private getClient(): S3Client {
    if (!this.client) {
      this.ensureConfigured();
      this.initClient();
    }
    if (!this.client) {
      throw new Error('DigitalOcean Spaces client is not configured');
    }
    return this.client;
  }

  buildPublicUrl(key: string): string {
    const base = this.cdnBase || (process.env.SPACES_CDN_URL ?? '').replace(/\/$/, '');
    return `${base}/${key.replace(/^\//, '')}`;
  }

  async upload(
    buffer: Buffer,
    contentType: string,
    folder: StorageFolder,
  ): Promise<{ url: string; key: string }> {
    const key = `${folder}/${uuidv4()}.webp`;

    await this.getClient().send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        ACL: 'public-read',
        CacheControl: 'public, max-age=31536000, immutable',
      }),
    );

    return { url: this.buildPublicUrl(key), key };
  }

  async uploadWithKey(
    buffer: Buffer,
    contentType: string,
    key: string,
  ): Promise<{ url: string; key: string }> {
    const normalizedKey = key.replace(/^\//, '');

    await this.getClient().send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: normalizedKey,
        Body: buffer,
        ContentType: contentType,
        ACL: 'public-read',
        CacheControl: 'public, max-age=31536000, immutable',
      }),
    );

    return { url: this.buildPublicUrl(normalizedKey), key: normalizedKey };
  }

  async delete(key: string): Promise<void> {
    await this.getClient().send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key.replace(/^\//, ''),
      }),
    );
  }

  async checkConnectivity(): Promise<'ok' | 'error'> {
    try {
      if (!process.env.SPACES_BUCKET?.trim()) return 'error';
      this.getClient();
      await this.getClient().send(new HeadBucketCommand({ Bucket: this.bucket }));
      return 'ok';
    } catch (err) {
      this.logger.warn(`Spaces health check failed: ${err}`);
      return 'error';
    }
  }

  contentTypeFromMime(mime: string): string {
    const normalized = mime.toLowerCase();
    if (normalized === 'image/jpeg' || normalized === 'image/jpg') return 'image/jpeg';
    if (normalized === 'image/png') return 'image/png';
    if (normalized === 'image/webp') return 'image/webp';
    return normalized;
  }

  /** Map file extension segment to Content-Type for migration uploads. */
  contentTypeFromExtension(ext: string): string {
    const e = ext.toLowerCase().replace('.', '');
    return MIME_TO_CONTENT_TYPE[e] ?? 'application/octet-stream';
  }
}
