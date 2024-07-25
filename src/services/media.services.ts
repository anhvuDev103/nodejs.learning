import { Request } from 'express';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

import { isProduction } from '@/constants/config';
import { UPLOAD_IMAGE_DIR } from '@/constants/dir';
import { MediaType } from '@/constants/enums';
import { Media } from '@/models/Other';
import { getNameFormFullName, handleUploadImage, handleUploadVideo } from '@/utils/file';

class MediaService {
  async uploadImage(req: Request) {
    const files = await handleUploadImage(req);

    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const newName = getNameFormFullName(file.newFilename);
        const newPath = path.resolve(UPLOAD_IMAGE_DIR, `${newName}.jpg`);
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

  async uploadVideo(req: Request) {
    const files = await handleUploadVideo(req);

    const result = files.map((file) => {
      return {
        url: isProduction
          ? `${process.env.HOST}/static/video/${file.newFilename}`
          : `http://localhost:${process.env.PORT}/static/video/${file.newFilename}`,
        type: MediaType.Video,
      };
    });

    return result;
  }
}

const mediaService = new MediaService();

export default mediaService;
