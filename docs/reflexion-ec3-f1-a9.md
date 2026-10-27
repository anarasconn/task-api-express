# Reflexión: Registro de usuarios, protección de contraseñas y autenticación con JWT

## 1. ¿Por qué un hash de contraseña no debe poder descifrarse?

Porque el cifrado es un proceso bidireccional diseñado para recuperar el texto original mediante una clave, mientras que el hash de contraseñas es una función unidireccional matemática irreversible. Si las contraseñas se pudieran descifrar, cualquier filtración de la base de datos o de la clave de descifrado expondría directamente las contraseñas en texto plano de todos los usuarios. Al usar una función de hash adaptativa (como bcrypt), el sistema no necesita conocer la contraseña real para autenticar; únicamente necesita comparar el hash de la contraseña ingresada con el hash previamente almacenado.

## 2. ¿Qué diferencia existe entre una sal aleatoria y la clave usada para firmar HS256?

- **Sal aleatoria (bcrypt)**: Es una secuencia de datos aleatorios generada individualmente para cada contraseña e incrustada públicamente dentro de la cadena del hash resultante. Su propósito es evitar ataques de tablas arcoíris (*rainbow tables*) y asegurar que dos usuarios con la misma contraseña tengan hashes completamente diferentes.
- **Clave secreta HS256 (`JWT_SECRET`)**: Es una clave privada y simétrica compartida y custodiada únicamente por el servidor de la API. Se utiliza para generar la firma criptográfica HMAC de los tokens y verificar que el contenido de los claims no haya sido alterado por terceros. A diferencia de la sal, si la clave secreta se expone, la seguridad de todo el sistema de autenticación queda comprometida.

## 3. ¿Por qué passwordHash tiene select false y aun así el login puede recuperarlo?

En el esquema de Mongoose, configurar `passwordHash: { select: false }` garantiza que en cualquier consulta por defecto (`find`, `findById`, `findOne`) dicho campo sea omitido automáticamente del documento recuperado. Esto previene fugas accidentales del hash hacia la capa de presentación o respuestas JSON. Sin embargo, cuando el servicio de autenticación requiere expresamente el hash para verificar la contraseña en el login, el repositorio invoca explícitamente `.select('+passwordHash')`, permitiendo recuperar ese campo de forma controlada y únicamente en la función de verificación.

## 4. ¿Por qué unique no sustituye la validación HTTP del correo?

La opción `unique: true` en Mongoose no es una regla de validación de aplicación; es una instrucción para crear un índice único a nivel de motor de base de datos en MongoDB. Aunque el índice único es la garantía definitiva contra condiciones de carrera al persistir, no valida formato sintáctico, dominio, longitud ni normalización. La validación HTTP previa (en `validateAuth`) verifica formato RFC, longitud máxima de 254 caracteres, recorta espacios en blanco (`trim`), convierte a minúsculas (`toLowerCase`) y proporciona mensajes claros (`422 AUTH_VALIDATION_ERROR`) antes de enviar una operación fallida a la base de datos.

## 5. ¿Qué riesgo evita rechazar el campo role durante el registro?

Evita la vulnerabilidad de asignación masiva (*mass assignment*) y escalamiento de privilegios. Si el endpoint de registro permitiera al cliente enviar `role: 'admin'`, cualquier usuario malintencionado podría autoasignarse privilegios de administrador al crear su cuenta. Al rechazar `role` en el middleware con código 422 y forzar `role: 'user'` de manera estricta en el servicio, se garantiza que todos los registros públicos correspondan a usuarios estándar.

## 6. ¿Por qué correo inexistente y contraseña incorrecta devuelven el mismo mensaje?

Devolver mensajes específicos como *"El correo no existe"* o *"La contraseña es incorrecta"* permite a un atacante enumerar qué correos electrónicos están registrados en el sistema (*username enumeration attack*). Al responder de manera indistinta con `401 INVALID_CREDENTIALS` (*"El correo o la contraseña son incorrectos."*), tanto para un correo inexistente como para una contraseña equivocada, se previene la fuga de información sobre la existencia de cuentas. Además, el servicio ejecuta una verificación contra un hash ficticio (`DUMMY_PASSWORD_HASH`) para mitigar ataques de temporización (*timing attacks*).

## 7. ¿Qué información contiene el JWT de esta actividad y qué información se excluye?

- **Información que contiene**:
  - `sub`: Identificador único y estable del usuario (ID de MongoDB).
  - `role`: Rol del usuario (`user` o `admin`).
  - Claims estándar de metadatos: `iss` (emisor), `aud` (audiencia), `iat` (fecha de emisión) y `exp` (fecha de expiración).
- **Información que se excluye**:
  - Contraseñas en texto plano, `passwordHash`, nombres, correos electrónicos o datos sensibles personales. Dado que el payload de un JWT está codificado en Base64Url y no cifrado, cualquier poseedor del token puede leer su contenido.

## 8. ¿Qué validan issuer, audience, algorithms y exp?

- `issuer` (`iss`): Valida que el token fue emitido específicamente por esta API (`task-api-express`) y no por otro servidor de autenticación.
- `audience` (`aud`): Valida que el token fue generado para el cliente autorizado (`task-api-client`).
- `algorithms`: Fuerza que la verificación solo acepte algoritmos criptográficos autorizados (en este caso estrictamente `['HS256']`), evitando ataques de confusión de algoritmos (como degradación a `none` o ataque de clave pública como HMAC).
- `exp`: Valida que la fecha actual no sea posterior a la fecha de vencimiento del token, rechazando credenciales expiradas.

## 9. ¿Cómo llega un error de MongoDB desde el repositorio hasta errorHandler en Express 5?

1. Una operación de Mongoose falla (por ejemplo, error de duplicado código 11000 al violar el índice único).
2. El repositorio captura el error en su función `execute` y lo transforma mediante `mapPersistenceError` en una instancia tipada de `AppError` (como `409 USER_EMAIL_EXISTS` o `503 DATABASE_UNAVAILABLE`).
3. El repositorio relanza el error (`throw`), provocando que la promesa asíncrona del servicio y del controlador sea rechazada.
4. Express 5 detecta de forma nativa la promesa rechazada dentro del controlador asíncrono y la redirige automáticamente al middleware de captura de errores `errorHandler`.
5. `errorHandler` serializa la respuesta uniforme con `code`, `message`, `details` y `requestId` sin exponer información sensible de la conexión.

## 10. ¿Por qué las rutas de tareas permanecen públicas en A9 y qué cambiará en A10?

Permanecen públicas para aislar y concentrar los objetivos pedagógicos de la actividad A9 en la construcción, protección y emisión de credenciales de autenticación y tokens JWT. En la siguiente actividad (A10), se implementará el middleware de protección de rutas (`authenticate`) que exigirá el encabezado `Authorization: Bearer <token>`, verificará la validez del JWT y vinculará las tareas creadas con la identidad del usuario autenticado, implementando adicionalmente control de acceso basado en roles (RBAC).

