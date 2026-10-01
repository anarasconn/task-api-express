import { tasks } from '../data/tasks.js';
import { AppError } from '../errors/app-error.js';
import type { Task } from '../models/task.js';

// Devuelve la lista actual de tareas.
export const listTasks = (): readonly Task[] => tasks;

// Busca una tarea por id o genera un error si no existe.
export const findTaskById = (id: number): Task => {
  const task = tasks.find((item) => item.id === id);

  if (!task) {
    throw new AppError(
      `No existe una tarea con el id ${id}.`,
      404,
      'TASK_NOT_FOUND'
    );
  }

  return task;
};

// Valida el titulo, crea una tarea pendiente y la guarda en memoria.
export const createTask = (title: string): Task => {
  if (typeof title !== 'string' || !title.trim()) {
    throw new AppError(
      'La solicitud contiene datos inválidos.',
      422,
      'VALIDATION_ERROR',
      [{ field: 'title', message: 'Debe ser texto no vacío.' }]
    );
  }

  if (title.trim().length > 120) {
    throw new AppError(
      'La solicitud contiene datos inválidos.',
      422,
      'VALIDATION_ERROR',
      [{ field: 'title', message: 'No debe superar 120 caracteres.' }]
    );
  }

  const nextId = Math.max(0, ...tasks.map((item) => item.id)) + 1;

  const newTask: Task = {
    id: nextId,
    title: title.trim(),
    status: 'pending',
    createdAt: new Date()
  };

  tasks.push(newTask);
  return newTask;
};

// Cambia el estado de una tarea existente a completada.
export const completeTask = (id: number): Task => {
  const task = findTaskById(id);
  task.status = 'completed';
  return task;
};

// Elimina una tarea por id o genera un error si no existe.
export const deleteTask = (id: number): void => {
  const index = tasks.findIndex((item) => item.id === id);

  if (index === -1) {
    throw new AppError(
      `No existe una tarea con el id ${id}.`,
      404,
      'TASK_NOT_FOUND'
    );
  }

  tasks.splice(index, 1);
};