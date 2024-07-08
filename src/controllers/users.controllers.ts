import { Request, Response } from 'express';

import userService from '@/services/user.services';

export const loginController = (req: Request, res: Response) => {
  const { email, password } = req.body;
  return res.status(400).json({
    error: 'Login failed',
  });
};

export const registerController = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const result = await userService.register({
    email,
    password,
  });

  return res.json({
    message: 'Register success',
    result,
  });
};
