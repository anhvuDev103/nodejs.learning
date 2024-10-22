import { ParamsDictionary } from 'express-serve-static-core';

export interface GetConversationsRequestParams extends ParamsDictionary {
  receiver_id: string;
}
