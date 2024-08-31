import { Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';

import { SearchQueries } from '@/models/requests/Search.requests';
import { TokenPayload } from '@/models/requests/User.requests';
import searchService from '@/services/search.services';

export const searchController = async (req: Request<ParamsDictionary, any, any, SearchQueries>, res: Response) => {
  const { content, limit, page, media_type, people_follow } = req.query;
  const { user_id } = req.decoded_authorization as TokenPayload;

  const _limit = Number(limit);
  const _page = Number(page);

  const result = await searchService.search({
    user_id,
    content,
    limit: _limit,
    page: _page,
    media_type,
    people_follow,
  });

  return res.json({
    message: 'Search Successfully',
    result: {
      tweets: result.tweets,
      limit: _limit,
      page: _page,
      total_page: Math.ceil(result.total / _limit),
    },
  });
};
