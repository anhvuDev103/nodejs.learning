import express from 'express';

import { bookmarkTweetController } from '@/controllers/bookmarks.controllers';
import { accessTokenValidator, verifiedUserValidator } from '@/middlewares/users.middlewares';
import { wrapRequestHandler } from '@/utils/handlers';

const bookmarksRouter = express.Router();

/**
 * Description: Create Bookmark
 * Path: /
 * Method: POST
 * Headers: { Authorization: Bearer [AccessToken] }
 * Body: { tweet_id: string }
 */
bookmarksRouter.post('/', accessTokenValidator, verifiedUserValidator, wrapRequestHandler(bookmarkTweetController));

export default bookmarksRouter;
