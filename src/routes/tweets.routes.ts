import express from 'express';

import {
  createTweetController,
  getNewFeedsController,
  getTweetChildrenController,
  getTweetController,
} from '@/controllers/tweets.controllers';
import {
  audienceValidator,
  createTweetValidator,
  getTweetChildrenValidator,
  paginationValidator,
  tweetIdValidator,
} from '@/middlewares/tweets.middlewares';
import { accessTokenValidator, isUserLoggedInValidator, verifiedUserValidator } from '@/middlewares/users.middlewares';
import { wrapRequestHandler } from '@/utils/handlers';

const tweetsRouter = express.Router();

/**
 * Description: Create tweet
 * Path: /
 * Method: POST
 * Headers: { Authorization: Bearer [AccessToken] }
 * Body: TweetRequestBody
 */
tweetsRouter.post(
  '/',
  accessTokenValidator,
  verifiedUserValidator,
  createTweetValidator,
  wrapRequestHandler(createTweetController),
);

/**
 * Description: Get tweet details
 * Path: /:tweet_id
 * Method: GET
 * Headers: { Authorization: Bearer [AccessToken] }
 */
tweetsRouter.get(
  '/:tweet_id',
  tweetIdValidator,
  isUserLoggedInValidator(accessTokenValidator),
  isUserLoggedInValidator(verifiedUserValidator),
  audienceValidator,
  wrapRequestHandler(getTweetController),
);

/**
 * Description: Get tweet children
 * Path: /:tweet_id/children
 * Method: GET
 * Headers: { Authorization: Bearer [AccessToken] }
 * Query: { limit: number, page: number, tweet_type: TweetType }
 */
tweetsRouter.get(
  '/:tweet_id/children',
  tweetIdValidator,
  paginationValidator,
  getTweetChildrenValidator,
  isUserLoggedInValidator(accessTokenValidator),
  isUserLoggedInValidator(verifiedUserValidator),
  audienceValidator,
  wrapRequestHandler(getTweetChildrenController),
);

/**
 * Description: Get new feeds
 * Path: /
 * Method: GET
 * Headers: { Authorization: Bearer [AccessToken] }
 * Query: { limit: number, page: number }
 */
tweetsRouter.get(
  '/',
  paginationValidator,
  accessTokenValidator,
  verifiedUserValidator,
  wrapRequestHandler(getNewFeedsController),
);

export default tweetsRouter;
