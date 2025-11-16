import express, { Request, Response } from 'express';
import AuthService, { LoginUser } from '../service/auth.service';
import {
  refreshAuthHandler,
  authClientTypeHandler,
  authHandler,
} from '../middleware/auth.middleware';
import createHttpError from 'http-errors';
import { JwtTokens } from '../utils/jwt';

const router = express.Router();

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Login with email and password
 *     tags:
 *       - Authentication
 *     parameters:
 *       - $ref: '#/components/parameters/AuthClientTypeHeader'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Successfully logged in (response varies by client type)
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/TokenResponseWeb'
 *                 - $ref: '#/components/schemas/TokenResponseMobile'
 *         headers:
 *           Set-Cookie:
 *             description: Refresh token as HttpOnly cookie (web clients only)
 *             schema:
 *               type: string
 *               example: refreshToken=eyJhbGc...; HttpOnly; Secure; SameSite=Strict; Max-Age=86400
 *       400:
 *         description: Missing required fields or invalid client type header
 *       401:
 *         description: Invalid email or password
 *       5XX:
 *         $ref: '#/components/responses/InternalServerError'
 */
// Login and get tokens
router.post('/login', authClientTypeHandler, async (req, res) => {
  const user: LoginUser = req.body;
  if (!user.email || !user.password) {
    throw createHttpError.BadRequest('Email and password are required');
  }

  const tokens = await AuthService.login(user);
  responseTokens(req, res, tokens);
});

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     summary: Logout and invalidate refresh token
 *     tags:
 *       - Authentication
 *     parameters:
 *       - $ref: '#/components/parameters/AuthClientTypeHeader'
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully logged out
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LogoutResponse'
 *         headers:
 *           Set-Cookie:
 *             description: Clears the refresh token cookie
 *             schema:
 *               type: string
 *               example: refreshToken=; HttpOnly; Secure; SameSite=Strict; Max-Age=0
 *       400:
 *         description: Missing or invalid client type header
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         description: User or admin not found
 *       5XX:
 *         $ref: '#/components/responses/InternalServerError'
 */
// Logout
router.post('/logout', authClientTypeHandler, authHandler, async (req, res) => {
  if (!req.userAuthPayload) {
    throw createHttpError.Unauthorized('User not authenticated');
  }

  await AuthService.logout(req.userAuthPayload);

  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  res.status(200).json({ message: 'Logged out successfully' });
});

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     summary: Refresh access token using refresh token
 *     tags:
 *       - Authentication
 *     parameters:
 *       - $ref: '#/components/parameters/AuthClientTypeHeader'
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully refreshed tokens (response varies by client type)
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/TokenResponseWeb'
 *                 - $ref: '#/components/schemas/TokenResponseMobile'
 *         headers:
 *           Set-Cookie:
 *             description: New refresh token as HttpOnly cookie (web clients only)
 *             schema:
 *               type: string
 *               example: refreshToken=eyJhbGc...; HttpOnly; Secure; SameSite=Strict; Max-Age=86400
 *       400:
 *         description: Missing or invalid client type header
 *       401:
 *         description: Invalid or expired refresh token, or user account deleted
 *       5XX:
 *         $ref: '#/components/responses/InternalServerError'
 */
// Token refresh
router.post(
  '/refresh',
  authClientTypeHandler,
  refreshAuthHandler,
  async (req, res) => {
    if (!req.userAuthRefreshToken || !req.userAuthPayload) {
      // This should not happen due to the middleware, but just in case
      throw createHttpError.InternalServerError();
    }

    const tokens = await AuthService.refreshTokens(
      req.userAuthRefreshToken,
      req.userAuthPayload,
    );
    responseTokens(req, res, tokens);
  },
);

function responseTokens(req: Request, res: Response, token: JwtTokens) {
  switch (req.userAuthClientType) {
    case 'web':
      // Set refresh token as HttpOnly cookie for web clients
      res.cookie('refreshToken', token.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      });
      // Send only access token in response body
      res.status(200).json({ accessToken: token.accessToken });
      break;

    case 'mobile':
      // Send both tokens in response body for mobile clients
      res.status(200).json(token);
      break;

    default:
      throw createHttpError.BadRequest('Unknown client type');
  }
}

export default router;
