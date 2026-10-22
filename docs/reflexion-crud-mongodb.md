# Reflexión: CRUD persistente con Express y MongoDB

## 1. ¿Qué operación de Mongoose corresponde a cada letra de CRUD?

- **C (Create)**: Corresponde a `TaskModel.create(...)`, que instancia y almacena un nuevo documento en la colección de MongoDB.
- **R (Read)**: Corresponde a `TaskModel.find(...)` para listar colecciones y `TaskModel.findById(...)` para consultar un documento específico por su `_id`.
- **U (Update)**: Corresponde a `TaskModel.findByIdAndUpdate(id, { $set: changes }, { new: true, runValidators: true })`, que actualiza campos de manera atómica y controlada.
- **D (Delete)**: Corresponde a `TaskModel.findByIdAndDelete(id)`, que remueve el documento indicado por su clave primaria de la colección.

## 2. ¿Por qué se usa PATCH y no un reemplazo completo del documento?

Se utiliza `PATCH` porque el estándar HTTP lo define para actualizaciones parciales. Esto permite al cliente enviar únicamente las propiedades que requiere modificar (por ejemplo, solo cambiar el título o solo marcar el estado) sin necesidad de transportar todo el documento. Un reemplazo completo (`PUT`) requeriría enviar la totalidad del recurso, arriesgando la pérdida involuntaria de información en campos que el cliente desconoce o no pretendía alterar.

## 3. ¿Qué problema evita $set?

El operador `$set` de MongoDB actualiza exclusivamente los pares clave-valor proporcionados en el objeto de cambios, preservando el resto de los campos existentes en el documento almacenado. Evita la sobreescritura destructiva que causaría reemplazar todo el documento o perder propiedades que no fueron especificadas en la solicitud entrante.

## 4. ¿Qué efecto tienen new true y runValidators true?

- `new: true`: Hace que Mongoose retorne el documento resultante tras aplicar las modificaciones. Por defecto, `findByIdAndUpdate` devuelve la versión previa a la actualización.
- `runValidators: true`: Fuerza a que Mongoose ejecute las validaciones definidas en el esquema (`taskSchema`), tales como longitudes máximas y listas de valores permitidos (`enum`), durante el proceso de actualización. Sin esta bandera, las validaciones de esquema se ignoran en operaciones directas de actualización.

## 5. ¿Por qué un cuerpo vacío debe rechazarse?

Un cuerpo vacío (`{}`) no contiene ninguna instrucción de cambio válida para el recurso. Procesar una actualización vacía consumiría llamadas y recursos de red hacia MongoDB innecesariamente sin producir efecto alguno. Validarlo y rechazarlo a nivel HTTP con `422 VALIDATION_ERROR` proporciona retroalimentación inmediata al cliente para que envíe al menos un campo permitido (`title` o `status`) y evita operaciones nulas en la base de datos.

## 6. ¿Qué diferencia existe entre INVALID_ID y TASK_NOT_FOUND?

- `INVALID_ID` (HTTP 400): Es un error de validación de formato en la entrada. Ocurre cuando el parámetro `:id` no coincide con la sintaxis de un ObjectId de MongoDB (24 caracteres hexadecimales). Se rechaza de inmediato en el middleware antes de realizar consultas a la base de datos.
- `TASK_NOT_FOUND` (HTTP 404): Es un error de negocio o recurso inexistente. El identificador tiene un formato de ObjectId válido, pero la consulta en Atlas no encontró ningún documento con dicho identificador (o el registro fue eliminado con anterioridad).

## 7. ¿Qué responsabilidad cumple validateTaskUpdate y cuál cumple TaskModel?

- `validateTaskUpdate` (Middleware HTTP): Actúa como la primera barrera defensiva en el transporte HTTP. Inspecciona que `req.body` sea un objeto JSON, rechaza arrays, cuerpos vacíos o propiedades no permitidas (`_id`, `createdAt`, `owner`, etc.), y comprueba la validez sintáctica de `title` y `status`. Al aprobar, expone un objeto limpio `TaskUpdate` en `res.locals.taskUpdate`.
- `TaskModel` (Capa de persistencia Mongoose): Ejerce como la segunda barrera y garantiza la integridad de los datos a nivel de base de datos. Define los tipos de datos en la colección, los valores por defecto, la obligatoriedad, el `enum` de estados y la gestión automática de `timestamps` (`createdAt` y `updatedAt`).

## 8. ¿Cómo llega un error de updateTask al errorHandler de Express 5?

En Express 5, las promesas rechazadas o excepciones lanzadas (`throw new AppError(...)`) dentro de funciones controladoras y middleware asíncronos (`async`) son interceptadas nativamente por el ciclo de Express sin requerir librerías externas o bloques `try/catch` manuales en los controladores. Express 5 salta automáticamente la cadena de middleware normal y delega el error en el `errorHandler` central de la aplicación, el cual se encarga de serializar la respuesta HTTP uniforme con `code`, `message`, `details` y `requestId`.

## 9. ¿Por qué DELETE responde 204 sin cuerpo?

El código HTTP 204 (*No Content*) comunica que la petición fue procesada con éxito y que la entidad correspondiente ya no existe, por lo que no hay contenido que deba ser transmitido al cliente. Responder sin cuerpo (`res.status(204).send()`) se apega a los estándares REST y reduce la sobrecarga de datos en la red.

## 10. ¿Qué prueba demuestra que el CRUD es persistente y no solo funcional en memoria?

La prueba concluyente consiste en crear una tarea mediante `POST /api/tasks`, actualizarla mediante `PATCH /api/tasks/:id`, detener por completo el servidor (`Ctrl+C`), iniciarlo de nuevo con `pnpm dev` y realizar una petición `GET /api/tasks/:id`. Si el registro conserva las modificaciones realizadas antes de reiniciar el proceso, queda evidenciado que los datos se guardan de forma permanente en MongoDB Atlas y no dependen del ciclo de vida de la memoria RAM de Node.js. Adicionalmente, consultar la colección en Atlas Data Explorer ratifica la persistencia externa.
