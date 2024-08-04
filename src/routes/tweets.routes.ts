import express from 'express';

import { createTweetController } from '@/controllers/tweets.controllers';
import { createTweetValidator } from '@/middlewares/tweets.middlewares';
import { accessTokenValidator, verifiedUserValidator } from '@/middlewares/users.middlewares';
import { wrapRequestHandler } from '@/utils/handlers';

const tweetsRouter = express.Router();

/**
 * Description: Create Tweet
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

export default tweetsRouter;
