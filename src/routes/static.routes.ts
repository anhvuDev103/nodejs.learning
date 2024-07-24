import express from 'express';

import { serveImageController } from '@/controllers/medias.controllers';
import { wrapRequestHandler } from '@/utils/handlers';

const staticRouter = express.Router();

/**
 * Description: View a image
 * Path: /image/:name
 * Method: GET
 */
staticRouter.get('/image/:name', serveImageController);

export default staticRouter;
