import express from 'express';

import { likeTweetController, unlikeTweetController } from '@/controllers/likes.controllers';
import { tweetIdValidator } from '@/middlewares/tweets.middlewares';
import { accessTokenValidator, verifiedUserValidator } from '@/middlewares/users.middlewares';
import { wrapRequestHandler } from '@/utils/handlers';

const likesRouter = express.Router();

/**
 * Description: Like tweet
 * Path: /
 * Method: POST
 * Headers: { Authorization: Bearer [AccessToken] }
 * Body: { tweet_id: string }
 */
likesRouter.post(
  '/',
  accessTokenValidator,
  verifiedUserValidator,
  tweetIdValidator,
  wrapRequestHandler(likeTweetController),
);

/**
 * Description: Unlike tweet
 * Path: /tweets/:tweet_id
 * Method: DELETE
 * Headers: { Authorization: Bearer [AccessToken] }
 */
likesRouter.delete(
  '/tweets/:tweet_id',
  accessTokenValidator,
  verifiedUserValidator,
  tweetIdValidator,
  wrapRequestHandler(unlikeTweetController),
);

export default likesRouter;
