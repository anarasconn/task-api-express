import { Router } from 'express';
import {
  getTask,
  getTasks,
  patchTaskComplete,
  postTask,
  removeTask
} from '../controllers/task.controller.js';
import { requireJson } from '../middlewares/require-json.middleware.js';
import { validateTaskId } from '../middlewares/validate-task-id.middleware.js';
import { validateTaskTitle } from '../middlewares/validate-task-title.middleware.js';

export const taskRouter = Router();

// Valida automaticamente el parametro :id en las rutas que lo utilizan.
taskRouter.param('id', validateTaskId);

// Registra los endpoints para consultar, crear, completar y borrar tareas.
taskRouter.get('/', getTasks);
taskRouter.get('/:id', getTask);
taskRouter.post('/', requireJson, validateTaskTitle, postTask);
taskRouter.patch('/:id/complete', patchTaskComplete);
taskRouter.delete('/:id', removeTask);
