import { BadRequestException } from '@nestjs/common';

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const ALLOWED_EXT = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif']);

const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

export function validateImageUpload(file: Express.Multer.File): string {
  if (!file?.buffer?.length) {
    throw new BadRequestException('File is required');
  }

  const mime = file.mimetype?.toLowerCase() ?? '';
  if (!ALLOWED_MIME.has(mime)) {
    throw new BadRequestException('Only JPEG, PNG, WebP, and GIF images are allowed');
  }

  const rawExt = file.originalname?.split('.').pop()?.toLowerCase() ?? '';
  if (rawExt && !ALLOWED_EXT.has(rawExt)) {
    throw new BadRequestException('Invalid file extension');
  }

  const ext = MIME_TO_EXT[mime];
  if (!ext) {
    throw new BadRequestException('Unsupported image type');
  }

  return ext;
}
