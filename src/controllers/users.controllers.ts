import { Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';

import { USERS_MESSAGES } from '@/constants/messages';
import { LogoutRequestBody, RegisterRequestBody } from '@/models/requests/User.requests';
import User from '@/models/schemas/User.schema';
import userService from '@/services/user.services';

export const loginController = async (req: Request, res: Response) => {
  const user = req.user as User;
  const user_id = user._id;
  const result = await userService.login(user_id.toString());

  return res.json({
    message: USERS_MESSAGES.LOGIN_SUCCESS,
    result,
  });
};

export const registerController = async (req: Request<ParamsDictionary, any, RegisterRequestBody>, res: Response) => {
  const result = await userService.register(req.body);

  return res.json({
    message: USERS_MESSAGES.REGISTER_SUCCESS,
    result,
  });
};

export const logoutController = async (req: Request<ParamsDictionary, any, LogoutRequestBody>, res: Response) => {
  const { refresh_token } = req.body;
  const result = await userService.logout(refresh_token);

  return res.json(result);
};
