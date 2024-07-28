import express from 'express';

import { serveImageController, serveVideoStreamController } from '@/controllers/medias.controllers';
import { wrapRequestHandler } from '@/utils/handlers';

const staticRouter = express.Router();

/**
 * Description: View a image
 * Path: /image/:name
 * Method: GET
 */
staticRouter.get('/image/:name', serveImageController);

/**
 * Description: View a video
 * Path: /video-stream/:name
 * Method: GET
 */
staticRouter.get('/video-stream/:name', serveVideoStreamController);

export default staticRouter;
