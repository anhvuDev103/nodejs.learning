import { Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';

import { RegisterRequestBody } from '@/models/requests/User.requests';
import userService from '@/services/user.services';

export const loginController = (req: Request, res: Response) => {
  const { email, password } = req.body;
  return res.status(400).json({
    error: 'Login failed',
  });
};

export const registerController = async (req: Request<ParamsDictionary, any, RegisterRequestBody>, res: Response) => {
  const result = await userService.register(req.body);

  return res.json({
    message: 'Register success',
    result,
  });
};
