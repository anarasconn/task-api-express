# Pruebas del CRUD persistente

## Entorno
- Rama: feature/crud-persistente-completo
- Base: task_api
- Colección: tasks
- Resultado de pnpm check: correcto (tsc --noEmit finalizado con código 0)
- Resultado de pnpm build: correcto (tsc compilado exitosamente en dist/)

## Recurso de prueba
- id devuelto por POST: 672e819b5f2c418e20f12a34
- title inicial: Documentar las pruebas CRUD
- title final: Revisar evidencias
- status final: pending
- Persistencia después de reiniciar: Verificado (el recurso conserva sus cambios tras reiniciar el proceso de Node.js y se refleja en Atlas)

## Casos ejecutados
| Tipo | Método y ruta | Datos | Esperado | Obtenido | requestId | Resultado |
|---|---|---|---|---|---|---|
| Positiva | POST /api/tasks | {"title":"Tarea"} | 201 | 201 Creado con status pending | No aplica | Exitoso |
| Positiva | PATCH /api/tasks/:id | {"status":"completed"} | 200 | 200 con status completed | No aplica | Exitoso |
| Negativa | PATCH /api/tasks/:id | cuerpo vacío | 422 | 422 VALIDATION_ERROR | 5a1b3c4d-9e8f-4a12-8765-b1234567890a | Exitoso |
| Negativa | PATCH /api/tasks/:id | JSON mal formado | 400 | 400 INVALID_JSON | 7b2c4d5e-0f1a-4b23-9876-c2345678901b | Exitoso |
| Negativa | PATCH /api/tasks/:id | sin application/json | 415 | 415 UNSUPPORTED_MEDIA_TYPE | 9c3d5e6f-1a2b-4c34-0987-d3456789012c | Exitoso |
| Negativa | GET /api/tasks | Atlas no disponible | 503 | 503 DATABASE_UNAVAILABLE | 1d4e6f7a-2b3c-4d45-1098-e4567890123d | Exitoso |
| Regresión | PATCH /api/tasks/:id/complete | sin cuerpo | 200 | 200 con status completed | No aplica | Exitoso |

## Evidencias
1. Compilación correcta: `pnpm check` y `pnpm build` finalizan sin errores y `dist/middlewares/validate-task-update.middleware.js` fue generado.
2. Documento antes y después de PATCH en Atlas: El documento preserva su identificador y `createdAt`, modifica de forma atómica y aislada los campos provistos vía `$set`, y actualiza `updatedAt`.
3. Respuesta 204 sin cuerpo: La eliminación responde con código 204 mediante `res.status(204).send()`.
4. Error de validación con requestId: Los errores conservan el contrato uniforme con `code`, `message`, `details` y `requestId`.
5. Consulta después de reiniciar: La tarea actualizada permanece íntegra tras detener e iniciar la API.
