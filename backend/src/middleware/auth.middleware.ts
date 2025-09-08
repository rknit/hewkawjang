import { Request, Response, NextFunction } from 'express';
import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';

export default function authHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (!req.headers.authorization) {
    return next(createHttpError.Unauthorized());
  }

  const token = req.headers.authorization.replace('Bearer ', '');
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!, (err, decoded) => {
    if (err) {
      return next(createHttpError.Unauthorized());
    }
    (req as any).authPayload = decoded;
    next();
  });
}
