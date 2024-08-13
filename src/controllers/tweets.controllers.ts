import { Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';

import { GetTweetRequestParams, TweetRequestBody } from '@/models/requests/Tweet.requests';
import { TokenPayload } from '@/models/requests/User.requests';
import tweetService from '@/services/tweet.services';

export const createTweetController = async (req: Request<ParamsDictionary, any, TweetRequestBody>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload;
  const result = await tweetService.createTweet(user_id, req.body);

  return res.json({ message: 'Create tweet succesfully', result });
};

export const getTweetController = async (req: Request<GetTweetRequestParams>, res: Response) => {
  const { tweet_id } = req.params;
  const { user_id } = req.decoded_authorization as TokenPayload;

  const result = await tweetService.increaseView(tweet_id, user_id);
  const tweet = {
    ...req.tweet,
    ...result,
  };
  return res.json({ message: 'Get tweet succesfully', result: tweet });
};
