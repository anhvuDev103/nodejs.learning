import express from 'express';

import {
  uploadImageController,
  uploadVideoController,
  uploadVideoHlsController,
} from '@/controllers/medias.controllers';
import { accessTokenValidator, verifiedUserValidator } from '@/middlewares/users.middlewares';
import { wrapRequestHandler } from '@/utils/handlers';

const mediasRouter = express.Router();

/**
 * Description: Upload image
 * Path: /upload-image
 * Method: POST
 */
mediasRouter.post(
  '/upload-image',
  accessTokenValidator,
  verifiedUserValidator,
  wrapRequestHandler(uploadImageController),
);

/**
 * Description: Upload video
 * Path: /upload-video
 * Method: POST
 */
mediasRouter.post(
  '/upload-video',
  accessTokenValidator,
  verifiedUserValidator,
  wrapRequestHandler(uploadVideoController),
);

/**
 * Description: Upload video
 * Path: /upload-video
 * Method: POST
 */
mediasRouter.post(
  '/upload-video-hls',
  accessTokenValidator,
  verifiedUserValidator,
  wrapRequestHandler(uploadVideoHlsController),
);

export default mediasRouter;
