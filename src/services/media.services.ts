import { Request } from 'express';
import fs from 'fs';
import fsPromise from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

import { isProduction } from '@/constants/config';
import { UPLOAD_IMAGE_DIR } from '@/constants/dir';
import { MediaType } from '@/constants/enums';
import { Media } from '@/models/Other';
import { getNameFromFullName, handleUploadImage, handleUploadVideo } from '@/utils/file';
import { encodeHLSWithMultipleVideoStreams } from '@/utils/video';

class MediaService {
  async uploadImage(req: Request) {
    const files = await handleUploadImage(req);

    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const newName = getNameFromFullName(file.newFilename);
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

  async uploadVideoHls(req: Request) {
    const files = await handleUploadVideo(req);

    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        await encodeHLSWithMultipleVideoStreams(file.filepath);
        await fsPromise.unlink(file.filepath);

        const name = getNameFromFullName(file.newFilename);

        return {
          url: isProduction
            ? `${process.env.HOST}/static/video-hls/${name}.m3u8`
            : `http://localhost:${process.env.PORT}/static/video-hls/${name}.m3u8`,
          type: MediaType.Hls,
        };
      }),
    );

    return result;
  }
}

const mediaService = new MediaService();

export default mediaService;
