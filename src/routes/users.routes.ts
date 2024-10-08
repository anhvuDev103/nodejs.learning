import express from 'express';

import {
  changePasswordController,
  followController,
  forgotPasswordController,
  getMeController,
  getProfileController,
  loginController,
  logoutController,
  oauthController,
  refreshTokenController,
  registerController,
  resendEmailVerifyController,
  resetPasswordController,
  unfollowController,
  updateMeController,
  verifyEmailController,
  verifyForgotPasswordController,
} from '@/controllers/users.controllers';
import { filterMiddleware } from '@/middlewares/common.middlewares';
import {
  accessTokenValidator,
  changePasswordValidator,
  emailVerifyTokenValidator,
  followValidator,
  forgotPasswordValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  resetPasswordValidator,
  unfollowValidator,
  updateMeValidator,
  verifiedUserValidator,
  verifyForgotPasswordTokenValidator,
} from '@/middlewares/users.middlewares';
import { UpdateMeRequestBody } from '@/models/requests/User.requests';
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
 * Description: Login with Google
 * Path: /oauth/google
 * Method: GET
 * Query: { code: string, scope: string, authuser: string, prompt: string }
 */
usersRouter.get('/oauth/google', wrapRequestHandler(oauthController));

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
 * Headers: { Authorization: Bearer [AccessToken] }
 */
usersRouter.post('/logout', accessTokenValidator, refreshTokenValidator, wrapRequestHandler(logoutController));

/**
 * Description: Refresh token
 * Path: /refresh-token
 * Method: POST
 * Body: { refresh_token: string }
 */
usersRouter.post('/refresh-token', refreshTokenValidator, wrapRequestHandler(refreshTokenController));

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
 * Headers: { Authorization: Bearer [AccessToken] }
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

/**
 * Description: Reset password
 * Path: /reset-password
 * Method: POST
 * Body: { forgot_password_token: string, password: string, confirm_password: string }
 */
usersRouter.post('/reset-password', resetPasswordValidator, wrapRequestHandler(resetPasswordController));

/**
 * Description: Get me
 * Path: /me
 * Method: GET
 * Headers: { Authorization: Bearer [AccessToken] }
 */
usersRouter.get('/me', accessTokenValidator, wrapRequestHandler(getMeController));

/**
 * Description: Update my profile
 * Path: /me
 * Method: PATCH
 * Headers: { Authorization: Bearer [AccessToken] }
 * Body: UserSchema
 */
usersRouter.patch(
  '/me',
  accessTokenValidator,
  verifiedUserValidator,
  updateMeValidator,
  filterMiddleware<UpdateMeRequestBody>([
    'avatar',
    'bio',
    'cover_photo',
    'date_of_birth',
    'location',
    'name',
    'username',
    'website',
  ]),
  wrapRequestHandler(updateMeController),
);

/**
 * Description: Get user profile
 * Path: /:username
 * Method: GET
 */
usersRouter.get('/:username', wrapRequestHandler(getProfileController));

/**
 * Description: Follow a user
 * Path: /follow
 * Method: POST
 * Headers: { Authorization: Bearer [AccessToken] }
 * Body: { followed_user_id: string }
 */
usersRouter.post(
  '/follow',
  accessTokenValidator,
  verifiedUserValidator,
  followValidator,
  wrapRequestHandler(followController),
);

/**
 * Description: Unfollow a user
 * Path: /follow/:user_id
 * Method: DELETE
 * Headers: { Authorization: Bearer [AccessToken] }
 */
usersRouter.delete(
  '/follow/:user_id',
  accessTokenValidator,
  verifiedUserValidator,
  unfollowValidator,
  wrapRequestHandler(unfollowController),
);

/**
 * Description: Change password
 * Path: /change-password
 * Method: PUT
 * Headers: { Authorization: Bearer [AccessToken] }
 * Body: { old_password: string, password: string, comfirm_password: string }
 */
usersRouter.put(
  '/change-password',
  accessTokenValidator,
  verifiedUserValidator,
  changePasswordValidator,
  wrapRequestHandler(changePasswordController),
);

export default usersRouter;
