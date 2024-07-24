import { Request } from 'express';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

import { isProduction } from '@/constants/config';
import { UPLOAD_DIR } from '@/constants/dir';
import { MediaType } from '@/constants/enums';
import { Media } from '@/models/Other';
import { getNameFormFullName, handleUploadImage } from '@/utils/file';

class MediaService {
  async uploadImage(req: Request) {
    const files = await handleUploadImage(req);

    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const newName = getNameFormFullName(file.newFilename);
        const newPath = path.resolve(UPLOAD_DIR, `${newName}.jpg`);
        await sharp(file.filepath).jpeg().toFile(newPath);
        fs.unlinkSync(file.filepath);

        return {
          url: isProduction
            ? `${process.env.HOST}/static/image/${newName}`
            : `http://localhost:${process.env.PORT}/static/image/${newName}`,
          type: MediaType.Image,
        };
      }),
    );

    return result;
  }
}

const mediaService = new MediaService();

export default mediaService;
