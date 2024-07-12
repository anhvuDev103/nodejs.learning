import express from 'express';

import { loginController, registerController } from '@/controllers/users.controllers';
import { accessTokenValidator, loginValidator, registerValidator } from '@/middlewares/users.middlewares';
import { wrapRequestHandler } from '@/utils/handlers';

const usersRouter = express.Router();

/**
 * Description: Login user
 * Path: /login
 * Method: POST
 * Body: { email: string, password: string }
 */
usersRouter.post('/login', loginValidator, wrapRequestHandler(loginController));

/**
 * Description: Register a new user
 * Path: /register
 * Method: POST
 * Body: { name: string, email: string, password: string, confirm_password: string, date_of_birth: ISO Date }
 */
usersRouter.post('/register', registerValidator, wrapRequestHandler(registerController));

/**
 * Description: Logout a new user
 * Path: /logout
 * Method: POST
 * Headers: { Authorization: Bearer [RefreshToken] }
 */
usersRouter.post(
  '/logout',
  accessTokenValidator,
  wrapRequestHandler((req, res) => {
    console.log('>> Check | req:', (req as any).decoded_authorization as any);

    return res.json({
      ahhiL: 'ahihi',
    });
  }),
);

export default usersRouter;
