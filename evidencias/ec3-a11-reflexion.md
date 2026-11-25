# Reflexión y Respuestas Teóricas - EC3 F2 A11

### 1. ¿Qué parte de la aplicación se reemplaza con dobles en api.test.ts y qué parte sigue siendo real?
En `api.test.ts`, se reemplazan con dobles de prueba (mocks mediante `vi.mock`) los módulos de lógica de negocio y persistencia: `src/services/auth.service.js` y `src/services/task.service.js`. 
Por otro lado, la aplicación Express (`app.ts`), los enrutadores (`routes/`), los middlewares de validación, seguridad, autenticación (`authenticate`) y autorización (`requireRole`), el manejo centralizado de errores (`errorHandler`), la generación y verificación real de tokens JWT (`token.service.js` con `jose`) y las respuestas HTTP permanecen completamente reales.

### 2. ¿Por qué una suite aprobada no demuestra que MongoDB Atlas esté configurado correctamente?
Porque la suite de pruebas automatizadas utiliza dobles de servicio (mocks) que interceptan las llamadas antes de llegar a los repositorios y a Mongoose; ni siquiera se inicializa la conexión con la base de datos (`connectDatabase` no se invoca). Por tanto, la suite garantiza que la frontera HTTP y las reglas de Express funcionan, pero no comprueba credenciales de Atlas, conectividad de red (IP Access List), índices únicos de MongoDB ni latencias de red.

### 3. ¿Qué diferencia existe entre OpenAPI y Swagger UI?
- **OpenAPI:** Es una especificación estándar agnóstica e independiente (expresada en formato JSON o YAML, en este caso 3.1.0) que describe formalmente la interfaz de un servicio web: rutas, operaciones, esquemas de entrada/salida, códigos de estado y esquemas de seguridad.
- **Swagger UI:** Es una herramienta visual (interfaz de usuario web interactiva) que lee la especificación OpenAPI y genera una página HTML/JS dinámica que permite a los desarrolladores explorar la documentación y ejecutar peticiones directamente contra el servidor ("Try it out").

### 4. ¿Por qué GET /api/auth/me obtiene el id desde el token y no desde params o body?
Por seguridad e integridad de la identidad (principio de menor privilegio y prevención de suplantación IDOR - Insecure Direct Object References). Si la ruta permitiera recibir el identificador por parámetro de ruta (`/me/:id`) o cuerpo de la petición, un usuario malintencionado podría enviar el identificador de otro usuario y consultar información ajena. Al extraer el `userId` directamente del payload del token JWT verificado y firmado criptográficamente (`res.locals.auth`), el servidor garantiza que únicamente se devuelve la identidad del propietario legítimo de dicho token.

### 5. ¿Por qué authRateLimiter ya no se monta en todo authRouter?
Porque `authRouter` ahora incluye el endpoint `GET /api/auth/me`, el cual se consulta frecuentemente durante la navegación normal o al recargar la página para restaurar la sesión del usuario. Si el limitador estuviera a nivel de todo el router, un usuario navegando legítimamente alcanzaría el límite y recibiría un error 429. Por ello, el rate limiter se asocia exclusivamente a las operaciones críticas de credenciales (`POST /register` y `POST /login`) para mitigar ataques de fuerza bruta.

### 6. ¿Qué diferencia hay entre un error 401 y uno 403 en el cliente?
- **401 Unauthorized (Falta de autenticación):** El cliente no está identificado o sus credenciales (token JWT) no existen, son inválidas o han expirado. La acción que toma el cliente es limpiar la sesión local (`clearSession()`) y redirigir al usuario al formulario de inicio de sesión.
- **403 Forbidden (Falta de autorización):** El cliente está correctamente autenticado e identificado, pero carece de los permisos necesarios (por ejemplo, rol `user` intentando eliminar un recurso que exige rol `admin`). El usuario no debe ser deslogueado, sino que se le debe mostrar un mensaje advirtiendo que no tiene permisos suficientes.

### 7. ¿Por qué Postman puede funcionar aunque el navegador informe CORS?
Porque la política CORS (Cross-Origin Resource Sharing) es un mecanismo de seguridad implementado y ejecutado **exclusivamente por los navegadores web** para proteger a los usuarios de peticiones indebidas entre distintos orígenes. Postman no es un navegador web; es un cliente HTTP directo de nivel de transporte que ignora las restricciones CORS y no bloquea respuestas cuando falta o no coincide la cabecera `Access-Control-Allow-Origin`.

### 8. ¿Qué riesgo conserva sessionStorage y por qué se usa solo como solución didáctica?
`sessionStorage` almacena el token en texto plano dentro del contexto del navegador accesible desde JavaScript (`window.sessionStorage`). Si la aplicación llega a ser vulnerable a un ataque de Cross-Site Scripting (XSS), cualquier script inyectado puede leer el token y exfiltrarlo. Se utiliza en este entorno con fines puramente didácticos para ilustrar el intercambio manual de cabeceras `Authorization: Bearer <token>`; para un entorno de producción seguro, se deben preferir cookies `HttpOnly`, `Secure` y `SameSite` combinadas con mecanismos de renovación (refresh tokens).

### 9. ¿Qué contrato comparten openapi.ts, types.ts y las respuestas reales?
Comparten la definición formal observable de los datos y estructuras:
- La estructura de envoltura (`{ data: ... }` para éxito, `{ error: ... }` para errores).
- Los modelos de entidades (`User` con id, name, email, role, etc., y `Task` con id, title, status, etc.).
- Los formatos de metadatos de paginación (`PaginationMeta`).
- Los códigos de error y campos de validación (`ApiError` y `FieldIssue`).
`openapi.ts` lo describe para herramientas y clientes externos, `types.ts` lo aplica como tipos de TypeScript en el frontend React, y las respuestas de los controladores de Express lo implementan en tiempo de ejecución.

### 10. ¿Qué prueba agregarías primero antes de desplegar la actividad 12 y por qué?
Agregaría una prueba de integración de extremo a extremo (E2E) con una base de datos real (o un contenedor efímero mediante testcontainers / base en memoria) que verifique el ciclo completo: registro de usuario, login, obtención de token, creación de tarea persistida, actualización, verificación de filtros y eliminación con control de roles. Esta prueba verificaría que la conexión a la base de datos real, los índices de MongoDB y las variables de entorno de producción funcionen sin depender de mocks.
