import express from 'express';

import {
  forgotPasswordController,
  loginController,
  logoutController,
  registerController,
  resendEmailVerifyController,
  verifyEmailController,
  verifyForgotPasswordController,
} from '@/controllers/users.controllers';
import {
  accessTokenValidator,
  emailVerifyTokenValidator,
  forgotPasswordValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  verifyForgotPasswordTokenValidator,
} from '@/middlewares/users.middlewares';
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
usersRouter.post('/logout', accessTokenValidator, refreshTokenValidator, wrapRequestHandler(logoutController));

/**
 * Description: Verify email user
 * Path: /verify-email
 * Method: POST
 * Body: { email_verify_token: string }
 */
usersRouter.post('/verify-email', emailVerifyTokenValidator, wrapRequestHandler(verifyEmailController));

/**
 * Description: Resend verify email
 * Path: /resend-verify-email
 * Method: POST
 * Headers: { Authorization: Bearer [RefreshToken] }
 */
usersRouter.post('/resend-verify-email', accessTokenValidator, wrapRequestHandler(resendEmailVerifyController));

/**
 * Description: Submit email to reset password, send email to user
 * Path: /forgot-password
 * Method: POST
 * Body: { email: string }
 */
usersRouter.post('/forgot-password', forgotPasswordValidator, wrapRequestHandler(forgotPasswordController));

/**
 * Description: Verify forgot password token
 * Path: /verify-forgot-password-token
 * Method: POST
 * Body: { forgot_password_token: string }
 */
usersRouter.post(
  '/verify-forgot-password-token',
  verifyForgotPasswordTokenValidator,
  wrapRequestHandler(verifyForgotPasswordController),
);

export default usersRouter;
