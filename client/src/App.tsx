import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { ApiHttpError, apiRequest } from './api.js';
import type {
  ApiEnvelope,
  LoginData,
  Task,
  TaskListResponse,
  User
} from './types.js';

const TOKEN_KEY = 'task-api.access-token';

const messageFrom = (error: unknown): string => {
  if (error instanceof ApiHttpError) {
    const reference = error.requestId ? ` Referencia: ${error.requestId}.` : '';
    return `${error.message}${reference}`;
  }
  return 'No fue posible comunicarse con la API.';
};

export default function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [token, setToken] = useState<string | null>(() =>
    sessionStorage.getItem(TOKEN_KEY)
  );
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [message, setMessage] = useState('Inicia sesión para consultar tus tareas.');
  const [busy, setBusy] = useState(false);

  const clearSession = useCallback((): void => {
    sessionStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    setTasks([]);
  }, []);

  const loadProtectedData = useCallback(async (accessToken: string): Promise<void> => {
    try {
      setBusy(true);
      const [meResponse, taskResponse] = await Promise.all([
        apiRequest<ApiEnvelope<{ user: User }>>('/api/auth/me', {}, accessToken),
        apiRequest<TaskListResponse>('/api/tasks?limit=10&sortBy=createdAt&order=desc', {}, accessToken)
      ]);
      setUser(meResponse.data.user);
      setTasks(taskResponse.data);
      setMessage(`Se recuperaron ${taskResponse.meta.total} tareas.`);
    } catch (error: unknown) {
      if (error instanceof ApiHttpError && error.status === 401) clearSession();
      setMessage(messageFrom(error));
    } finally {
      setBusy(false);
    }
  }, [clearSession]);

  useEffect(() => {
    if (token) void loadProtectedData(token);
  }, [loadProtectedData, token]);

  const handleLogin = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setBusy(true);
    setMessage('Comprobando credenciales...');
    try {
      const response = await apiRequest<ApiEnvelope<LoginData>>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      sessionStorage.setItem(TOKEN_KEY, response.data.accessToken);
      setToken(response.data.accessToken);
      setPassword('');
    } catch (error: unknown) {
      setMessage(messageFrom(error));
      setBusy(false);
    }
  };

  const handleCreateTask = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    const title = newTaskTitle.trim();
    if (!token || !title) return;
    setBusy(true);
    setMessage('Creando tarea...');
    try {
      const response = await apiRequest<ApiEnvelope<Task>>('/api/tasks', {
        method: 'POST',
        body: JSON.stringify({ title })
      }, token);
      setTasks((prev) => [response.data, ...prev]);
      setNewTaskTitle('');
      setMessage(`Tarea "${response.data.title}" creada exitosamente.`);
    } catch (error: unknown) {
      if (error instanceof ApiHttpError && error.status === 401) clearSession();
      setMessage(messageFrom(error));
    } finally {
      setBusy(false);
    }
  };

  const handleLogout = (): void => {
    clearSession();
    setMessage('La sesión local se eliminó.');
  };

  return (
    <main className="page-shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">EC3 F2 A11</p>
          <h1>Task API Client</h1>
          <p>Integración inicial de React con una API protegida por JWT.</p>
        </div>
        {user && <button onClick={handleLogout}>Cerrar sesión</button>}
      </header>

      {!token ? (
        <section className="panel login-panel" aria-labelledby="login-title">
          <h2 id="login-title">Iniciar sesión</h2>
          <form onSubmit={(event) => void handleLogin(event)}>
            <label htmlFor="email">Correo electrónico</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="username"
              required
            />
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
            <button type="submit" disabled={busy}>
              {busy ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>
        </section>
      ) : (
        <section className="workspace" aria-busy={busy}>
          <div>
            <article className="panel identity-panel">
              <h2>Identidad autenticada</h2>
              {user ? (
                <dl>
                  <div><dt>Nombre</dt><dd>{user.name}</dd></div>
                  <div><dt>Correo</dt><dd>{user.email}</dd></div>
                  <div><dt>Rol</dt><dd>{user.role}</dd></div>
                </dl>
              ) : <p>Validando el token...</p>}
            </article>

            <article className="panel create-task-panel">
              <h2>Nueva tarea</h2>
              <form onSubmit={(event) => void handleCreateTask(event)}>
                <label htmlFor="new-task-title">Título</label>
                <input
                  id="new-task-title"
                  type="text"
                  value={newTaskTitle}
                  onChange={(event) => setNewTaskTitle(event.target.value)}
                  placeholder="Ej. Estudiar OpenAPI"
                  required
                />
                <button type="submit" disabled={busy || !newTaskTitle.trim()}>
                  {busy ? 'Guardando...' : 'Crear tarea'}
                </button>
              </form>
            </article>
          </div>

          <article className="panel">
            <div className="section-heading">
              <h2>Tareas recuperadas</h2>
              <button
                onClick={() => token && void loadProtectedData(token)}
                disabled={busy}
              >
                Actualizar
              </button>
            </div>
            {tasks.length === 0 ? (
              <p>No hay tareas para mostrar.</p>
            ) : (
              <ul className="task-list">
                {tasks.map((task) => (
                  <li key={task.id}>
                    <span>{task.title}</span>
                    <strong>{task.status}</strong>
                  </li>
                ))}
              </ul>
            )}
          </article>
        </section>
      )}

      <p className="status-message" role="status">{message}</p>
    </main>
  );
}
