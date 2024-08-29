import express from 'express';

import { searchController } from '@/controllers/search.controllers';
import { wrapRequestHandler } from '@/utils/handlers';

const searchRouter = express.Router();

/**
 * Description: Search
 * Path: /
 * Method: GET
 */
searchRouter.get('/', wrapRequestHandler(searchController));

export default searchRouter;
