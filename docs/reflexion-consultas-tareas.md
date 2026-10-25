# Reflexión: Arquitectura por capas, paginación, filtros, búsqueda y ordenamiento

## 1. ¿Qué responsabilidad nueva cumple task.repository.ts?

La capa de repositorio (`task.repository.ts`) centraliza y aísla por completo el acceso directo a la base de datos a través de Mongoose (`TaskModel`). Se encarga de traducir los parámetros de dominio tipados (`TaskListQuery`) en operaciones nativas de MongoDB (`FilterQuery`, `$regex`, `$gte`, `$lte`, ordenamiento, `skip`, `limit` y `countDocuments`), además de capturar y mapear las excepciones técnicas de persistencia a errores de aplicación (`AppError`). Esto permite que el servicio (`task.service.ts`) desconozca los detalles de MongoDB y se enfoque puramente en la lógica de negocio y transformación de datos.

## 2. ¿Por qué el middleware debe validar req.query antes del controlador?

Porque los valores en `req.query` provienen del cliente externo y son inherentemente inseguros y no tipados (pueden llegar como strings vacíos, arrays duplicados `page=1&page=2`, objetos manipulados o inyecciones). Validar y normalizar en el middleware (`validateTaskQuery`) actúa como un filtro perimetral defensivo: garantiza que solo se acepten parámetros permitidos dentro de rangos válidos, asigna valores predeterminados seguros (`page=1`, `limit=10`, `createdAt asc`) y construye un objeto `TaskListQuery` limpio y tipado en `res.locals.taskQuery`. Si la solicitud es inválida, se detiene con `422 QUERY_VALIDATION_ERROR` sin consumir recursos de base de datos ni saturar la capa de persistencia.

## 3. ¿Cómo se calcula skip para una página determinada?

El desplazamiento (`skip`) representa la cantidad de documentos previos que el cursor de MongoDB debe saltarse antes de comenzar a leer el conjunto de la página actual. Se calcula con la fórmula:

$$\text{skip} = (\text{page} - 1) \times \text{limit}$$

Por ejemplo:
- Para la página 1 con límite 10: $(1 - 1) \times 10 = 0$ (no salta ningún documento y lee los primeros 10).
- Para la página 2 con límite 10: $(2 - 1) \times 10 = 10$ (salta los 10 primeros y toma del 11 al 20).
- Para la página 3 con límite 5: $(3 - 1) \times 5 = 10$ (salta 10 y toma del 11 al 15).

## 4. ¿Por qué find y countDocuments deben usar el mismo filtro?

Porque los metadatos de paginación (`meta.total` y `meta.totalPages`) deben reflejar con exactitud el universo de documentos que cumplen las condiciones solicitadas por el cliente (como un estado determinado `status=completed` o un término de búsqueda `search=api`). Si `countDocuments` no recibiera exactamente el mismo `filter` que `TaskModel.find(filter)`, reportaría el total general de la colección en lugar del total coincidente, provocando un cálculo erróneo de `totalPages` y una experiencia inconsistente donde el paginador indica que hay páginas inexistentes o tareas que no coinciden con el filtro.

## 5. ¿Qué problema evita escapeRegex?

Evita la alteración no deseada de las expresiones regulares y potenciales vulnerabilidades de denegación de servicio por expresiones regulares (ReDoS). Si el usuario busca caracteres especiales de expresiones regulares como `.*`, `^`, `$`, `?` o `+` (por ejemplo buscando un título como `¿Qué es Express?`), sin `escapeRegex` MongoDB interpretaría esos símbolos como operadores de coincidencia comodín (por ejemplo `.*` devolvería todos los documentos de la colección sin filtrar). `escapeRegex` antepone barras invertidas (`\\`) a los metacaracteres, asegurando que se evalúen como texto literal exacto.

## 6. ¿Por qué sortBy utiliza una lista permitida?

Utilizar una lista blanca o cerrada (`TASK_SORT_FIELDS = ['createdAt', 'updatedAt', 'title', 'status']`) previene la inyección de parámetros arbitrarios en las operaciones de ordenamiento de MongoDB. Sin esta restricción, un atacante o cliente podría enviar campos internos no expuestos, claves de índices que degraden el rendimiento de la base de datos o provocar errores de ejecución. Al restringir los valores permitidos y la dirección (`asc` o `desc`), se garantiza predictibilidad, consistencia y seguridad en cada consulta.

## 7. ¿Qué diferencia existe entre data.length, meta.total y meta.totalPages?

- `data.length`: Es el número de documentos devueltos en la página actual (en la respuesta HTTP presente). Su valor máximo está acotado por `limit` (por ejemplo, si `limit=2`, `data.length` será como máximo 2, o menos si es la última página).
- `meta.total`: Es la cantidad global de documentos existentes en la colección que cumplen con los filtros aplicados (`status`, `search`, etc.), independientemente de la paginación.
- `meta.totalPages`: Es el número total de páginas disponibles para navegar con el tamaño de página configurado. Se calcula mediante `Math.ceil(total / limit)`.

## 8. ¿Cómo llega un error asíncrono del repositorio al errorHandler de Express 5?

La función `execute` en `task.repository.ts` envuelve las llamadas asíncronas de Mongoose en un bloque `try/catch` y convierte cualquier fallo técnico en una instancia tipada de `AppError` mediante `mapPersistenceError` (por ejemplo `503 DATABASE_UNAVAILABLE`). Al relanzar el `AppError` con `throw`, la promesa devuelta por la función asíncrona del repositorio y del servicio se rechaza. En Express 5, cualquier promesa rechazada dentro de un controlador `async` (`getTasks`) es capturada automáticamente por el núcleo de Express sin requerir wrappers adicionales ni `try/catch` manual en el controlador, canalizándola de inmediato al middleware final `errorHandler`.

## 9. ¿Qué prueba demuestra que A8 no rompió el CRUD de A7?

La ejecución de la suite de regresión completa:
1. `POST /api/tasks` crea una nueva tarea retornando `201` con su identificador de 24 caracteres hexadecimales.
2. `GET /api/tasks/:id` recupera esa tarea específica respondiendo `200`.
3. `PATCH /api/tasks/:id` actualiza selectivamente campos como `title` o `status` respondiendo `200`.
4. `PATCH /api/tasks/:id/complete` marca la tarea como `completed` sin requerir cuerpo JSON respondiendo `200`.
5. `DELETE /api/tasks/:id` elimina el documento respondiendo `204` sin cuerpo.
6. `GET /api/tasks/:id` posterior responde `404 TASK_NOT_FOUND`.

Verificar que todas estas rutas conservan sus códigos de estado HTTP, estructura de datos y respuesta uniforme demuestra que la refactorización arquitectónica a la capa de repositorio preservó íntegro el contrato de A7.

## 10. ¿Qué limitación tiene la paginación basada en skip cuando la colección crece mucho?

La paginación con `skip` presenta un costo computacional de orden $O(N)$ en colecciones de gran volumen (cientos de miles o millones de documentos). Para satisfacer una consulta con `skip(100000).limit(10)`, MongoDB debe recorrer internamente y descartar uno a uno los 100,000 documentos previos antes de retornar los 10 solicitados, lo cual degrada severamente el uso de CPU y memoria de la base de datos. Además, si se insertan o eliminan documentos concurrentemente mientras el usuario navega entre páginas, los resultados pueden desplazarse, provocando que el cliente vea elementos repetidos u omita elementos entre páginas. Para colecciones a gran escala, la alternativa recomendada es la paginación por cursor o *keyset pagination* (filtrando por `_id > ultimo_id`).
