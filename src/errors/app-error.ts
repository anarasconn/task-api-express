import type { FieldIssue } from '../types/api-error.js';

// Error de la aplicacion que incluye el estado HTTP y un codigo identificador.
export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly code: string,
    public readonly details?: FieldIssue[]
  ) {
    super(message);
    this.name = 'AppError';
  }
}