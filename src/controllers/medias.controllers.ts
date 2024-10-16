import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR } from '@/constants/dir';
import HTTP_STATUS from '@/constants/http-status';
import { USERS_MESSAGES } from '@/constants/messages';
import {
  ServeImageParams,
  ServeM3u8Params,
  ServeSegmentParams,
  VideoStatusParams,
} from '@/models/requests/Static.requests';
import mediaService from '@/services/media.services';
import { sendFileFromS3 } from '@/utils/s3';

export const serveImageController = (req: Request<ServeImageParams>, res: Response) => {
  const { name } = req.params;

  return res.sendFile(path.resolve(UPLOAD_IMAGE_DIR, name + '.jpg'), (err) => {
    if (err) {
      res.status((err as any).status).send('Not found');
    }
  });
};

export const serveVideoStreamController = async (req: Request<ServeImageParams>, res: Response) => {
  const range = req.headers.range;

  if (!range) {
    return res.status(HTTP_STATUS.BAD_REQUEST).send('Requires Range headers');
  }

  const mime = (await import('mime')).default;

  const { name } = req.params;
  const videoPath = path.resolve(UPLOAD_VIDEO_DIR, name);

  // 1MB = 10^6 = 2^20 (1024 * 1024)

  const videoSize = fs.statSync(videoPath).size; //bytes
  const chunkSize = 10 ** 6; //1MB
  const start = Number(range.replace(/\D/g, ''));
  const end = Math.min(start + chunkSize, videoSize - 1);

  const contentLength = end - start + 1;
  const contentType = mime.getType(videoPath) || 'video/*';
  const headers = {
    'Content-Range': `bytes ${start}-${end}/${videoSize}`,
    'Accept-Range': 'bytes',
    'Content-Length': contentLength,
    'Content-Type': contentType,
  };

  res.writeHead(HTTP_STATUS.PARTIAL_CONTENT, headers);
  const videoStream = fs.createReadStream(videoPath, { start, end });
  videoStream.pipe(res);
};

export const serveM3u8Controller = (req: Request<ServeM3u8Params>, res: Response) => {
  const { id } = req.params;
  const [realId] = id.split('.');

  sendFileFromS3(res, `videos-hls/${realId}/master.m3u8`);
};

export const serveSegmentController = (req: Request<ServeSegmentParams>, res: Response) => {
  const { id, v, segment } = req.params;

  sendFileFromS3(res, `videos-hls/${id}/${v}/${segment}`);
};

export const uploadImageController = async (req: Request, res: Response) => {
  const url = await mediaService.uploadImage(req);

  return res.json({
    message: USERS_MESSAGES.UPLOAD_SUCCESS,
    result: url,
  });
};

export const uploadVideoController = async (req: Request, res: Response) => {
  const url = await mediaService.uploadVideo(req);

  return res.json({
    message: USERS_MESSAGES.UPLOAD_SUCCESS,
    result: url,
  });
};

export const uploadVideoHlsController = async (req: Request, res: Response) => {
  const url = await mediaService.uploadVideoHls(req);

  return res.json({
    message: USERS_MESSAGES.UPLOAD_SUCCESS,
    result: url,
  });
};

export const videoStatusController = async (req: Request<VideoStatusParams>, res: Response) => {
  const { id } = req.params;
  const result = await mediaService.getVideoStatus(id);

  return res.json({
    message: USERS_MESSAGES.GET_VIDEO_STATUS_SUCCESS,
    result,
  });
};
