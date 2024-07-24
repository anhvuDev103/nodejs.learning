import { Request, Response } from 'express';

import { USERS_MESSAGES } from '@/constants/messages';
import mediaService from '@/services/media.services';

export const uploadSingleImageController = async (req: Request, res: Response) => {
  const url = await mediaService.handleUploadSingleImage(req);

  return res.json({
    message: USERS_MESSAGES.UPLOAD_SUCCESS,
    result: url,
  });
};
