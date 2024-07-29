import express from 'express';

import {
  serveImageController,
  serveM3u8Controller,
  serveSegmentController,
  serveVideoStreamController,
} from '@/controllers/medias.controllers';

const staticRouter = express.Router();

/**
 * Description: View a image
 * Path: /image/:name
 * Method: GET
 */
staticRouter.get('/image/:name', serveImageController);

/**
 * Description: Stream a video
 * Path: /video-stream/:name
 * Method: GET
 */
staticRouter.get('/video-stream/:name', serveVideoStreamController);

/**
 * Description: Get m3u8 file
 * Path: /video-hls/:id
 * Method: GET
 */
staticRouter.get('/video-hls/:id/master.m3u8', serveM3u8Controller);

/**
 * Description: Serve segment
 * Path: /video-hls/:id
 * Method: GET
 */
staticRouter.get('/video-hls/:id/:v/:segment', serveSegmentController);

export default staticRouter;
