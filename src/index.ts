import 'dotenv/config';

import cors from 'cors';
import express from 'express';
import { createServer } from 'http';
import { ObjectId } from 'mongodb';
import { Server } from 'socket.io';

import { UPLOAD_VIDEO_DIR } from './constants/dir';
import { UserVerifyStatus } from './constants/enums';
import HTTP_STATUS from './constants/http-status';
import { USERS_MESSAGES } from './constants/messages';
import { defaultErrorHandler } from './middlewares/error.middlewares';
import { ErrorWithStatus } from './models/Errors';
import { TokenPayload } from './models/requests/User.requests';
import Conversation from './models/schemas/Conversation.schema';
import bookmarksRouter from './routes/bookmarks.routes';
import conversationsRouter from './routes/conversations.routes';
import likesRouter from './routes/likes.routes';
import mediasRouter from './routes/medias.routes';
import searchRouter from './routes/search.routes';
import staticRouter from './routes/static.routes';
import tweetsRouter from './routes/tweets.routes';
import usersRouter from './routes/users.routes';
import databaseService from './services/database.services';
import { verifyAccessToken } from './utils/common';
import { initFolder } from './utils/file';

databaseService.connect().then(() => {
  databaseService.indexUsers();
  databaseService.indexRefreshTokens();
  databaseService.indexVideoStatus();
  databaseService.indexFollowers();
  databaseService.indexTweets();
});

const app = express();
const httpServer = createServer(app);

const port = process.env.PORT;

//Create uploads folder
initFolder();

app.use(express.json());
app.use(cors());

app.use('/users', usersRouter);
app.use('/medias', mediasRouter);
app.use('/static', staticRouter);
app.use('/tweets', tweetsRouter);
app.use('/bookmarks', bookmarksRouter);
app.use('/likes', likesRouter);
app.use('/search', searchRouter);
app.use('/conversations', conversationsRouter);
app.use('/static/video', express.static(UPLOAD_VIDEO_DIR));

app.use(defaultErrorHandler);

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

httpServer.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
