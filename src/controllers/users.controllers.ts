import { Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ObjectId, SupportedTLSSocketOptions } from 'mongodb';

import { UserVerifyStatus } from '@/constants/enums';
import HTTP_STATUS from '@/constants/http-status';
import { USERS_MESSAGES } from '@/constants/messages';
import {
  ForgotPasswordRequestBody,
  LogoutRequestBody,
  RegisterRequestBody,
  ResetPasswordRequestBody,
  TokenPayload,
  UpdateMeRequestBody,
  VerifyEmailRequestBody,
  VerifyForgotPasswordRequestBody,
} from '@/models/requests/User.requests';
import User from '@/models/schemas/User.schema';
import databaseService from '@/services/database.services';
import userService from '@/services/user.services';

export const loginController = async (req: Request, res: Response) => {
  const user = req.user as User;
  const user_id = user._id;
  const result = await userService.login({
    user_id: user_id.toString(),
    verify: user.verify,
  });

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

export const verifyEmailController = async (
  req: Request<ParamsDictionary, any, VerifyEmailRequestBody>,
  res: Response,
) => {
  const { user_id } = req.decoded_email_verify_token as TokenPayload;
  const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) });

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

export const resendEmailVerifyController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload;

  const user = await databaseService.users.findOne({
    _id: new ObjectId(user_id),
  });

  if (!user) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      message: USERS_MESSAGES.USER_NOT_FOUND,
    });
  }

  if (user.verify === UserVerifyStatus.Verified) {
    return res.json({
      message: USERS_MESSAGES.EMAIL_ALREADY_VERIFIED_BEFORE,
    });
  }

  const result = await userService.resendVerifyEmail(user_id);

  return res.json(result);
};

export const forgotPasswordController = async (
  req: Request<ParamsDictionary, any, ForgotPasswordRequestBody>,
  res: Response,
) => {
  const { _id, verify } = req.user as User;

  const result = await userService.forgotPassword({ user_id: _id.toString(), verify });

  return res.json(result);
};

export const verifyForgotPasswordController = async (
  req: Request<ParamsDictionary, any, VerifyForgotPasswordRequestBody>,
  res: Response,
) => {
  return res.json({
    message: USERS_MESSAGES.VERIFY_FORGOT_PASSWORD_SUCCESS,
  });
};

export const resetPasswordController = async (
  req: Request<ParamsDictionary, any, ResetPasswordRequestBody>,
  res: Response,
) => {
  const { user_id } = req.decoded_forgot_password_token as TokenPayload;
  const { password } = req.body;

  const result = await userService.resetPassword(user_id, password);

  return res.json(result);
};

export const getMeController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload;

  const result = await userService.getMe(user_id);

  return res.json({
    message: USERS_MESSAGES.GET_ME_SUCCESS,
    result,
  });
};

export const updateMeController = async (req: Request<ParamsDictionary, any, UpdateMeRequestBody>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload;
  const { body } = req;

  const result = await userService.updateMe(user_id, body);

  return res.json({
    message: USERS_MESSAGES.UPDATE_ME_SUCCESS,
    result,
  });
};
