import express from 'express';

import { uploadSingleImageController } from '@/controllers/medias.controllers';
import { wrapRequestHandler } from '@/utils/handlers';

const mediasRouter = express.Router();

/**
 * Description: Upload a image
 * Path: /upload-image
 * Method: POST
 */
mediasRouter.post('/upload-image', wrapRequestHandler(uploadSingleImageController));

export default mediasRouter;
