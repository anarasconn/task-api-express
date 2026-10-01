import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

// Asigna un identificador unico a la peticion para incluirlo en la respuesta.
export const requestContext = (
  _req: Request,
  res: Response,
  next: NextFunction
): void => {
  const requestId = randomUUID();
  res.locals.requestId = requestId;
  res.setHeader('X-Request-Id', requestId);
  next();
};
