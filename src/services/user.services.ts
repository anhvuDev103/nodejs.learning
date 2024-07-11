import { ObjectId } from 'mongodb';

import { TokenType } from '@/constants/enums';
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
      options: {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
      },
    });
  }

  private signAccessAndRefreshToken(user_id: string) {
    return Promise.all([this.signAccessToken(user_id), this.signRefreshToken(user_id)]);
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
    const result = await databaseService.users.insertOne(
      new User({
        ...payload,
        password: hashPassword(payload.password),
        date_of_birth: new Date(payload.date_of_birth),
      }),
    );

    const user_id = result.insertedId;

    const [access_token, refresh_token] = await this.signAccessAndRefreshToken(user_id.toString());

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

  async checkEmailExist(email: string) {
    const user = await databaseService.users.findOne({
      email,
    });

    return Boolean(user);
  }
}

const userService = new UserService();

export default userService;
