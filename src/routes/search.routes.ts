import express from 'express';

import { searchController } from '@/controllers/search.controllers';
import { searchValidator } from '@/middlewares/search.middlewares';
import { paginationValidator } from '@/middlewares/tweets.middlewares';
import { accessTokenValidator, verifiedUserValidator } from '@/middlewares/users.middlewares';
import { wrapRequestHandler } from '@/utils/handlers';

const searchRouter = express.Router();

/**
 * Description: Search
 * Path: /
 * Method: GET
 * Query: { content: string, limit: number, page: number, media_type: MediaTypeQuery, people_follow: string }
 */
searchRouter.get(
  '/',
  paginationValidator,
  accessTokenValidator,
  verifiedUserValidator,
  searchValidator,
  wrapRequestHandler(searchController),
);

export default searchRouter;
