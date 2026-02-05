import { Request, Response, NextFunction } from 'express';

export function errorHandler(
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('Error:', error);

  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { error: error.message }),
  });
}
