import express from 'express';

import { getConversationController } from '@/controllers/conversations.controllers';
import { accessTokenValidator, verifiedUserValidator } from '@/middlewares/users.middlewares';

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
  getConversationController,
);

export default conversationsRouter;
