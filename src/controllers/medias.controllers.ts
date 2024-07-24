import { Request, Response } from 'express';

import mediaService from '@/services/media.services';

export const uploadSingleImageController = async (req: Request, res: Response) => {
  const result = await mediaService.handleUploadSingleImage(req);

  return res.json({
    result,
  });
};
