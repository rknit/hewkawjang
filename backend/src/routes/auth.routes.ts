import express from 'express';
import AuthService, { LoginUser } from '../service/auth.service';
import { refreshAuthHandler } from '../middleware/auth.middleware';
import createHttpError from 'http-errors';

const router = express.Router();

// Login and get tokens
router.post('/login', async (req, res) => {
  const { email, password }: LoginUser = req.body;
  if (!email || !password) {
    throw createHttpError.BadRequest('Email and password are required');
  }

  const token = await AuthService.loginUser(req.body);
  res.status(200).json(token);
});

// Token refresh
router.post('/refresh', refreshAuthHandler, async (req, res) => {
  if (!req.userAuthRefreshToken || !req.userAuthPayload) {
    // This should not happen due to the middleware, but just in case
    throw createHttpError.InternalServerError();
  }

  const tokens = await AuthService.refreshTokens(
    req.userAuthRefreshToken,
    req.userAuthPayload,
  );
  res.status(200).json(tokens);
});

export default router;
