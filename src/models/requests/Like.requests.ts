import { ParamsDictionary } from 'express-serve-static-core';

export interface LikeTweetRequestBody {
  tweet_id: string;
}

export interface UnlikeTweetRequestParams extends ParamsDictionary {
  tweet_id: string;
}
