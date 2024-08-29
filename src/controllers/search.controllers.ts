import { Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';

import { LIKE_MESSAGES } from '@/constants/messages';
import { SearchQueries } from '@/models/requests/Search.requests';
import searchService from '@/services/search.services';

export const searchController = async (req: Request<ParamsDictionary, any, any, SearchQueries>, res: Response) => {
  const { content, limit, page } = req.query;

  const _limit = Number(limit);
  const _page = Number(page);

  const result = await searchService.search({
    content,
    limit: _limit,
    page: _page,
  });

  return res.json({
    message: 'Search Successfully',
    result,
  });
};
