# Reflexión: modelado y persistencia con MongoDB

## 1. ¿Qué diferencia existe entre un documento, un esquema y un modelo?

El documento es el registro guardado en la colección tasks, por ejemplo una tarea con title, status y fechas. El esquema (taskSchema) define las reglas que debe cumplir: tipos, longitud máxima, valores permitidos y valor inicial. El modelo (TaskModel) es la herramienta que usa el código para crear, consultar y borrar documentos aplicando ese esquema.

## 2. ¿Por qué la API devuelve id en lugar de _id?

Porque _id es la estructura interna de MongoDB y es un ObjectId. La función toTask lo convierte a texto y lo expone como id, así el cliente recibe una respuesta clara y no depende de detalles internos de la base de datos.

## 3. ¿Qué problema evita migrar todas las operaciones a una sola fuente de datos?

Evita tener dos fuentes de verdad. Si POST y GET usaran Atlas pero PATCH y DELETE el arreglo en memoria, una tarea creada no se podría completar ni eliminar de forma confiable.

## 4. ¿Qué reglas aplica el middleware y cuáles repite el esquema?

El middleware valida la entrada HTTP antes de llegar a la base: title obligatorio y de hasta 120 caracteres, y description opcional de hasta 300. El esquema repite esos límites como protección de persistencia, para que se cumplan aunque otro código use TaskModel sin pasar por la ruta.

## 5. ¿Qué diferencia existe entre INVALID_ID y TASK_NOT_FOUND?

INVALID_ID (400) significa que el texto de la URL no tiene formato de ObjectId, como /api/tasks/1. TASK_NOT_FOUND (404) significa que el formato es válido pero no existe una tarea con ese id, como una tarea ya eliminada.

## 6. ¿Qué hacen timestamps y versionKey false?

timestamps hace que Mongoose agregue y actualice createdAt y updatedAt automáticamente. versionKey false evita el campo __v, porque esta API todavía no usa control de versiones de documentos.

## 7. ¿Por qué los controladores deben usar async y await?

Porque las operaciones de Mongoose devuelven promesas. Sin await, el controlador respondería antes de tener el resultado y enviaría una Promise en lugar de los datos.

## 8. ¿Cómo llega un AppError asíncrono al errorHandler de Express 5?

En Express 5, si una función asíncrona lanza un error o su promesa se rechaza, Express lo pasa automáticamente al manejador de errores registrado al final de app.ts, que lo convierte en la respuesta uniforme con code, message y requestId.

## 9. ¿Qué prueba demuestra realmente que una tarea es persistente?

Crear una tarea, detener la API, iniciarla de nuevo y consultar: si la tarea sigue ahí, está en Atlas y no en la memoria del proceso. En mi prueba, las tres tareas siguieron en el listado después de reiniciar, y también se ven en Data Explorer.

## 10. ¿Qué información de Mongoose o Atlas nunca debe aparecer en la respuesta HTTP?

La URI de conexión, el usuario, la contraseña, los nombres de servidores, los stack traces y los objetos completos de error de Mongoose. Por eso mapPersistenceError devuelve mensajes seguros como DATABASE_UNAVAILABLE.
