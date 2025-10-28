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
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login and obtain JWT tokens
 *     description: >
 *       Authenticates the user using email and password.
 *       Requires the `hkj-auth-client-type` header (must be `"web"`).
 *       On success, sets a **HttpOnly refreshToken cookie** and returns an **access token**.
 *     tags:
 *       - Auth
 *     parameters:
 *       - $ref: '#/components/parameters/AuthClientTypeHeader'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: test@user.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: test
 *     responses:
 *       200:
 *         description: Successfully logged in. Returns access token and sets refreshToken cookie.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: Missing email or password.
 *       401:
 *         description: Invalid credentials.
 */
router.post('/login', authClientTypeHandler, async (req, res) => {
  const user: LoginUser = req.body;
  if (!user.email || !user.password) {
    throw createHttpError.BadRequest('Email and password are required');
  }

  const tokens = await AuthService.loginUser(user);
  responseTokens(req, res, tokens);
});

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user
 *     description: >
 *       Logs out the authenticated user and clears the refresh token cookie.
 *       Requires the `hkj-auth-client-type` header and valid access token.
 *     tags:
 *       - Auth
 *     parameters:
 *       - $ref: '#/components/parameters/AuthClientTypeHeader'
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully logged out.
 *       401:
 *         description: Unauthorized or missing token.
 */
router.post('/logout', authClientTypeHandler, authHandler, async (req, res) => {
  if (!req.userAuthPayload) {
    throw createHttpError.Unauthorized('User not authenticated');
  }

  await AuthService.logoutUser(req.userAuthPayload);

  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  res.status(200).json({ message: 'Logged out successfully' });
});

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     description: >
 *       Issues a new **access token** using the **refreshToken cookie**.
 *       Requires the `hkj-auth-client-type` header (must be `"web"`).
 *       No request body is required.
 *     tags:
 *       - Auth
 *     parameters:
 *       - $ref: '#/components/parameters/AuthClientTypeHeader'
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: New access token issued.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       401:
 *         description: Missing or invalid refresh token.
 *       500:
 *         description: Internal server error.
 */
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
