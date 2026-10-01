import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../errors/app-error.js';

// Rechaza la peticion si no indica que su contenido esta en formato JSON.
export const requireJson = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  if (!req.is('application/json')) {
    next(new AppError(
      'La solicitud debe usar Content-Type application/json.',
      415,
      'UNSUPPORTED_MEDIA_TYPE'
    ));
    return;
  }

  next();
};
