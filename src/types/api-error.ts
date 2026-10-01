// Describe un problema encontrado en un campo de la peticion.
export interface FieldIssue {
  field: string;
  message: string;
}

// Estructura comun usada para enviar errores al cliente de la API.
export interface ApiErrorPayload {
  code: string;
  message: string;
  details?: FieldIssue[];
  requestId?: string;
}