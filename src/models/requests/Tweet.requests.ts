import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';

import { TweetAudience, TweetType } from '@/constants/enums';

import { Media } from '../Other';

export interface TweetRequestBody {
  type: TweetType;
  audience: TweetAudience;
  content: string;
  parent_id: null | string;
  hashtags: string[];
  mentions: string[];
  medias: Media[];
}

export interface GetTweetRequestParams extends ParamsDictionary {
  tweet_id: string;
}

export interface GetTweetChildrenRequestParams extends ParamsDictionary {
  tweet_id: string;
}

export interface GetTweetChildrenRequestQueries extends ParsedQs {
  tweet_type: string;
  limit: string;
  page: string;
  query: string;
}
