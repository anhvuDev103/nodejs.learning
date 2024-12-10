import express from 'express';

import { getConversationController } from '@/controllers/conversations.controllers';
import { paginationValidator } from '@/middlewares/tweets.middlewares';
import {
  accessTokenValidator,
  getConversationsValidator,
  verifiedUserValidator,
} from '@/middlewares/users.middlewares';
import { wrapRequestHandler } from '@/utils/handlers';

const conversationsRouter = express.Router();

/**
 * Description: Get conversations
 * Path: /
 * Method: GET
 * Headers: { Authorization: Bearer [AccessToken] }
 * Params: { receiver_id: string }
 */
conversationsRouter.get(
  '/receivers/:receiver_id',
  accessTokenValidator,
  verifiedUserValidator,
  getConversationsValidator,
  paginationValidator,
  wrapRequestHandler(getConversationController),
);

export default conversationsRouter;
