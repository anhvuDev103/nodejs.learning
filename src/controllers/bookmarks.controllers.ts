import { Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';

import { BOOKMARK_MESSAGES } from '@/constants/messages';
import { BookmarkTweetRequestBody, UnbookmarkTweetRequestParams } from '@/models/requests/Bookmark.requests';
import { TokenPayload } from '@/models/requests/User.requests';
import bookmarkService from '@/services/bookmark.services';

export const bookmarkTweetController = async (
  req: Request<ParamsDictionary, any, BookmarkTweetRequestBody>,
  res: Response,
) => {
  const { tweet_id } = req.body;
  const { user_id } = req.decoded_authorization as TokenPayload;
  const result = await bookmarkService.bookmarkTweet(user_id, tweet_id);

  return res.json({
    message: BOOKMARK_MESSAGES.BOOKMARK_SUCCESSFULLY,
    result,
  });
};

export const unbookmarkTweetController = async (req: Request<UnbookmarkTweetRequestParams>, res: Response) => {
  const { tweet_id } = req.params;
  const { user_id } = req.decoded_authorization as TokenPayload;
  const result = await bookmarkService.unbookmarkTweet(user_id, tweet_id);

  return res.json({
    message: BOOKMARK_MESSAGES.UNBOOKMARK_SUCCESSFULLY,
    result,
  });
};
