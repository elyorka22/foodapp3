import { Injectable } from '@nestjs/common';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { validateImageUpload } from '../../common/utils/file-upload.util';

@Injectable()
export class UploadService {
  private uploadDir = process.env.UPLOAD_DIR ?? './uploads';

  ensureUploadDir() {
    if (!existsSync(this.uploadDir)) {
      mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  saveFile(file: Express.Multer.File): { url: string; filename: string } {
    const ext = validateImageUpload(file);
    this.ensureUploadDir();
    const filename = `${uuidv4()}.${ext}`;
    const filepath = join(this.uploadDir, filename);
    writeFileSync(filepath, file.buffer);

    const baseUrl = process.env.UPLOAD_BASE_URL ?? '/uploads';
    return { url: `${baseUrl}/${filename}`, filename };
  }
}
