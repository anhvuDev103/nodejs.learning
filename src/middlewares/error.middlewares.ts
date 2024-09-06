import { NextFunction, Request, Response } from 'express';
import { omit } from 'lodash';

import HTTP_STATUS from '@/constants/http-status';
import { ErrorWithStatus } from '@/models/Errors';

export const defaultErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  try {
    if (err instanceof ErrorWithStatus) {
      return res.status(err.status).json(omit(err, ['status']));
    }

    const finalError: any = {};

    Object.getOwnPropertyNames(err).forEach((key) => {
      if (
        !Object.getOwnPropertyDescriptor(err, key)?.configurable ||
        !Object.getOwnPropertyDescriptor(err, key)?.writable
      ) {
        return;
      }

      finalError[key] = err[key];
    });

    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: finalError.message,
      error_info: omit(finalError, ['stack']),
    });
  } catch (error: any) {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: 'Internal server error',
      error_info: omit(error, ['stack']),
    });
  }
};
