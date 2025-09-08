import { Request, Response, NextFunction } from 'express';
import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';
import { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } from '../utils/jwt';

export default function authHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (!req.headers.authorization) {
    return next(createHttpError.Unauthorized());
  }

  const accessToken = req.headers.authorization.replace('Bearer ', '');
  jwt.verify(accessToken, ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return next(createHttpError.Unauthorized());
    }
    (req as any).authPayload = decoded;
    next();
  });
}

export function refreshAuthHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (!req.headers.authorization) {
    return next(createHttpError.Unauthorized());
  }

  const refreshToken = req.headers.authorization.replace('Bearer ', '');
  jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return next(createHttpError.Unauthorized());
    }
    (req as any).authRefreshToken = refreshToken;
    (req as any).authPayload = decoded;
    next();
  });
}
