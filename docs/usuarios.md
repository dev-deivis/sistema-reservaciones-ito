# Módulo de Gestión de Usuarios

Todos los endpoints requieren autenticación (`Authorization: Bearer <token>`). La mayoría están restringidos a administradores; el endpoint de cambio de contraseña es accesible por cualquier usuario autenticado sobre su propia cuenta.

## Resumen de endpoints

| Método | Ruta | Middleware | Descripción |
|--------|------|------------|-------------|
| `GET` | `/api/usuarios` | `authAdmin` | Listar usuarios con filtros |
| `GET` | `/api/usuarios/:id` | `authAdmin` | Detalle de un usuario |
| `POST` | `/api/usuarios` | `authAdmin` | Crear usuario |
| `PUT` | `/api/usuarios/:id` | `authAdmin` | Editar nombre, email, rol |
| `PATCH` | `/api/usuarios/:id/activo` | `authAdmin` | Activar / desactivar cuenta |
| `PATCH` | `/api/usuarios/:id/password` | `auth` | Cambiar contraseña (propio usuario o admin) |
| `DELETE` | `/api/usuarios/:id` | `authAdmin` | Eliminar usuario |

---

## GET /api/usuarios

Lista todos los usuarios con filtros opcionales.

**Query params**

| Parámetro | Tipo    | Descripción                          |
|-----------|---------|--------------------------------------|
| `buscar`  | string  | Filtra por nombre o email (ILIKE)    |
| `rol`     | string  | `admin` o `usuario`                  |
| `activo`  | boolean | `true` o `false`                     |

**Ejemplo request**
```
GET /api/usuarios?buscar=maria&rol=usuario&activo=true
```

**Ejemplo response (200)**
```json
[
  {
    "id": 3,
    "nombre": "María López",
    "email": "maria@itoaxaca.edu.mx",
    "rol": "usuario",
    "activo": true,
    "created_at": "2025-03-10T14:22:00.000Z"
  }
]
```

---

## GET /api/usuarios/:id

Obtiene un usuario por ID junto con sus reservaciones activas (estado distinto de `cancelada`).

**Ejemplo response (200)**
```json
{
  "id": 3,
  "nombre": "María López",
  "email": "maria@itoaxaca.edu.mx",
  "rol": "usuario",
  "activo": true,
  "created_at": "2025-03-10T14:22:00.000Z",
  "reservaciones_activas": [
    {
      "id": 12,
      "fecha_inicio": "2025-05-20T09:00:00.000Z",
      "fecha_fin": "2025-05-20T11:00:00.000Z",
      "estado": "confirmada",
      "motivo": "Clase de algoritmos",
      "espacio_nombre": "Aula 4"
    }
  ]
}
```

---

## POST /api/usuarios

Crea un nuevo usuario. La contraseña se hashea con bcrypt (10 rounds).

**Body**
```json
{
  "nombre": "Juan Pérez García",
  "email": "juan@itoaxaca.edu.mx",
  "password": "secreto123",
  "rol": "usuario"
}
```

**Ejemplo response (201)**
```json
{
  "id": 8,
  "nombre": "Juan Pérez García",
  "email": "juan@itoaxaca.edu.mx",
  "rol": "usuario",
  "activo": true,
  "created_at": "2026-05-20T18:00:00.000Z"
}
```

**Errores posibles**
- `400` — campos faltantes o rol inválido
- `409` — ya existe una cuenta con ese email

---

## PUT /api/usuarios/:id

Actualiza nombre, email o rol. Para cambiar la contraseña usar `PATCH /api/usuarios/:id/password`.

**Body (todos los campos son opcionales)**
```json
{
  "nombre": "Juan Pérez",
  "email": "juanp@itoaxaca.edu.mx",
  "rol": "admin"
}
```

**Ejemplo response (200)**
```json
{
  "id": 8,
  "nombre": "Juan Pérez",
  "email": "juanp@itoaxaca.edu.mx",
  "rol": "admin",
  "activo": true,
  "created_at": "2026-05-20T18:00:00.000Z"
}
```

---

## PATCH /api/usuarios/:id/activo

Alterna el campo `activo` del usuario (toggle). Si estaba en `true` lo pone `false` y viceversa.

**Protecciones:**
- Un admin no puede desactivarse a sí mismo (`req.usuario.id === id` → `400`).

**Ejemplo response (200) — después de desactivar**
```json
{
  "id": 3,
  "nombre": "María López",
  "email": "maria@itoaxaca.edu.mx",
  "rol": "usuario",
  "activo": false
}
```

**Comportamiento en middleware:** Aunque el token de un usuario desactivado sea válido, el middleware `auth` consulta `SELECT activo FROM usuarios WHERE id = $1` en cada request. Si `activo = false`, responde `401 Cuenta deshabilitada` antes de ejecutar cualquier controlador.

---

## PATCH /api/usuarios/:id/password

Cambia la contraseña de un usuario.

**Autorización:** El propio usuario O un administrador.
- Middleware: `auth` — cualquier usuario autenticado llega al endpoint; la validación de permisos se hace en el controlador.
- Si `req.usuario.id !== id` y `req.usuario.rol !== 'admin'` → `403`.

**Interfaces de usuario que consumen este endpoint:**
- **Usuario regular** → página `/perfil` (accesible desde la tarjeta de usuario en el Sidebar). Requiere los tres campos: `password_actual`, `password_nueva` y confirmación.
- **Admin** → modal "Cambiar contraseña" en `/usuarios` (ícono de candado por fila). Solo requiere `password_nueva` y confirmación; no necesita la contraseña actual del otro usuario.

**Body — usuario cambiando su propia contraseña**
```json
{
  "password_actual": "contraseñaAnterior",
  "password_nueva": "nuevaContraseña123"
}
```

**Body — admin cambiando la contraseña de otro usuario**
```json
{
  "password_nueva": "nuevaContraseña123"
}
```

**Validaciones**
| Condición | Respuesta |
|-----------|-----------|
| `password_nueva` tiene menos de 8 caracteres | `400 { "error": "La nueva contraseña debe tener mínimo 8 caracteres" }` |
| `password_actual` no enviado por el propio usuario | `400 { "error": "La contraseña actual es requerida" }` |
| `password_actual` incorrecto | `400 { "error": "La contraseña actual es incorrecta" }` |
| Usuario no encontrado | `404 { "error": "Usuario no encontrado" }` |
| Sin permiso (ni propio ni admin) | `403 { "error": "No tienes permiso para cambiar esta contraseña" }` |

**Ejemplo response (200)**
```json
{
  "mensaje": "Contraseña actualizada correctamente"
}
```

---

## DELETE /api/usuarios/:id

Elimina un usuario de la base de datos.

**Protecciones:**
- No permite eliminar al admin que hace la petición (`400`).
- Si el usuario tiene reservaciones con estado `pendiente` o `confirmada`, responde `409`:

```json
{
  "error": "El usuario tiene 2 reservación(es) activa(s). Cancélalas antes de eliminar el usuario."
}
```

**Ejemplo response (200)**
```json
{
  "mensaje": "Usuario eliminado correctamente"
}
```

---

## Seguridad en el middleware `auth`

Con la incorporación del campo `activo`, el flujo de autenticación ahora es:

1. Verificar que el header `Authorization: Bearer <token>` exista.
2. Verificar la firma JWT con `jwt.verify`.
3. Consultar `SELECT activo FROM usuarios WHERE id = $1`.
   - Si el usuario no existe o `activo = false` → `401 Cuenta deshabilitada`.
4. Adjuntar `req.usuario = decoded` y continuar con `next()`.

Esto garantiza que desactivar una cuenta tiene efecto inmediato, sin necesidad de revocar tokens ni reiniciar el servidor.

---

## Interfaces de usuario (frontend)

| Página / Componente | Ruta | Quién la usa | Operaciones |
|---------------------|------|--------------|-------------|
| `GestionUsuarios.jsx` | `/usuarios` | Admin | Listar, crear, editar, activar/desactivar, cambiar rol, cambiar contraseña, eliminar |
| `Perfil.jsx` | `/perfil` | Cualquier usuario autenticado | Ver datos de cuenta, cambiar contraseña propia |

**Acceso a Mi perfil:** la tarjeta de usuario en la parte inferior del Sidebar es un enlace a `/perfil`.
