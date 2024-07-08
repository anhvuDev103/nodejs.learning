import express from 'express';

import { loginController, registerController } from '@/controllers/users.controllers';

const usersRouter = express.Router();

usersRouter.post('/login', loginController);

usersRouter.post('/register', registerController);

export default usersRouter;
