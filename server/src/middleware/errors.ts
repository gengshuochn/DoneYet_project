import type { ErrorRequestHandler, RequestHandler } from 'express';

export const notFoundHandler: RequestHandler = (req, res) => {
  res.status(404).json({
    error: 'not_found',
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({
    error: 'internal_server_error',
    message: 'Unexpected server error'
  });
};
