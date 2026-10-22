# Pruebas de modelado y persistencia

## Entorno

- Rama: feature/modelo-tareas-mongodb
- Base: task_api
- Colección: tasks
- Resultado de pnpm check: correcto, sin errores
- Resultado de pnpm build: correcto, sin errores

## Documento comprobado

- id devuelto por la API: 6ad9502714b3006deacc68bc (Tarea para reinicio)
- Campos observados en Atlas: _id, title, status, createdAt, updatedAt (y description cuando se envía)
- Resultado después de reiniciar: las tres tareas creadas antes del reinicio continuaron disponibles

## Casos ejecutados

| Tipo | Método y ruta | Datos | Esperado | Obtenido | requestId | Resultado |
|---|---|---|---|---|---|---|
| Persistencia | POST /api/tasks | title válido | 201 | 201 con id de 24 caracteres | No aplica | Correcto |
| Persistencia | GET /api/tasks | No aplica | 200 | 200 con las tareas en data | No aplica | Correcto |
| Persistencia | GET /api/tasks tras reiniciar | No aplica | 200 con las tareas | Las 3 tareas continúan | No aplica | Correcto |
| Regresión | GET /api/tasks/{id} tras DELETE | id eliminado | 404 TASK_NOT_FOUND | 404 TASK_NOT_FOUND | 7f48c9ab-40ef-4ae7-ada2-320770b57173 | Correcto |
| Negativa | GET /api/tasks/1 | No aplica | 400 INVALID_ID | 400 INVALID_ID | 839da6d2-38da-427e-b2a3-f545a3b42307 | Correcto |
| Negativa | POST /api/tasks | title vacío | 422 VALIDATION_ERROR | 422 VALIDATION_ERROR en title | 800989ab-b47b-490f-afeb-795f481e110d | Correcto |
| Desafío | POST /api/tasks | description de 301 caracteres | 422 VALIDATION_ERROR | 422 VALIDATION_ERROR en description | cfb075a5-1503-46af-b4cd-9e3a708a6439 | Correcto |
| Desafío | POST /api/tasks | description con espacios externos | 201 sin espacios | 201, description recortada | No aplica | Correcto |
| Desafío | POST /api/tasks | Sin description | 201 | 201 sin el campo | No aplica | Correcto |

## Evidencias

1. Compilación: pnpm check y pnpm build ejecutados.
2. POST y documento visible en Atlas sin credenciales.
3. Consulta después de reiniciar: las tareas siguen disponibles.
4. Un error HTTP (INVALID_ID), una regla del negocio (TASK_NOT_FOUND) y un error de validación (VALIDATION_ERROR).

## Nota de seguridad

No se incluyen la URI, el usuario ni la contraseña de MongoDB. Cualquier dato sensible se sustituye por [OCULTO].
