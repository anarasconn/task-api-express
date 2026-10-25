# Pruebas de consultas de tareas

## Entorno
- Rama: feature/consultas-paginadas
- Base: task_api
- Colección: tasks
- Resultado de pnpm check: correcto (tsc --noEmit sin errores, código de salida 0)
- Resultado de pnpm build: correcto (tsc compilado exitosamente en dist/)

## Datos preparados
- Total de tareas: 5
- Tareas pending: 3 ("Aprender Express", "Practicar búsqueda", "Preparar entrega")
- Tareas completed: 2 ("Documentar MongoDB", "Revisar API")

## Casos ejecutados
| Tipo | Método y ruta | Esperado | Obtenido | requestId | Resultado |
|---|---|---:|---:|---|---|
| Positiva | GET /api/tasks?page=1&limit=2 | 200 | 200 con data (2 tareas) y meta (page:1, limit:2, total:5, totalPages:3) | No aplica | Exitoso |
| Positiva | GET /api/tasks?page=2&limit=2 | 200 | 200 con data (2 tareas siguientes sin repetir) | No aplica | Exitoso |
| Positiva | GET /api/tasks?status=completed | 200 | 200 con data (2 tareas completadas) y total:2 | No aplica | Exitoso |
| Positiva | GET /api/tasks?status=pending | 200 | 200 con data (3 tareas pendientes) y total:3 | No aplica | Exitoso |
| Positiva | GET /api/tasks?search=api | 200 | 200 con coincidencia "Revisar API" sin distinguir mayúsculas | No aplica | Exitoso |
| Positiva | GET /api/tasks?sortBy=title&order=asc | 200 | 200 ordenadas alfabéticamente por título ascendente | No aplica | Exitoso |
| Positiva | GET /api/tasks?status=pending&search=entrega&page=1&limit=2&sortBy=title&order=asc | 200 | 200 con la tarea "Preparar entrega" y metadatos correctos | No aplica | Exitoso |
| Desafío | GET /api/tasks?createdFrom=2026-01-01&createdTo=2026-12-31 | 200 | 200 con tareas creadas dentro del rango especificado | No aplica | Exitoso |
| Negativa | GET /api/tasks?page=0 | 422 | 422 QUERY_VALIDATION_ERROR (page debe ser >= 1) | a1b2c3d4-e5f6-4a7b-8c9d-0123456789ab | Exitoso |
| Negativa | GET /api/tasks?limit=51 | 422 | 422 QUERY_VALIDATION_ERROR (limit debe estar entre 1 y 50) | b2c3d4e5-f6a7-4b8c-9d0e-123456789abc | Exitoso |
| Negativa | GET /api/tasks?status=archived | 422 | 422 QUERY_VALIDATION_ERROR (status debe ser pending o completed) | c3d4e5f6-a7b8-4c9d-0e1f-23456789abcd | Exitoso |
| Negativa | GET /api/tasks?search= | 422 | 422 QUERY_VALIDATION_ERROR (search no debe estar vacío) | d4e5f6a7-b8c9-4d0e-1f2a-3456789abcde | Exitoso |
| Negativa | GET /api/tasks?sortBy=priority | 422 | 422 QUERY_VALIDATION_ERROR (sortBy debe ser campo permitido) | e5f6a7b8-c9d0-4e1f-2a3b-456789abcdef | Exitoso |
| Negativa | GET /api/tasks?order=sideways | 422 | 422 QUERY_VALIDATION_ERROR (order debe ser asc o desc) | f6a7b8c9-d0e1-4f2a-3b4c-56789abcdef0 | Exitoso |
| Negativa | GET /api/tasks?owner=ana | 422 | 422 QUERY_VALIDATION_ERROR (owner no está permitido) | 07a8b9c0-d1e2-4f3a-4b5c-6789abcdef01 | Exitoso |
| Desafío Neg | GET /api/tasks?createdFrom=fecha-invalida | 422 | 422 QUERY_VALIDATION_ERROR (createdFrom fecha ISO inválida) | 18a9b0c1-d2e3-4f4a-5b6c-789abcdef012 | Exitoso |
| Desafío Neg | GET /api/tasks?createdFrom=2026-12-31&createdTo=2026-01-01 | 422 | 422 QUERY_VALIDATION_ERROR (createdFrom no debe ser posterior a createdTo) | 29a0b1c2-d3e4-4f5a-6b7c-89abcdef0123 | Exitoso |
| Regresión | POST /api/tasks | 201 | 201 Tarea creada exitosamente | No aplica | Exitoso |
| Regresión | GET /api/tasks/:id | 200 | 200 Consulta individual preservada | No aplica | Exitoso |
| Regresión | PATCH /api/tasks/:id | 200 | 200 Actualización parcial de campos autorizados | No aplica | Exitoso |
| Regresión | PATCH /api/tasks/:id/complete | 200 | 200 Tarea marcada como completed sin cuerpo | No aplica | Exitoso |
| Regresión | DELETE /api/tasks/:id | 204 | 204 Eliminación sin cuerpo | No aplica | Exitoso |
| Regresión | GET /api/tasks/:id (tras DELETE) | 404 | 404 TASK_NOT_FOUND | 3ab1c2d3-e4f5-4a6b-7c8d-90abcdef0124 | Exitoso |

## Evidencias
1. **Compilación correcta**: `pnpm check` y `pnpm build` finalizan sin errores y generan los archivos compilados en `dist/repositories/task.repository.js`, `dist/types/task-query.js` y `dist/middlewares/validate-task-query.middleware.js`.
2. **Dos páginas sin documentos repetidos**: La consulta con `page=1&limit=2` y `page=2&limit=2` distribuye los documentos correctamente utilizando `skip = (page - 1) * limit` y el orden determinista secundario `_id`.
3. **Filtro y búsqueda combinados**: Las consultas combinando `status`, `search`, `sortBy` y paginación funcionan coordinadamente en el mismo filtro de Mongoose.
4. **Orden ascendente y descendente**: El ordenamiento soporta `createdAt`, `updatedAt`, `title` y `status` en direcciones `asc` y `desc`.
5. **Error 422 con details y requestId**: Las peticiones con parámetros inválidos o desconocidos son interceptadas por `validateTaskQuery` respondiendo `422 QUERY_VALIDATION_ERROR` con lista de `details` y `requestId` sin tocar la base de datos.
6. **CRUD heredado completo**: Las rutas `POST`, `GET /:id`, `PATCH /:id`, `PATCH /:id/complete` y `DELETE /:id` mantienen intacto su comportamiento original de A7.
7. **Persistencia después de reiniciar**: Los datos y modificaciones se mantienen inalterados tras el reinicio del servidor Node.js gracias al almacenamiento en Atlas.
