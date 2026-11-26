# Reflexión y Respuestas Teóricas - EC3 F3 A12

### 1. ¿Cuál es la diferencia entre build, deploy y release?
- **Build:** Es el proceso de transformación y empaquetado del código fuente en artefactos ejecutables o estáticos optimizados (por ejemplo, transpilación de TypeScript a JavaScript con `tsc` y empaquetado de React con `vite build`).
- **Deploy (Despliegue):** Es la acción de colocar y ejecutar esos artefactos construidos en una infraestructura o servidor accesible (por ejemplo, publicar el contenedor Node y el sitio estático en los servidores de Render).
- **Release (Liberación):** Es el hito formal y auditable donde una versión específica del software (por ejemplo, `v1.0.0`) ha superado todos los criterios de calidad, pruebas automatizadas y aceptación, quedando identificada de forma inmutable mediante una etiqueta de Git (`git tag`) y un registro en `CHANGELOG.md`.

### 2. ¿Por qué PUBLIC_API_URL puede ser pública y JWT_SECRET no?
- `PUBLIC_API_URL` es la dirección accesible por Internet a la cual cualquier cliente (navegadores, Postman, aplicaciones móviles) debe dirigir sus peticiones HTTP; no contiene secretos y su conocimiento es indispensable para que los clientes interactúen con el servicio.
- `JWT_SECRET` es la clave simétrica privada utilizada por el servidor para firmar criptográficamente los tokens de acceso y validar su integridad. Si se filtrara públicamente, cualquier atacante podría falsificar tokens arbitrarios con rol `admin` y suplantar a cualquier usuario sin necesidad de contraseña.

### 3. ¿Qué riesgo introduce configurar trust proxy como true sin conocer la topología?
Al configurar `trust proxy` en `true` (en lugar de indicar el número exacto de saltos como `1`), Express asume que cualquier encabezado `X-Forwarded-*` proviene de un proxy confiable. Un atacante podría enviar una cabecera `X-Forwarded-For: <ip_falsa>` en su petición directa al servidor, engañando al middleware de limitación de tasa (`rateLimit`) y a los registros de auditoría, permitiéndole eludir bloqueos por fuerza bruta simplemente cambiando la IP falsa en cada intento (IP spoofing).

### 4. ¿Por qué ocultar un botón en React no autoriza ni prohíbe una operación?
Porque el código de React se ejecuta en el navegador del usuario (entorno del cliente no confiable). Ocultar un botón (como "Eliminar") es únicamente una mejora de experiencia de usuario (UX) para no mostrar acciones no permitidas, pero no previene que un usuario con conocimientos técnicos abra las herramientas de desarrollador o use Postman para emitir manualmente una petición `DELETE /api/tasks/:id`. La verdadera autorización solo puede ser garantizada por el servidor backend mediante middlewares como `requireRole('admin')`.

### 5. ¿Por qué VITE_API_URL requiere un nuevo build cuando cambia?
Porque en las aplicaciones compiladas con Vite/React para el navegador, no existe un proceso Node.js en tiempo de ejecución que lea dinámicamente `process.env`. Durante la fase de construcción (`vite build`), las ocurrencias de `import.meta.env.VITE_API_URL` se reemplazan estáticamente (inlining) por su valor en texto plano dentro de los archivos JavaScript finales generados en `client/dist`. Si la URL cambia, los archivos ya construidos conservarán la URL anterior hasta que se vuelva a ejecutar el build.

### 6. ¿Qué comprueba /health/database que no comprueba /health?
- `/health` comprueba únicamente que el proceso Node.js y la aplicación Express están vivos y listos para atender peticiones HTTP en su puerto.
- `/health/database` comprueba además la dependencia externa crítica: verifica que la conexión activa con MongoDB Atlas exista y se encuentre en estado conectado (`readyState === 1`), detectando problemas de credenciales, límites de conexiones o bloqueos de red hacia el clúster.

### 7. ¿Qué cubren las pruebas con servicios simulados y qué debe comprobarse con Atlas?
- **Pruebas con servicios simulados (mocks en Vitest):** Cubren la lógica de la frontera HTTP: rutas, middlewares de autenticación, verificación de firmas JWT, códigos de respuesta (200, 201, 204, 401, 403, 422), validación de esquemas y cabeceras CORS de forma rápida y determinista.
- **Comprobación con Atlas:** Verifica la persistencia real de datos, las consultas en MongoDB, la aplicación de índices únicos (evitar duplicados de correo), los tipos de datos de Mongoose en la base de datos física y la conectividad real a través de Internet.

### 8. ¿Por qué una respuesta 204 necesita tratamiento especial en el cliente?
Porque el código HTTP `204 No Content` indica éxito pero define expresamente que el cuerpo de la respuesta está completamente vacío (longitud 0). Si un cliente HTTP genérico intenta ejecutar `response.json()` sobre una respuesta 204, la operación fallará con un error de análisis de sintaxis JSON (`SyntaxError: Unexpected end of JSON input`). Por ello, `apiRequest` debe detectar `response.status === 204` y resolver inmediatamente con `undefined` sin intentar leer o parsear un JSON inexistente.

### 9. ¿Cómo confirmarías que la etiqueta v1.0.0 corresponde al código desplegado?
Comparando el hash SHA del commit apuntado por la etiqueta `git rev-parse v1.0.0` contra el hash del commit desplegado que reporta el panel de control de Render en el último despliegue exitoso. Además, se puede consultar el endpoint `GET /health` de producción para confirmar que reporte `version: "1.0.0"` y `environment: "production"`.

### 10. ¿Qué evidencia omitirías o redactarías antes de entregar y por qué?
Omitiría o redactaría de manera obligatoria:
- La cadena de conexión completa `MONGODB_URI` (ocultando usuario, contraseña y host del clúster).
- El valor del secreto criptográfico `JWT_SECRET`.
- Contraseñas de usuario en texto plano utilizadas durante las pruebas.
- Tokens JWT completos (`accessToken`), mostrando únicamente fragmentos truncados (ej. `eyJh...`).
Esto es fundamental para prevenir la filtración involuntaria de credenciales en repositorios públicos o compartidos, lo cual comprometería irreversiblemente la seguridad del sistema y de la base de datos en producción.
