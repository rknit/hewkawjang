import { Request, Response, NextFunction } from 'express';
import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';
import { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } from '../utils/jwt';
import { UserAuthPayload } from '../service/auth.service';

// Extend Express Request interface to include userAuthPayload and userAuthRefreshToken
declare global {
  namespace Express {
    interface Request {
      userAuthPayload?: UserAuthPayload;
      userAuthRefreshToken?: string;
    }
  }
}

export function authHandler(req: Request, res: Response, next: NextFunction) {
  if (!req.headers.authorization) {
    return next(createHttpError.Unauthorized());
  }

  const accessToken = req.headers.authorization.replace('Bearer ', '');
  jwt.verify(accessToken, ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return next(createHttpError.Unauthorized());
    }

    let payload = getPayloadFrom(decoded);
    if (!payload) {
      return next(createHttpError.Unauthorized());
    }

    req.userAuthPayload = payload;
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

    let payload = getPayloadFrom(decoded);
    if (!payload) {
      return next(createHttpError.Unauthorized());
    }

    req.userAuthPayload = payload;
    req.userAuthRefreshToken = refreshToken;
    next();
  });
}

function getPayloadFrom(data: any): UserAuthPayload | undefined {
  if (data && data.userId) {
    return { userId: data.userId };
  }
  return undefined;
}
