import { Request } from 'express';
import fs from 'fs';
import fsPromise from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

import { isProduction } from '@/constants/config';
import { UPLOAD_IMAGE_DIR } from '@/constants/dir';
import { EncodingStatus, MediaType } from '@/constants/enums';
import { Media } from '@/models/Other';
import VideoStatus from '@/models/schemas/VideoStatus.schema';
import { getNameFromFullName, handleUploadImage, handleUploadVideo } from '@/utils/file';
import { encodeHLSWithMultipleVideoStreams } from '@/utils/video';

import databaseService from './database.services';

class Queue {
  items: string[];
  encoding: boolean;

  constructor() {
    this.items = [];
    this.encoding = false;
  }

  async enqueue(item: string) {
    this.items.push(item);

    const name = getNameFromFullName(item.split('\\').pop() as string);
    await databaseService.videoStatus.insertOne(
      new VideoStatus({
        name,
        status: EncodingStatus.Pending,
      }),
    );

    await this.processEncode();
  }

  async processEncode() {
    if (this.encoding) return;

    if (this.items.length > 0) {
      this.encoding = true;
      const videoPath = this.items[0];

      const name = getNameFromFullName(videoPath.split('/').pop() as string);
      await databaseService.videoStatus.updateOne(
        {
          name,
        },
        {
          $set: {
            status: EncodingStatus.Processing,
          },
          $currentDate: {
            updated_at: true,
          },
        },
      );

      try {
        await encodeHLSWithMultipleVideoStreams(videoPath);
        this.items.shift();
        await fsPromise.unlink(videoPath);
        console.log(`Encode video ${videoPath} success`);

        await databaseService.videoStatus.updateOne(
          {
            name,
          },
          {
            $set: {
              status: EncodingStatus.Success,
            },
            $currentDate: {
              updated_at: true,
            },
          },
        );
      } catch (error) {
        await databaseService.videoStatus
          .updateOne(
            {
              name,
            },
            {
              $set: {
                status: EncodingStatus.Failed,
              },
              $currentDate: {
                updated_at: true,
              },
            },
          )
          .catch((error) => {
            console.error('Update video status failed', error);
          });

        console.error(`Encode video ${videoPath} error`);
        console.error(error);
      } finally {
        this.encoding = false;
      }

      this.processEncode();
    } else {
      console.log('Encode video queue is empty');
    }
  }
}

const queue = new Queue();

class MediaService {
  async uploadImage(req: Request) {
    const files = await handleUploadImage(req);

    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const newName = getNameFromFullName(file.newFilename);
        const newPath = path.resolve(UPLOAD_IMAGE_DIR, `${newName}.jpg`);

        sharp.cache(false);
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
        const name = getNameFromFullName(file.newFilename);

        queue.enqueue(file.filepath);

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

  async getVideoStatus(id: string) {
    const result = await databaseService.videoStatus.findOne({
      name: id,
    });

    return result;
  }
}

const mediaService = new MediaService();

export default mediaService;
