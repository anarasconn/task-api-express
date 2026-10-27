# Evidencias EC3 F1 A9

Completa este registro con resultados observados en tu entorno. No incluyas contraseñas, hashes, tokens completos, URI de MongoDB ni `JWT_SECRET`. No marques una prueba como aprobada sin ejecutarla.

## Datos generales
- Nombre:
- Grupo:
- Repositorio y rama:
- Commit final:

## Entorno verificado
- `node --version`:
- `pnpm --version`:
- `pnpm check`: pendiente de ejecutar
- `pnpm build`: pendiente de ejecutar
- `GET /health/database`: pendiente de ejecutar (anota código HTTP y estado)

## Registro
- Solicitud: `POST /api/auth/register` (usa `password` y `confirmPassword`; reemplaza ambos por `<OCULTA>` en la evidencia)
- Código HTTP observado:
- Respuesta pública sanitizada:
- Confirmación de que no se devuelven `password` ni `passwordHash`:
- Confirmación en MongoDB de que solo se guardó el hash y no `confirmPassword`:

## Inicio de sesión
- Solicitud: `POST /api/auth/login` (reemplaza la contraseña por `<OCULTA>`)
- Código HTTP observado:
- Campos recibidos: reemplaza el token por `<TOKEN_OCULTO>`
- Claims observados sin copiar el token:

## Pruebas negativas
| Caso | Código esperado | Código obtenido | `error.code` | Resultado |
|---|---:|---:|---|---|
| Correo repetido | 409 | Pendiente | Pendiente | Pendiente |
| Contraseña corta | 422 | Pendiente | Pendiente | Pendiente |
| Contraseña mayor de 72 bytes | 422 | Pendiente | Pendiente | Pendiente |
| Campo `role` | 422 | Pendiente | Pendiente | Pendiente |
| Confirmación distinta | 422 | Pendiente | Pendiente | Pendiente |
| Credenciales incorrectas y correo inexistente | 401 | Pendiente | Pendiente | Pendiente |
| Content-Type incorrecto | 415 | Pendiente | Pendiente | Pendiente |
| JSON inválido | 400 | Pendiente | Pendiente | Pendiente |

## Regresión de tareas
Registra resultados reales; las tareas deben seguir siendo públicas en A9.
- Crear:
- Listar con paginación y filtros:
- Actualizar:
- Completar:
- Eliminar:
- `/health` y `/health/database`:

## Seguridad observada
- ¿MongoDB guarda el hash, sin contraseña en texto plano ni `confirmPassword`?
- ¿Las respuestas omiten `passwordHash` y secretos?
- ¿El registro rechaza `role` y fuerza el rol `user`?
- ¿Se ocultaron URI, contraseñas, hashes y tokens en las capturas?

## Conclusión
Resume únicamente lo que verificaste. La protección de rutas y autorización por rol quedan para A10.
