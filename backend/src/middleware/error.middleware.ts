import { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';

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

  // If the error is an HTTP error, use its status and message
  if (createHttpError.isHttpError(error)) {
    res.status(error.status).json({
      error: {
        message: error.message,
        ...(isProduction ? {} : { req: reqDisp, stack: error.stack }), // Only show stack in development
      },
    });
    return;
  }

  // For unexpected errors, respond with 500
  res.status(500).json({
    error: {
      message: 'Internal Server Error',
      ...(isProduction ? {} : { req: reqDisp, stack: error.stack }), // Only show stack in development
    },
  });
}
