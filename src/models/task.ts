// Estados permitidos para una tarea.
export type TaskStatus = 'pending' | 'completed';

// Campos que debe tener cada tarea.
export interface Task {
  id: number;
  title: string;
  status: TaskStatus;
  createdAt: Date;
}