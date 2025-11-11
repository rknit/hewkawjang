import { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import * as z from 'zod';

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

  if (process.env.NODE_ENV === 'development') {
    // Skip logging expected 401s on refresh endpoint (guests checking auth)
    if (!(error.status === 401 && req.url === '/auth/refresh')) {
      console.error({
        timestamp: new Date().toISOString(),
        req: reqDisp,
        error,
      }); // Log full error server-side in development
    }
  }

  const isProduction = process.env.NODE_ENV === 'production';

  if (error instanceof z.ZodError) {
    // Handle Zod validation errors
    res.status(400).json({
      error: {
        message: 'Validation Error',
        ...(isProduction
          ? {}
          : { error: error, req: reqDisp, stack: error.stack }), // Only show stack in development
      },
    });
    return;
  }

  // If the error is an HTTP error, use its status and message
  if (createHttpError.isHttpError(error)) {
    res.status(error.status).json({
      error: {
        message: error.message,
        ...(isProduction
          ? {}
          : { error: error, req: reqDisp, stack: error.stack }), // Only show stack in development
      },
    });
    return;
  }

  // For unexpected errors, respond with 500
  res.status(500).json({
    error: {
      message: 'Internal Server Error',
      ...(isProduction
        ? {}
        : { error: error, req: reqDisp, stack: error.stack }), // Only show stack in development
    },
  });
}
