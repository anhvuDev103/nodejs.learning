import { Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';

import { PaginationRequestQueries } from '@/models/requests/Common.requests';
import {
  GetTweetChildrenRequestParams,
  GetTweetChildrenRequestQueries,
  GetTweetRequestParams,
  TweetRequestBody,
} from '@/models/requests/Tweet.requests';
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

export const getTweetChildrenController = async (
  req: Request<GetTweetChildrenRequestParams, any, any, GetTweetChildrenRequestQueries>,
  res: Response,
) => {
  const { tweet_id } = req.params;
  const { tweet_type, limit, page } = req.query;
  const { user_id } = req.decoded_authorization as TokenPayload;

  const _tweet_type = Number(tweet_type);
  const _limit = Number(limit);
  const _page = Number(page);

  const { tweets, total } = await tweetService.getTweetChildren({
    user_id,
    tweet_id,
    tweet_type: _tweet_type,
    limit: _limit,
    page: _page,
  });

  return res.json({
    message: 'Get tweet comments succesfully',
    result: {
      tweets,
      tweet_type: _tweet_type,
      limit: _limit,
      page: _page,
      total_page: Math.ceil(total / _limit),
    },
  });
};

export const getNewFeedsController = async (
  req: Request<ParamsDictionary, any, any, PaginationRequestQueries>,
  res: Response,
) => {
  const { limit, page } = req.query;
  const { user_id } = req.decoded_authorization as TokenPayload;

  const _limit = Number(limit);
  const _page = Number(page);

  const result = await tweetService.getNewFeeds({
    user_id,
    limit: _limit,
    page: _page,
  });

  return res.json({
    message: 'Get new feeds succesfully',
    result: {
      tweets: result.tweets,
      limit: _limit,
      page: _page,
      total_page: Math.ceil(result.total / _limit),
    },
  });
};
