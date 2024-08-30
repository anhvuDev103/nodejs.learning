import express from 'express';

import { searchController } from '@/controllers/search.controllers';
import { accessTokenValidator, isUserLoggedInValidator } from '@/middlewares/users.middlewares';
import { wrapRequestHandler } from '@/utils/handlers';

const searchRouter = express.Router();

/**
 * Description: Search
 * Path: /
 * Method: GET
 */
searchRouter.get('/', isUserLoggedInValidator(accessTokenValidator), wrapRequestHandler(searchController));

export default searchRouter;
