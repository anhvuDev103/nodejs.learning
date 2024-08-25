import { NextFunction, Request, RequestHandler, Response } from 'express';

export const wrapRequestHandler = <P, Rs, Rq, Q>(func: RequestHandler<P, Rs, Rq, Q>) => {
  return async (req: Request<P, Rs, Rq, Q>, res: Response, next: NextFunction) => {
    try {
      await func(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};
