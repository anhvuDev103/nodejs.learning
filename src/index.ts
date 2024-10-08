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
    origin: 'http://localhost:3000',
  },
});

io.on('connection', (socket) => {
  console.log(`user ${socket.id} connected`);

  socket.on('disconnect', () => {
    console.log(`user ${socket.id} disconnected`);
  });

  socket.on('hello', (arg) => {
    console.log('>> Check | arg:', arg);
  });

  socket.emit('hi', {
    message: `Xin chao ${socket.id} da ket noi thanh cong`,
  });
});

httpServer.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
