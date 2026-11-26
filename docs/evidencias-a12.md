# Evidencias EC3 F3 A12

## Identificación
- Nombre: Ana Rascon
- Grupo: Programación Backend con Frameworks
- Repositorio: task-api-express
- Commit desplegado: a971203 (rama ec3-a12-despliegue-liberacion)
- Etiqueta: v1.0.0
- URL del frontend: https://task-client-react-anarascon.onrender.com
- URL pública de la API: https://task-api-express-anarascon.onrender.com

## Calidad local
- Resultado de pnpm install --frozen-lockfile: Aprobado (lockfile sincronizado con workspace).
- Resultado de pnpm verify: Aprobado (código 0; 6 pruebas backend, 3 pruebas cliente, chequeo TypeScript y ambos builds).
- Pruebas backend aprobadas: 6 de 6 pruebas aprobadas en Vitest.
- Pruebas cliente aprobadas: 3 de 3 pruebas aprobadas en Vitest.

## Despliegue
- Estado de /health: 200 OK con `{ data: { status: "up", version: "1.0.0", environment: "production" } }`
- Estado de /health/database: 200 OK con `{ data: { status: "up" } }`
- OpenAPI usa la URL pública: sí (configurado dinámicamente mediante `env.PUBLIC_API_URL`)
- Atlas restringido a IP de salida: sí (añadidas IPs de salida del servicio en Network Access)

## Aceptación
| Caso | Código o resultado | Evidencia | Observación |
|---|---:|---|---|
| Registro | 201 Created | Formulario y respuesta sin passwordHash | Crea cuenta y pasa a login inmediato |
| Login y /me | 200 OK | Perfil con Nombre, Correo y Rol | Token Bearer almacenado en sessionStorage |
| Crear tarea | 201 Created | Tarea visible en la lista | Persiste en MongoDB Atlas |
| Filtrar y paginar | 200 OK | Lista filtrada por estado y búsqueda | Paginación con Anterior/Siguiente |
| Editar y completar | 200 OK | Título actualizado y badge cambiado | PATCH ejecutado exitosamente |
| DELETE con user | 403 FORBIDDEN | Botón oculto en UI; 403 al forzar | requireRole protege el backend |
| DELETE con admin | 204 No Content | Botón Eliminar visible; tarea borrada | Sin cuerpo en la respuesta |
| Token inválido | 401 Unauthorized | Código AUTHENTICATION_REQUIRED | Redirige al login limpiando sesión |
| Prueba de humo | Salida 0 | 5 verificaciones aprobadas | Ejecutado con pnpm smoke:release |

## Seguridad de la evidencia
- [x] No se muestra MONGODB_URI.
- [x] No se muestra JWT_SECRET.
- [x] No se muestran contraseñas.
- [x] Los tokens están ocultos o truncados.

## Incidencias y solución
- Incidencia: Ninguna incidencia bloqueante durante la verificación integral.
- Causa: N/A.
- Corrección: Validación anticipada de variables de entorno y proxy de confianza en Express.
- Nueva comprobación: Ejecución exitosa de `pnpm verify` y suite de pruebas del cliente.
