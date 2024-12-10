import { Request } from 'express';
import { JsonWebTokenError } from 'jsonwebtoken';
import { capitalize } from 'lodash';

import HTTP_STATUS from '@/constants/http-status';
import { USERS_MESSAGES } from '@/constants/messages';
import { ErrorWithStatus } from '@/models/Errors';

import { verifyToken } from './jwt';

export const numberEnumToArray = (numberEnum: { [key: string]: string | number }) => {
  return Object.values(numberEnum).filter((value) => typeof value === 'number');
};

export const verifyAccessToken = async (access_token: string, req?: Request) => {
  if (!access_token) {
    throw new ErrorWithStatus({
      message: USERS_MESSAGES.ACCESS_TOKEN_IS_REQUIRED,
      status: HTTP_STATUS.UNAUTHORIZED,
    });
  }
  try {
    const decoded_authorization = await verifyToken({
      token: access_token,
      secretOrPublicKey: process.env.JWT_ACCESS_TOKEN_SECRET as string,
    });

    if (req) {
      (req as Request).decoded_authorization = decoded_authorization;
      return true;
    }

    return decoded_authorization;
  } catch (error) {
    throw new ErrorWithStatus({
      message: capitalize((error as JsonWebTokenError).message),
      status: HTTP_STATUS.UNAUTHORIZED,
    });
  }
};
