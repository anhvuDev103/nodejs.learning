import axios from 'axios';
import { ObjectId } from 'mongodb';

import { TokenType, UserVerifyStatus } from '@/constants/enums';
import HTTP_STATUS from '@/constants/http-status';
import { USERS_MESSAGES } from '@/constants/messages';
import { ErrorWithStatus } from '@/models/Errors';
import { RegisterRequestBody, UpdateMeRequestBody } from '@/models/requests/User.requests';
import Follower from '@/models/schemas/Follower.schema';
import RefreshToken from '@/models/schemas/RefreshToken.schema';
import User from '@/models/schemas/User.schema';
import { hashPassword } from '@/utils/cryto';
import { signToken } from '@/utils/jwt';

import databaseService from './database.services';

class UserService {
  private signAccessToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.AccessToken,
        verify,
      },
      privateKey: process.env.JWT_ACCESS_TOKEN_SECRET as string,
      options: {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
      },
    });
  }

  private signRefreshToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.RefreshToken,
        verify,
      },
      privateKey: process.env.JWT_REFRESH_TOKEN_SECRET as string,
      options: {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
      },
    });
  }

  private signEmailVerifyToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.EmailVerifyToken,
        verify,
      },
      privateKey: process.env.JWT_EMAIL_VERIFY_TOKEN_SECRET as string,
      options: {
        expiresIn: process.env.EMAIL_VERIFY_TOKEN_EXPIRES_IN,
      },
    });
  }

  private signAccessAndRefreshToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return Promise.all([this.signAccessToken({ user_id, verify }), this.signRefreshToken({ user_id, verify })]);
  }

  private signForgotPasswordToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.ForgotPasswordToken,
        verify,
      },
      privateKey: process.env.JWT_FORGOT_PASSWORD_TOKEN_SECRET as string,
      options: {
        expiresIn: process.env.FORGOT_PASSWORD_TOKEN_EXPIRES_IN,
      },
    });
  }

  private async getOauthGoogleToken(code: string) {
    const body = {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code',
    };

    const { data } = await axios.post('https://oauth2.googleapis.com/token', body, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    return data as {
      access_token: string;
      id_token: string;
    };
  }

  private async getGoogleUserInfo(access_token: string, id_token: string) {
    const { data } = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo', {
      params: {
        access_token,
        alt: 'json',
      },
      headers: {
        Authorization: `Bearer ${id_token}`,
      },
    });

    return data as {
      id: string;
      email: string;
      verified_email: boolean;
      name: string;
      given_name: string;
      family_name: string;
      picture: string;
    };
  }

  async login({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken({ user_id, verify });

    await databaseService.refreshTokens.insertOne(
      new RefreshToken({
        user_id: new ObjectId(user_id),
        token: refresh_token,
      }),
    );
    return {
      access_token,
      refresh_token,
    };
  }

  async oauth(code: string) {
    const { id_token, access_token } = await this.getOauthGoogleToken(code);
    const userInfo = await this.getGoogleUserInfo(access_token, id_token);

    if (!userInfo.verified_email) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.GMAIL_NOT_VERIFIED,
        status: HTTP_STATUS.BAD_REQUEST,
      });
    }

    const user = await databaseService.users.findOne({
      email: userInfo.email,
    });

    if (user) {
      const [access_token, refresh_token] = await this.signAccessAndRefreshToken({
        user_id: user._id.toString(),
        verify: user.verify,
      });

      await databaseService.refreshTokens.insertOne(
        new RefreshToken({
          user_id: new ObjectId(user._id),
          token: refresh_token,
        }),
      );

      return {
        access_token,
        refresh_token,
        newUser: 0,
        verify: user.verify,
      };
    } else {
      const password = Math.random().toString(36).substring(2, 15);

      const data = await this.register({
        email: userInfo.email,
        name: userInfo.name,
        date_of_birth: new Date().toISOString(),
        password,
        confirm_password: password,
      });

      return {
        ...data,
        newUser: 1,
        verify: UserVerifyStatus.Unverified,
      };
    }
  }

  async register(payload: RegisterRequestBody) {
    const user_id = new ObjectId();

    const email_verify_token = await this.signEmailVerifyToken({
      user_id: user_id.toString(),
      verify: UserVerifyStatus.Unverified,
    });

    await databaseService.users.insertOne(
      new User({
        ...payload,
        _id: user_id,
        username: `user${user_id.toString()}`,
        password: hashPassword(payload.password),
        date_of_birth: new Date(payload.date_of_birth),
        email_verify_token,
      }),
    );

    const [access_token, refresh_token] = await this.signAccessAndRefreshToken({
      user_id: user_id.toString(),
      verify: UserVerifyStatus.Unverified,
    });

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
      this.signAccessAndRefreshToken({ user_id, verify: UserVerifyStatus.Verified }),
      databaseService.users.updateOne(
        {
          _id: new ObjectId(user_id),
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
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({
        token: refresh_token,
        user_id: new ObjectId(user_id),
      }),
    );

    return {
      access_token,
      refresh_token,
    };
  }

  async resendVerifyEmail(user_id: string) {
    //Send email action
    const email_verify_token = await this.signEmailVerifyToken({
      user_id: user_id.toString(),
      verify: UserVerifyStatus.Unverified,
    });

    await databaseService.users.updateOne(
      {
        _id: new ObjectId(user_id),
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

  async forgotPassword({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    const forgot_password_token = await this.signForgotPasswordToken({ user_id, verify });

    await databaseService.users.updateOne(
      {
        _id: new ObjectId(user_id),
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

  async resetPassword(user_id: string, password: string) {
    await databaseService.users.updateOne(
      {
        _id: new ObjectId(user_id),
      },
      {
        $set: {
          forgot_password_token: '',
          password: hashPassword(password),
        },
        $currentDate: {
          updated_at: true,
        },
      },
    );

    return {
      message: USERS_MESSAGES.RESET_PASSWORD_SUCCESS,
    };
  }

  async getMe(user_id: string) {
    const user = await databaseService.users.findOne(
      {
        _id: new ObjectId(user_id),
      },
      {
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0,
        },
      },
    );

    return user;
  }

  async updateMe(user_id: string, payload: UpdateMeRequestBody) {
    const _payload = payload.date_of_birth
      ? {
          ...payload,
          date_of_birth: new Date(payload.date_of_birth),
        }
      : payload;

    const user = await databaseService.users.findOneAndUpdate(
      {
        _id: new ObjectId(user_id),
      },
      {
        $set: {
          ...(_payload as UpdateMeRequestBody & { date_of_birth?: Date }),
        },
        $currentDate: {
          updated_at: true,
        },
      },
      {
        returnDocument: 'after',
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0,
        },
      },
    );

    return user;
  }

  async getProfile(username: string) {
    const user = await databaseService.users.findOne(
      {
        username,
      },
      {
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0,
          verify: 0,
          created_at: 0,
          updated_at: 0,
        },
      },
    );

    if (user === null) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.USER_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND,
      });
    }

    return user;
  }

  async follow(user_id: string, followed_user_id: string) {
    const follower = await databaseService.followers.findOne({
      user_id: new ObjectId(user_id),
      followed_user_id: new ObjectId(followed_user_id),
    });

    if (follower === null) {
      await databaseService.followers.insertOne(
        new Follower({
          user_id: new ObjectId(user_id),
          followed_user_id: new ObjectId(followed_user_id),
        }),
      );

      return {
        message: USERS_MESSAGES.FOLLOW_SUCCESS,
      };
    }

    return {
      message: USERS_MESSAGES.FOLLOWED,
    };
  }

  async unfollow(user_id: string, followed_user_id: string) {
    const follower = await databaseService.followers.findOne({
      user_id: new ObjectId(user_id),
      followed_user_id: new ObjectId(followed_user_id),
    });

    if (follower === null) {
      return {
        message: USERS_MESSAGES.ALREADY_UNFOLLOWED,
      };
    }

    await databaseService.followers.deleteOne({
      user_id: new ObjectId(user_id),
      followed_user_id: new ObjectId(followed_user_id),
    });

    return {
      message: USERS_MESSAGES.UNFOLLOW_SUCCESS,
    };
  }

  async changePassword(user_id: string, password: string) {
    await databaseService.users.updateOne(
      {
        _id: new ObjectId(user_id),
      },
      {
        $set: {
          password: hashPassword(password),
        },
        $currentDate: {
          updated_at: true,
        },
      },
    );

    return {
      message: USERS_MESSAGES.CHANGE_PASSWORD_SUCCESS,
    };
  }
}

const userService = new UserService();

export default userService;
