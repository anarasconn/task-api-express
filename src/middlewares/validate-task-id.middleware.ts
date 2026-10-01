import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../errors/app-error.js';

// Comprueba que el id de la ruta sea entero positivo y lo guarda para usarlo despues.
export const validateTaskId = (
  _req: Request,
  res: Response,
  next: NextFunction,
  value: string
): void => {
  const id = Number(value);

  if (!Number.isInteger(id) || id <= 0) {
    next(new AppError(
      'El id debe ser un entero positivo.',
      400,
      'INVALID_ID'
    ));
    return;
  }

  res.locals.taskId = id;
  next();
};
