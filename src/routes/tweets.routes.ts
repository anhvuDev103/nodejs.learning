import express from 'express';

import { createTweetController, getTweetController } from '@/controllers/tweets.controllers';
import { createTweetValidator, tweetIdValidator } from '@/middlewares/tweets.middlewares';
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
  wrapRequestHandler(getTweetController),
);

export default tweetsRouter;
