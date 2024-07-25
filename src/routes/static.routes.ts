import express from 'express';

import { serveImageController, serveVideoController } from '@/controllers/medias.controllers';
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
 * Path: /video/:name
 * Method: GET
 */
staticRouter.get('/video/:name', serveVideoController);

export default staticRouter;
