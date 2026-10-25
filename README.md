# Task API Express - EC2 F3 A8

API RESTful desarrollada con Express 5, TypeScript y MongoDB Atlas para la gestión integral de tareas, con arquitectura en capas, consultas controladas (paginación, filtros, búsqueda y ordenamiento) y persistencia en la nube.

---

## 🏛️ Arquitectura por Capas

El proyecto implementa una separación estricta de responsabilidades en capas para garantizar modularidad, mantenibilidad y desacoplamiento de la base de datos:

```
src/
├── config/             # Configuración de entorno y conexión con MongoDB Atlas
├── controllers/        # Controladores HTTP: extraen datos de res.locals y definen respuestas
├── errors/             # Clases de error personalizadas (AppError)
├── middlewares/        # Validación HTTP perimetral, control de tipos y sanitización de entrada
├── models/             # Esquemas de Mongoose y tipados de persistencia
├── repositories/       # Capa de acceso a datos: encapsula llamadas directas a Mongoose y Atlas
├── routes/             # Definición de rutas y asignación de middlewares
├── services/           # Lógica de dominio, cálculos de metadatos y transformaciones
└── types/              # Contratos e interfaces TypeScript compartidos
```

### Flujo de Ejecución de Consultas (`GET /api/tasks`)

1. **Ruta (`task.routes.ts`)**: Recibe la petición HTTP y encadena `validateTaskQuery` antes de `getTasks`.
2. **Middleware (`validate-task-query.middleware.ts`)**: Valida `req.query`, rechaza parámetros no permitidos o inválidos con `422 QUERY_VALIDATION_ERROR`, aplica valores por defecto seguros y genera `res.locals.taskQuery`.
3. **Controlador (`task.controller.ts`)**: Obtiene la consulta tipada `TaskListQuery` y delega al servicio.
4. **Servicio (`task.service.ts`)**: Solicita los documentos y el conteo al repositorio, calcula `totalPages`, `hasNextPage`, `hasPreviousPage` y formatea la respuesta a `TaskListResult`.
5. **Repositorio (`task.repository.ts`)**: Traduce la consulta a filtros de Mongoose, aplica expresiones regulares escapadas, realiza `sort` determinista con `_id`, aplica `skip` y `limit`, y ejecuta `countDocuments` con el mismo filtro.

---

## 🚀 Parámetros de Consulta Soportados (`GET /api/tasks`)

| Parámetro | Tipo | Predeterminado | Reglas y Restricciones |
|---|---|---|---|
| `page` | Entero | `1` | Rango válido entre `1` y `100000`. |
| `limit` | Entero | `10` | Rango válido entre `1` y `50`. |
| `status` | String | Sin filtro | Valores permitidos: `pending` o `completed`. |
| `search` | String | Sin búsqueda | Texto no vacío de hasta 60 caracteres (búsqueda parcial case-insensitive en `title`). |
| `sortBy` | String | `createdAt` | Valores permitidos: `createdAt`, `updatedAt`, `title`, `status`. |
| `order` | String | `asc` | Valores permitidos: `asc` o `desc`. |
| `createdFrom` | ISO 8601 | Opcional | Fecha mínima de creación (`$gte`). No debe ser posterior a `createdTo`. |
| `createdTo` | ISO 8601 | Opcional | Fecha máxima de creación (`$lte`). No debe ser anterior a `createdFrom`. |

---

## 📡 Endpoints de la API

### Tareas (`/api/tasks`)

- `GET /api/tasks` — Listado con soporte para paginación, filtros por estado, búsqueda parcial, ordenamiento y rangos de fecha.
- `GET /api/tasks/:id` — Consulta de una tarea por su identificador de MongoDB.
- `POST /api/tasks` — Creación de una nueva tarea en estado `pending` (`{ "title": "..." }`).
- `PATCH /api/tasks/:id` — Actualización parcial general de `title`, `status` o ambos.
- `PATCH /api/tasks/:id/complete` — Ruta especializada para marcar una tarea como completada (sin cuerpo JSON).
- `DELETE /api/tasks/:id` — Eliminación de una tarea (responde `204 No Content`).

### Salud (`/health`)

- `GET /health` — Verificación del estado de salud del servidor Express.
- `GET /health/database` — Verificación del estado de conectividad con MongoDB Atlas.

---

## 🛠️ Instalación y Uso

### 1. Prerrequisitos
- Node.js (versión 20 o superior recomendada)
- PNPM instalado globalmente
- Cluster de MongoDB Atlas activo

### 2. Variables de Entorno
Crea un archivo local `.env` a partir de `.env.example`:

```env
PORT=3000
MONGODB_URI=mongodb+srv://<USUARIO>:<CONTRASENA>@<CLUSTER>.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB_NAME=task_api
```

### 3. Comandos de Ejecución

```bash
# Instalar dependencias
pnpm install

# Verificación estática de tipos
pnpm check

# Compilación TypeScript a dist/
pnpm build

# Modo desarrollo con recarga en vivo
pnpm dev

# Ejecución en producción
pnpm start
```

---

## 🧪 Pruebas con Postman

Las colecciones de prueba se encuentran en el directorio `postman/`:
- `postman/EC2_F2_A3_CRUD.postman_collection.json` (Pruebas de CRUD persistente y regresión A7)
- `postman/EC2_F3_A8_Consultas.postman_collection.json` (Pruebas de consultas, paginación, filtros, ordenamiento y casos negativos A8)

Para ejecutarlas, importa el archivo en Postman y asegúrate de tener la variable de colección `baseUrl` apuntando a `http://localhost:3000`.
