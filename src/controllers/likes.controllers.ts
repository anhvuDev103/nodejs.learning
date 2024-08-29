import { Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';

import { LIKE_MESSAGES } from '@/constants/messages';
import { LikeTweetRequestBody, UnlikeTweetRequestParams } from '@/models/requests/Like.requests';
import { TokenPayload } from '@/models/requests/User.requests';
import likeService from '@/services/like.services';

export const likeTweetController = async (req: Request<ParamsDictionary, any, LikeTweetRequestBody>, res: Response) => {
  const { tweet_id } = req.body;
  const { user_id } = req.decoded_authorization as TokenPayload;
  const result = await likeService.likeTweet(user_id, tweet_id);

  return res.json({
    message: LIKE_MESSAGES.LIKE_SUCCESSFULLY,
    result,
  });
};

export const unlikeTweetController = async (req: Request<UnlikeTweetRequestParams>, res: Response) => {
  const { tweet_id } = req.params;
  const { user_id } = req.decoded_authorization as TokenPayload;
  const result = await likeService.unlikeTweet(user_id, tweet_id);

  return res.json({
    message: LIKE_MESSAGES.UNLIKE_SUCCESSFULLY,
    result,
  });
};
