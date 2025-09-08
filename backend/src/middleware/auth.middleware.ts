import { Request, Response, NextFunction } from 'express';
import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';
import {
  ACCESS_TOKEN_SECRET,
  JwtPayload,
  REFRESH_TOKEN_SECRET,
} from '../utils/jwt';

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
    req.authPayload = decoded as JwtPayload;
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
    req.authRefreshToken = refreshToken;
    req.authPayload = decoded as JwtPayload;
    next();
  });
}
