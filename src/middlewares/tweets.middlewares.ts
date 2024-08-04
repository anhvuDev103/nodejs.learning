import { NextFunction, Request, Response } from 'express';
import { checkSchema } from 'express-validator';
import { isEmpty } from 'lodash';
import { ObjectId } from 'mongodb';

import { MediaType, TweetAudience, TweetType, UserVerifyStatus } from '@/constants/enums';
import HTTP_STATUS from '@/constants/http-status';
import { TWEETS_MESSAGES, USERS_MESSAGES } from '@/constants/messages';
import { ErrorWithStatus } from '@/models/Errors';
import { TokenPayload } from '@/models/requests/User.requests';
import Tweet from '@/models/schemas/Tweet.schema';
import databaseService from '@/services/database.services';
import { numberEnumToArray } from '@/utils/common';
import { validate } from '@/utils/validation';

const tweetType = numberEnumToArray(TweetType);
const tweetAudiences = numberEnumToArray(TweetAudience);
const mediaType = numberEnumToArray(MediaType);

export const createTweetValidator = validate(
  checkSchema(
    {
      type: {
        isIn: {
          options: [tweetType],
          errorMessage: TWEETS_MESSAGES.INVALID_TYPE,
        },
      },
      audience: {
        isIn: {
          options: [tweetAudiences],
          errorMessage: TWEETS_MESSAGES.INVALID_AUDIENCE,
        },
      },
      content: {
        isString: true,
        custom: {
          options: async (value, { req }) => {
            const type = req.body.type as TweetType;
            const hashtags = req.body.hashtags as string[];
            const mentions = req.body.mentions as string[];

            if (
              [TweetType.Comment, TweetType.QuoteTweet, TweetType.Tweet].includes(type) &&
              isEmpty(hashtags) &&
              isEmpty(mentions) &&
              value === ''
            ) {
              throw new Error(TWEETS_MESSAGES.CONTENT_MUST_BE_A_NON_EMPTY_STRING);
            }

            if (type === TweetType.Retweet && value !== '') {
              throw new Error(TWEETS_MESSAGES.CONTENT_MUST_BE_EMPTY_STRING);
            }

            return true;
          },
        },
      },
      parent_id: {
        custom: {
          options: async (value, { req }) => {
            const type = req.body.type as TweetType;

            if (
              [TweetType.Comment, TweetType.QuoteTweet, TweetType.Retweet].includes(type) &&
              !ObjectId.isValid(value)
            ) {
              throw new Error(TWEETS_MESSAGES.PARENT_ID_MUST_BE_A_VALID_TWEET_ID);
            }

            if (type === TweetType.Tweet && value !== null) {
              throw new Error(TWEETS_MESSAGES.PARENT_ID_MUST_BE_NULL);
            }

            return true;
          },
        },
      },
      hashtags: {
        isArray: true,
        custom: {
          options: async (value: unknown[], { req }) => {
            if (value.some((item) => typeof item !== 'string')) {
              throw new Error(TWEETS_MESSAGES.HASHTAGS_MUST_BE_AN_ARRAY_OF_STRING);
            }

            return true;
          },
        },
      },
      mentions: {
        isArray: true,
        custom: {
          options: async (value: unknown[], { req }) => {
            if (value.some((item) => typeof item === 'string' && !ObjectId.isValid(item))) {
              throw new Error(TWEETS_MESSAGES.MENTIONS_MUST_BE_AN_ARRAY_OF_USER_ID);
            }

            return true;
          },
        },
      },
      medias: {
        isArray: true,
        custom: {
          options: async (value: any[]) => {
            if (
              value.some((item) => {
                return typeof item.url !== 'string' || !mediaType.includes(item.type);
              })
            ) {
              throw new Error(TWEETS_MESSAGES.MENTIONS_MUST_BE_AN_ARRAY_OF_USER_ID);
            }

            return true;
          },
        },
      },
    },
    ['body'],
  ),
);

export const tweetIdValidator = validate(
  checkSchema(
    {
      tweet_id: {
        custom: {
          options: async (value: string, { req }) => {
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                message: TWEETS_MESSAGES.INVALID_TWEET_ID,
                status: HTTP_STATUS.BAD_REQUEST,
              });
            }

            const tweet = await databaseService.tweets.findOne({
              _id: new ObjectId(value),
            });

            if (tweet === null) {
              throw new ErrorWithStatus({
                message: TWEETS_MESSAGES.TWEET_NOT_FOUND,
                status: HTTP_STATUS.NOT_FOUND,
              });
            }

            (req as Request).tweet = tweet;
            return true;
          },
        },
      },
    },
    ['body', 'params'],
  ),
);

export const audienceValidator = async (req: Request, res: Response, next: NextFunction) => {
  const tweet = req.tweet as Tweet;

  if (tweet.audience === TweetAudience.TwitterCircle) {
    if (!req.decoded_authorization) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.ACCESS_TOKEN_IS_REQUIRED,
        status: HTTP_STATUS.UNAUTHORIZED,
      });
    }

    const author = await databaseService.users.findOne({
      _id: new ObjectId(tweet.user_id),
    });

    if (author === null || author.verify === UserVerifyStatus.Banned) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.USER_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND,
      });
    }

    const { user_id } = req.decoded_authorization as TokenPayload;
    const isInTwitterCircle = author.twitter_circle.some((user_circle_id) => user_circle_id.equals(user_id));

    if (!author._id.equals(user_id) && !isInTwitterCircle) {
      throw new ErrorWithStatus({
        message: TWEETS_MESSAGES.TWEET_IS_NOT_PUBLIC,
        status: HTTP_STATUS.FORBIDDEN,
      });
    }
  }

  next();
};
