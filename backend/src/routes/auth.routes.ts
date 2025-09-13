import express, { Request, Response } from 'express';
import AuthService, { LoginUser } from '../service/auth.service';
import {
  refreshAuthHandler,
  authClientTypeHandler,
} from '../middleware/auth.middleware';
import createHttpError from 'http-errors';
import { JwtTokens } from '../utils/jwt';

const router = express.Router();

// Login and get tokens
router.post('/login', authClientTypeHandler, async (req, res) => {
  const user: LoginUser = req.body;
  if (!user.email || !user.password) {
    throw createHttpError.BadRequest('Email and password are required');
  }

  const tokens = await AuthService.loginUser(user);
  responseTokens(req, res, tokens);
});

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
