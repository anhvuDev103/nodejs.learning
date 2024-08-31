import express from 'express';

import { searchController } from '@/controllers/search.controllers';
import { accessTokenValidator, verifiedUserValidator } from '@/middlewares/users.middlewares';
import { wrapRequestHandler } from '@/utils/handlers';

const searchRouter = express.Router();

/**
 * Description: Search
 * Path: /
 * Method: GET
 */
searchRouter.get('/', accessTokenValidator, verifiedUserValidator, wrapRequestHandler(searchController));

export default searchRouter;
