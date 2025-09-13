import { Request, Response, NextFunction } from 'express';
import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';
import { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } from '../utils/jwt';
import { UserAuthPayload } from '../service/auth.service';
import UserService from '../service/user.service';

// Extend Express Request interface to include userAuth properties
declare global {
  namespace Express {
    interface Request {
      userAuthPayload?: UserAuthPayload;
      userAuthRefreshToken?: string;
      userAuthClientType?: 'web' | 'mobile';
    }
  }
}

export function authClientTypeHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const clientTypeHeader = req.headers['hkj-auth-client-type'];
  if (!clientTypeHeader) {
    return next(createHttpError.BadRequest('Missing hkj-auth-client-type'));
  }

  switch (clientTypeHeader) {
    case 'web':
      req.userAuthClientType = 'web';
      break;
    case 'mobile':
      req.userAuthClientType = 'mobile';
      break;
    default:
      return next(createHttpError.BadRequest('Invalid client type'));
  }
  next();
}

export function authHandler(req: Request, res: Response, next: NextFunction) {
  if (!req.headers.authorization) {
    return next(createHttpError.Unauthorized());
  }

  const accessToken = req.headers.authorization.replace('Bearer ', '');
  jwt.verify(accessToken, ACCESS_TOKEN_SECRET, async (err, decoded) => {
    if (err) {
      return next(createHttpError.Unauthorized());
    }

    let payload = getPayloadFrom(decoded);
    if (!payload) {
      return next(createHttpError.Unauthorized());
    }

    req.userAuthPayload = payload;

    try {
      const isDeleted = await UserService.isUserDeleted(payload.userId);
      if (isDeleted) {
        return next(createHttpError.Unauthorized('User account is deleted'));
      }
    } catch (error) {
      return next(error);
    }

    next();
  });
}

export function refreshAuthHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (!req.userAuthClientType) {
    return next(createHttpError.BadRequest('Missing client type'));
  }

  let refreshToken: string;

  switch (req.userAuthClientType) {
    case 'mobile':
      if (
        !req.headers ||
        !req.headers.authorization ||
        !req.headers.authorization.startsWith('Bearer ')
      ) {
        return next(createHttpError.Unauthorized());
      }
      refreshToken = req.headers.authorization.replace('Bearer ', '');
      break;
    case 'web':
      if (!req.cookies || !req.cookies.refreshToken) {
        return next(createHttpError.Unauthorized());
      }
      refreshToken = req.cookies.refreshToken;
      break;
  }

  jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, async (err, decoded) => {
    if (err) {
      return next(createHttpError.Unauthorized());
    }

    let payload = getPayloadFrom(decoded);
    if (!payload) {
      return next(createHttpError.Unauthorized());
    }

    req.userAuthPayload = payload;
    req.userAuthRefreshToken = refreshToken;

    try {
      const isDeleted = await UserService.isUserDeleted(payload.userId);
      if (isDeleted) {
        return next(createHttpError.Unauthorized('User account is deleted'));
      }
    } catch (error) {
      return next(error);
    }

    next();
  });
}

function getPayloadFrom(data: any): UserAuthPayload | undefined {
  if (data && data.userId) {
    return { userId: data.userId };
  }
  return undefined;
}
