import { Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ObjectId } from 'mongodb';

import HTTP_STATUS from '@/constants/http-status';
import { USERS_MESSAGES } from '@/constants/messages';
import {
  EmailVerifyRequestBody,
  LogoutRequestBody,
  RegisterRequestBody,
  TokenPayload,
} from '@/models/requests/User.requests';
import User from '@/models/schemas/User.schema';
import databaseService from '@/services/database.services';
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

export const emailVerifyTokenController = async (
  req: Request<ParamsDictionary, any, EmailVerifyRequestBody>,
  res: Response,
) => {
  const { user_id } = req.decoded_email_verify_token as TokenPayload;
  const user = await databaseService.users.findOne({ _id: ObjectId.createFromHexString(user_id) });

  if (!user) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      message: USERS_MESSAGES.USER_NOT_FOUND,
    });
  }

  //verified
  if (user.email_verify_token === '') {
    return res.json({
      message: USERS_MESSAGES.EMAIL_ALREADY_VERIFIED_BEFORE,
    });
  }

  const result = await userService.verifyEmail(user_id);

  return res.json({
    message: USERS_MESSAGES.EMAIL_VERIFY_SUCCESS,
    result,
  });
};
