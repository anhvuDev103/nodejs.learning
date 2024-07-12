import { ObjectId } from 'mongodb';

import { TokenType, UserVerifyStatus } from '@/constants/enums';
import { USERS_MESSAGES } from '@/constants/messages';
import { LoginRequestBody, RegisterRequestBody } from '@/models/requests/User.requests';
import RefreshToken from '@/models/schemas/RefreshToken.schema';
import User from '@/models/schemas/User.schema';
import { hashPassword } from '@/utils/cryto';
import { signToken } from '@/utils/jwt';

import databaseService from './database.services';

class UserService {
  private signAccessToken(user_id: string) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.AccessToken,
      },
      privateKey: process.env.JWT_ACCESS_TOKEN_SECRET as string,
      options: {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
      },
    });
  }

  private signRefreshToken(user_id: string) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.RefreshToken,
      },
      privateKey: process.env.JWT_REFRESH_TOKEN_SECRET as string,
      options: {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
      },
    });
  }

  private signEmailVerifyToken(user_id: string) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.EmailVerifyToken,
      },
      privateKey: process.env.JWT_EMAIL_VERIFY_TOKEN_SECRET as string,
      options: {
        expiresIn: process.env.EMAIL_VERIFY_TOKEN_EXPIRES_IN,
      },
    });
  }

  private signAccessAndRefreshToken(user_id: string) {
    return Promise.all([this.signAccessToken(user_id), this.signRefreshToken(user_id)]);
  }

  private signForgotPasswordToken(user_id: string) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.ForgotPasswordToken,
      },
      privateKey: process.env.JWT_FORGOT_PASSWORD_TOKEN_SECRET as string,
      options: {
        expiresIn: process.env.FORGOT_PASSWORD_TOKEN_EXPIRES_IN,
      },
    });
  }

  async login(user_id: string) {
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken(user_id);

    await databaseService.refreshTokens.insertOne(
      new RefreshToken({
        user_id: ObjectId.createFromHexString(user_id),
        token: refresh_token,
      }),
    );
    return {
      access_token,
      refresh_token,
    };
  }

  async register(payload: RegisterRequestBody) {
    const user_id = new ObjectId();

    const email_verify_token = await this.signEmailVerifyToken(user_id.toString());

    await databaseService.users.insertOne(
      new User({
        ...payload,
        _id: user_id,
        password: hashPassword(payload.password),
        date_of_birth: new Date(payload.date_of_birth),
        email_verify_token,
      }),
    );

    const [access_token, refresh_token] = await this.signAccessAndRefreshToken(user_id.toString());

    console.log('Send email: ', email_verify_token);

    await databaseService.refreshTokens.insertOne(
      new RefreshToken({
        user_id,
        token: refresh_token,
      }),
    );

    return {
      access_token,
      refresh_token,
    };
  }

  async logout(refresh_token: string) {
    await databaseService.refreshTokens.deleteOne({ token: refresh_token });

    return {
      message: USERS_MESSAGES.LOGOUT_SUCCESS,
    };
  }

  async checkEmailExist(email: string) {
    const user = await databaseService.users.findOne({
      email,
    });

    return Boolean(user);
  }

  async verifyEmail(user_id: string) {
    const [tokens] = await Promise.all([
      this.signAccessAndRefreshToken(user_id),
      databaseService.users.updateOne(
        {
          _id: ObjectId.createFromHexString(user_id),
        },
        {
          $set: {
            email_verify_token: '',
            verify: UserVerifyStatus.Verified,
          },
          $currentDate: {
            updated_at: true,
          },
        },
      ),
    ]);

    const [access_token, refresh_token] = tokens;

    return {
      access_token,
      refresh_token,
    };
  }

  async resendVerifyEmail(user_id: string) {
    //Send email action
    const email_verify_token = await this.signEmailVerifyToken(user_id.toString());

    await databaseService.users.updateOne(
      {
        _id: ObjectId.createFromHexString(user_id),
      },
      {
        $set: {
          email_verify_token,
        },
        $currentDate: {
          updated_at: true,
        },
      },
    );

    return {
      message: USERS_MESSAGES.RESEND_VERIFY_EMAIL_SUCCESS,
    };
  }

  async forgotPassword(user_id: string) {
    const forgot_password_token = await this.signForgotPasswordToken(user_id);

    await databaseService.users.updateOne(
      {
        _id: ObjectId.createFromHexString(user_id),
      },
      {
        $set: {
          forgot_password_token,
        },
        $currentDate: {
          updated_at: true,
        },
      },
    );

    //Send to email with link: https://twitter.com/forgot-password?token=token
    console.log('Forgot password token: ', forgot_password_token);

    return {
      message: USERS_MESSAGES.CHECK_EMAIL_TO_RESET_PASSWORD,
    };
  }
}

const userService = new UserService();

export default userService;
