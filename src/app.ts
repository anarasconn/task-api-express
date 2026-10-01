import express from 'express';
import { taskRouter } from './routes/task.routes.js';
import { requestContext } from './middlewares/request-context.middleware.js';
import { notFound } from './middlewares/not-found.middleware.js';
import { errorHandler } from './middlewares/error.middleware.js';

// Crea la aplicacion principal de Express.
export const app = express();

// Prepara cada peticion y convierte los cuerpos JSON en objetos JavaScript.
app.use(requestContext);
app.use(express.json());

// Permite comprobar rapidamente si el servidor esta activo.
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Agrupa todos los endpoints relacionados con tareas bajo /api/tasks.
app.use('/api/tasks', taskRouter);

// Atiende rutas desconocidas y centraliza el manejo de errores.
app.use(notFound);
app.use(errorHandler);
