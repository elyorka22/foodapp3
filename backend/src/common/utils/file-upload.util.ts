import { BadRequestException } from '@nestjs/common';

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);

export function validateImageUpload(file: Express.Multer.File): string {
  if (!file?.buffer?.length) {
    throw new BadRequestException('File is required');
  }

  const mime = file.mimetype?.toLowerCase() ?? '';
  if (!ALLOWED_MIME.has(mime)) {
    throw new BadRequestException('Only JPEG, PNG, and WebP images are allowed');
  }

  const rawExt = file.originalname?.split('.').pop()?.toLowerCase() ?? '';
  if (rawExt && !['jpg', 'jpeg', 'png', 'webp'].includes(rawExt)) {
    throw new BadRequestException('Invalid file extension');
  }

  return mime;
}
