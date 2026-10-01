import type { Request, Response } from 'express';
import {
  completeTask,
  createTask,
  deleteTask,
  findTaskById,
  listTasks
} from '../services/task.service.js';

// Devuelve todas las tareas con el estado HTTP 200.
export const getTasks = (_req: Request, res: Response): void => {
  res.status(200).json({ data: listTasks() });
};

// Busca y devuelve la tarea cuyo id ya fue validado por un middleware.
export const getTask = (_req: Request, res: Response): void => {
  res.status(200).json({ data: findTaskById(res.locals.taskId) });
};

// Crea una tarea usando el titulo validado y responde con estado 201.
export const postTask = (_req: Request, res: Response): void => {
  const task = createTask(res.locals.taskTitle);
  res.status(201).json({ data: task });
};

// Marca como completada la tarea indicada y devuelve el resultado.
export const patchTaskComplete = (_req: Request, res: Response): void => {
  const task = completeTask(res.locals.taskId);
  res.status(200).json({ data: task });
};

// Elimina la tarea indicada y responde sin contenido.
export const removeTask = (_req: Request, res: Response): void => {
  deleteTask(res.locals.taskId);
  res.status(204).send();
};