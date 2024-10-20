import 'dotenv/config';

import cors from 'cors';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

import { UPLOAD_VIDEO_DIR } from './constants/dir';
import { defaultErrorHandler } from './middlewares/error.middlewares';
import bookmarksRouter from './routes/bookmarks.routes';
import likesRouter from './routes/likes.routes';
import mediasRouter from './routes/medias.routes';
import searchRouter from './routes/search.routes';
import staticRouter from './routes/static.routes';
import tweetsRouter from './routes/tweets.routes';
import usersRouter from './routes/users.routes';
import databaseService from './services/database.services';
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

io.on('connection', (socket) => {
  console.log(`user ${socket.id} connected`);

  console.log(socket.handshake.auth);

  const { user_id } = socket.handshake.auth;
  user[user_id] = {
    socket_id: socket.id,
  };

  socket.on('private message', (data) => {
    console.log(data);

    const { to: receiver_user_id, content } = data;

    const receiver_socket_id = user[receiver_user_id]?.socket_id;

    if (!receiver_socket_id) return;

    socket.to(receiver_socket_id).emit('receive private message', {
      content,
      from: user_id,
    });
  });

  socket.on('disconnect', () => {
    delete user[user_id];
    console.log(`user ${socket.id} disconnected`);
  });
});

httpServer.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
