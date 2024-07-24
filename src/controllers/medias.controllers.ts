import { Request, Response } from 'express';
import path from 'path';

import { UPLOAD_DIR } from '@/constants/dir';
import { USERS_MESSAGES } from '@/constants/messages';
import { ServeImageParams } from '@/models/requests/Static.requests';
import mediaService from '@/services/media.services';

export const uploadSingleImageController = async (req: Request, res: Response) => {
  const url = await mediaService.handleUploadSingleImage(req);

  return res.json({
    message: USERS_MESSAGES.UPLOAD_SUCCESS,
    result: url,
  });
};

export const serveImageController = (req: Request<ServeImageParams>, res: Response) => {
  const { name } = req.params;

  return res.sendFile(path.resolve(UPLOAD_DIR, name + '.jpg'), (err) => {
    if (err) {
      res.status((err as any).status).send('Not found');
    }
  });
};
