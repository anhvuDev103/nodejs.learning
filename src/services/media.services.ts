import { Request } from 'express';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

import { UPLOAD_DIR } from '@/constants/dir';
import { getNameFormFullName, handleUploadSingleImage } from '@/utils/file';

class MediaService {
  async handleUploadSingleImage(req: Request) {
    const file = await handleUploadSingleImage(req);
    const newName = getNameFormFullName(file.newFilename);
    const newPath = path.resolve(UPLOAD_DIR, `${newName}.jpg`);
    await sharp(file.filepath).jpeg().toFile(newPath);

    fs.unlinkSync(file.filepath);

    return `http://localhost:4000/uploads/${newName}.jpg`;
  }
}

const mediaService = new MediaService();

export default mediaService;
