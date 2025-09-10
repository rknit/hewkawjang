import { Request, Response, NextFunction } from 'express';
import createHttpError from 'http-errors';

// Extend Express Request interface to include clientType
declare global {
  namespace Express {
    interface Request {
      clientType?: 'web' | 'mobile';
    }
  }
}

export default function clientTypeHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const clientType = req.headers['hkj-client-type'];
  switch (clientType) {
    case 'web':
      req.clientType = 'web';
      break;
    case 'mobile':
      req.clientType = 'mobile';
      break;
    default:
      return next(createHttpError.BadRequest('Invalid hkj-client-type'));
  }
  next();
}
