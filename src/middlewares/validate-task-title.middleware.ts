import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../errors/app-error.js';

const TITLE_MAX_LENGTH = 120;
const DESCRIPTION_MAX_LENGTH = 300;

interface FieldError {
  field: string;
  message: string;
}

export const validateTaskTitle = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const body: unknown = req.body;
  const payload: Record<string, unknown> =
    typeof body === 'object' && body !== null
      ? (body as Record<string, unknown>)
      : {};

  const details: FieldError[] = [];

  const rawTitle = payload.title;
  const title = typeof rawTitle === 'string' ? rawTitle.trim() : '';

  if (typeof rawTitle !== 'string' || title.length === 0) {
    details.push({
      field: 'title',
      message: 'El título es obligatorio y debe ser texto no vacío.'
    });
  } else if (title.length > TITLE_MAX_LENGTH) {
    details.push({
      field: 'title',
      message: `El título no debe superar ${TITLE_MAX_LENGTH} caracteres.`
    });
  }

  const rawDescription = payload.description;
  let description: string | undefined;

  if (rawDescription !== undefined) {
    if (typeof rawDescription !== 'string') {
      details.push({
        field: 'description',
        message: 'La descripción debe ser texto.'
      });
    } else {
      const trimmed = rawDescription.trim();
      if (trimmed.length > DESCRIPTION_MAX_LENGTH) {
        details.push({
          field: 'description',
          message: `La descripción no debe superar ${DESCRIPTION_MAX_LENGTH} caracteres.`
        });
      } else if (trimmed.length > 0) {
        description = trimmed;
      }
    }
  }

  if (details.length > 0) {
    next(
      new AppError(
        'Los datos de la tarea no son válidos.',
        422,
        'VALIDATION_ERROR',
        details
      )
    );
    return;
  }

  res.locals.taskTitle = title;
  res.locals.taskDescription = description;
  next();
};
