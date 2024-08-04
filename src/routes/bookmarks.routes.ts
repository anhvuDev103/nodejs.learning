import express from 'express';

import { bookmarkTweetController, unbookmarkTweetController } from '@/controllers/bookmarks.controllers';
import { tweetIdValidator } from '@/middlewares/tweets.middlewares';
import { accessTokenValidator, verifiedUserValidator } from '@/middlewares/users.middlewares';
import { wrapRequestHandler } from '@/utils/handlers';

const bookmarksRouter = express.Router();

/**
 * Description: Bookmark tweet
 * Path: /
 * Method: POST
 * Headers: { Authorization: Bearer [AccessToken] }
 * Body: { tweet_id: string }
 */
bookmarksRouter.post(
  '/',
  accessTokenValidator,
  verifiedUserValidator,
  tweetIdValidator,
  wrapRequestHandler(bookmarkTweetController),
);

/**
 * Description: Unbookmark tweet
 * Path: /tweets/:tweet_id
 * Method: DELETE
 * Headers: { Authorization: Bearer [AccessToken] }
 */
bookmarksRouter.delete(
  '/tweets/:tweet_id',
  accessTokenValidator,
  verifiedUserValidator,
  tweetIdValidator,
  wrapRequestHandler(unbookmarkTweetController),
);

export default bookmarksRouter;
