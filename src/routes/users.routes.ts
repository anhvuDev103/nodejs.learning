import express from 'express';

import { loginController, registerController } from '@/controllers/users.controllers';
import { registerValidator } from '@/middlewares/users.middlewares';

const usersRouter = express.Router();

usersRouter.post('/login', loginController);
/**
 * Description: Register a new user
 * Path: /register
 * Method: POST
 * Body: { name: string, email: string, password: string, confirm_password: string, date_of_birth: ISO Date }
 */
usersRouter.post('/register', registerValidator, registerController);

export default usersRouter;
