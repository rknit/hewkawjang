import { NextFunction, Request, Response } from 'express';

export default function errorHandler(
  error: any,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  let reqDisp = {
    method: req.method,
    url: req.url,
    headers: req.headers,
    body: req.body,
    params: req.params,
    query: req.query,
  };

  console.error({
    timestamp: new Date().toISOString(),
    req: reqDisp,
    error,
  }); // Log full error server-side

  const isProduction = process.env.NODE_ENV === 'production';

  res.status(error.status || 500).json({
    error: {
      message: 'Internal Server Error',
      ...(isProduction ? {} : { req: reqDisp, stack: error.stack }), // Only show stack in development
    },
  });
}
