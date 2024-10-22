import { Request, Response } from 'express';

import { PaginationRequestQueries } from '@/models/requests/Common.requests';
import { GetConversationsRequestParams } from '@/models/requests/Conversations.requests';
import { TokenPayload } from '@/models/requests/User.requests';
import conversationsService from '@/services/conversations.services';

export const getConversationController = async (
  req: Request<GetConversationsRequestParams, any, any, PaginationRequestQueries>,
  res: Response,
) => {
  const { receiver_id } = req.params;
  const { limit, page } = req.query;

  const { user_id: sender_id } = req.decoded_authorization as TokenPayload;

  const _limit = Number(limit);
  const _page = Number(page);

  const { conversations, total } = await conversationsService.getConversations({
    sender_id,
    receiver_id,
    limit: _limit,
    page: _page,
  });

  return res.json({
    result: {
      limit: _limit,
      page: _page,
      conversations,
      total_page: Math.ceil(total / _limit),
    },
    message: 'Get conversations successfully',
  });
};
