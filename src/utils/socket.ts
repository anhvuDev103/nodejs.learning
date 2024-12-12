import { Server as ServerHttp } from 'http';
import { ObjectId } from 'mongodb';
import { Server } from 'socket.io';

import { UserVerifyStatus } from '@/constants/enums';
import HTTP_STATUS from '@/constants/http-status';
import { USERS_MESSAGES } from '@/constants/messages';
import { ErrorWithStatus } from '@/models/Errors';
import { TokenPayload } from '@/models/requests/User.requests';
import Conversation from '@/models/schemas/Conversation.schema';
import databaseService from '@/services/database.services';

import { verifyAccessToken } from './common';

const initSocket = (httpServer: ServerHttp) => {
  const io = new Server(httpServer, {
    /* options */
    cors: {
      origin: 'http://localhost:5173',
    },
  });

  const user: {
    [key: string]: {
      socket_id: string;
    };
  } = {};

  io.use(async (socket, next) => {
    const { Authorization } = socket.handshake.auth;

    const [, access_token] = Authorization?.split(' ') || [];

    try {
      const decoded_authorization = await verifyAccessToken(access_token);
      const { verify } = decoded_authorization as TokenPayload;
      if (verify !== UserVerifyStatus.Verified) {
        throw new ErrorWithStatus({
          message: USERS_MESSAGES.USER_NOT_VERIFIED,
          status: HTTP_STATUS.FORBIDDEN,
        });
      }

      socket.handshake.auth.decoded_authorization = decoded_authorization as TokenPayload;
      socket.handshake.auth.access_token = access_token;
      next();
    } catch (error) {
      next({
        message: 'Unauthorized',
        name: 'Unauthorized Error',
        data: error,
      });
    }
  });

  io.on('connection', (socket) => {
    console.log(`user ${socket.id} connected`);

    const { user_id } = socket.handshake.auth.decoded_authorization as TokenPayload;
    user[user_id] = {
      socket_id: socket.id,
    };

    socket.use(async (packet, next) => {
      const { access_token } = socket.handshake.auth;

      try {
        await verifyAccessToken(access_token);
        next();
      } catch (error) {
        next(new Error('Unauthorized'));
      }
    });

    socket.on('error', (error) => {
      if (error.message === 'Unauthorized') {
        socket.disconnect();
      }
    });

    socket.on('send_message', async (data) => {
      const { payload } = data;

      const receiver_socket_id = user[payload.receiver_id]?.socket_id;

      const conversation = new Conversation({
        sender_id: new ObjectId(payload.sender_id),
        receiver_id: new ObjectId(payload.receiver_id),
        content: payload.content,
      });

      const result = await databaseService.conversations.insertOne(conversation);

      conversation._id = result.insertedId;

      if (!receiver_socket_id) {
        socket.to(receiver_socket_id).emit('receive_message', {
          payload: conversation,
        });
      }
    });

    socket.on('disconnect', () => {
      delete user[user_id];
      console.log(`user ${socket.id} disconnected`);
    });
  });
};

export default initSocket;
