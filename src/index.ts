import 'dotenv/config';

import express from 'express';

import { UPLOAD_DIR } from './constants/dir';
import { defaultErrorHandler } from './middlewares/error.middlewares';
import mediasRouter from './routes/medias.routes';
import staticRouter from './routes/static.routes';
import usersRouter from './routes/users.routes';
import databaseService from './services/database.services';
import { initFolder } from './utils/file';

databaseService.connect();

const app = express();
const port = process.env.PORT;

//Create uploads folder
initFolder();

app.use(express.json());

app.use('/users', usersRouter);
app.use('/medias', mediasRouter);
app.use('/static', staticRouter);

// app.use('/static', express.static(UPLOAD_DIR));

app.use(defaultErrorHandler);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
