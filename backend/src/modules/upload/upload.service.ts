import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { validateImageUpload } from '../../common/utils/file-upload.util';
import { StorageFolder, StorageService } from '../storage/storage.service';

@Injectable()
export class UploadService {
  constructor(private storage: StorageService) {}

  /** Infer storage folder from admin page Referer without changing the upload API. */
  private inferFolder(req?: Request): StorageFolder {
    const referer = req?.headers?.referer ?? '';
    if (referer.includes('/admin/banners')) return 'banners';
    if (referer.includes('/admin/restaurants')) return 'restaurants';
    return 'products';
  }

  async saveFile(
    file: Express.Multer.File,
    req?: Request,
  ): Promise<{ url: string; key: string; filename: string }> {
    const mime = validateImageUpload(file);
    const contentType = this.storage.contentTypeFromMime(mime);
    const folder = this.inferFolder(req);
    const result = await this.storage.upload(file.buffer, contentType, folder);
    return { url: result.url, key: result.key, filename: result.key };
  }
}
