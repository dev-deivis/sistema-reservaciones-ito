# Microservicio de Notificaciones — Documentación

**Responsable:** Heber  
**Proyecto:** Sistema de Reservaciones ITO  
**Rama:** `feature/notificaciones-bd`

---

## Descripción general

El módulo de notificaciones se implementó como un **microservicio independiente** que corre en el puerto `3001`, separado del backend principal (`3000`). El backend principal actúa como intermediario: recibe las peticiones del frontend con JWT validado y las reenvía internamente al microservicio.

```
Frontend (5173)
    ↓ JWT
Backend principal (3000)  ←→  PostgreSQL (5432)
    ↓ HTTP interno (sin JWT)
Microservicio notificaciones (3001)
    ↓
PostgreSQL (5432)
```

---

## Por qué se separó como microservicio

El módulo de notificaciones no es crítico para el flujo principal de reservaciones. Separarlo permite:

- **Tolerancia a fallos:** si el microservicio se cae, las reservaciones siguen creándose y cancelándose con normalidad. El backend principal imprime un `warn` en consola pero no interrumpe la operación.
- **Despliegue independiente:** el servicio puede reiniciarse, actualizarse o escalarse sin afectar al backend principal.
- **Separación de responsabilidades:** la lógica de notificaciones queda aislada en su propio proceso.

---

## Cómo levantarlo

```bash
cd notificaciones-service
cp .env.example .env
# Editar .env con las mismas credenciales de PostgreSQL que el backend principal
npm install
npm run dev
```

El servicio queda disponible en `http://localhost:3001`.  
Verificar estado: `GET http://localhost:3001/api/health`

### Variables de entorno requeridas (`.env`)

```env
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=reservaciones_ito
DB_USER=postgres        # o "admin" si usas Docker
DB_PASSWORD=tu_password
```

> El microservicio comparte la misma base de datos que el backend principal — solo la tabla `notificaciones`.

---

## Base URL

```
http://localhost:3001/api/notificaciones
```

> Estos endpoints **no están expuestos directamente al frontend**. El frontend llama al backend principal (`/api/notificaciones`) y este reenvía internamente al microservicio.

---

## Endpoints

---

### 1. GET `/api/notificaciones?usuario_id=X`

Devuelve todas las notificaciones de un usuario ordenadas por fecha descendente.

#### Parámetros

| Tipo | Nombre | Requerido | Descripción |
|------|--------|-----------|-------------|
| Query param | `usuario_id` | Sí | ID del usuario |

#### Ejemplo de request

```
GET http://localhost:3001/api/notificaciones?usuario_id=2
```

#### Response `200 OK`

```json
[
  {
    "id": 5,
    "usuario_id": 2,
    "reservacion_id": 8,
    "tipo": "confirmacion",
    "mensaje": "Tu reservación del Aula 101 fue confirmada.",
    "leida": false,
    "created_at": "2026-05-10T14:30:00.000Z"
  },
  {
    "id": 3,
    "usuario_id": 2,
    "reservacion_id": 6,
    "tipo": "cancelacion",
    "mensaje": "Tu reservación del Lab Computo 1 fue cancelada.",
    "leida": true,
    "created_at": "2026-05-08T09:15:00.000Z"
  }
]
```

---

### 2. GET `/api/notificaciones/no-leidas?usuario_id=X`

Devuelve el total y la lista de notificaciones no leídas del usuario.

#### Parámetros

| Tipo | Nombre | Requerido | Descripción |
|------|--------|-----------|-------------|
| Query param | `usuario_id` | Sí | ID del usuario |

#### Response `200 OK`

```json
{
  "total": 2,
  "notificaciones": [
    {
      "id": 5,
      "tipo": "confirmacion",
      "mensaje": "Tu reservación del Aula 101 fue confirmada.",
      "leida": false,
      "created_at": "2026-05-10T14:30:00.000Z"
    }
  ]
}
```

---

### 3. POST `/api/notificaciones`

Crea una nueva notificación. Lo llama el backend principal automáticamente al crear o cancelar una reservación.

#### Body

```json
{
  "usuario_id": 2,
  "reservacion_id": 8,
  "tipo": "confirmacion",
  "mensaje": "Tu reservación del Aula 101 fue confirmada."
}
```

| Campo | Tipo | Requerido | Valores posibles |
|-------|------|-----------|-----------------|
| `usuario_id` | integer | Sí | ID del usuario destinatario |
| `reservacion_id` | integer | Sí | ID de la reservación relacionada |
| `tipo` | string | Sí | `"confirmacion"`, `"cancelacion"`, `"recordatorio"` |
| `mensaje` | string | Sí | Texto de la notificación |

#### Response `201 Created`

```json
{
  "id": 9,
  "usuario_id": 2,
  "reservacion_id": 8,
  "tipo": "confirmacion",
  "mensaje": "Tu reservación del Aula 101 fue confirmada.",
  "leida": false,
  "created_at": "2026-05-10T15:00:00.000Z"
}
```

---

### 4. PATCH `/api/notificaciones/:id/leer`

Marca una notificación específica como leída. Requiere `usuario_id` en el body para validar que la notificación pertenece al usuario correcto.

#### Body

```json
{ "usuario_id": 2 }
```

#### Response `200 OK`

```json
{ "mensaje": "Notificación marcada como leída" }
```

#### Response `404 Not Found`

```json
{ "error": "Notificación no encontrada" }
```

---

### 5. PATCH `/api/notificaciones/leer-todas?usuario_id=X`

Marca todas las notificaciones no leídas del usuario como leídas.

#### Parámetros

| Tipo | Nombre | Requerido |
|------|--------|-----------|
| Query param | `usuario_id` | Sí |

#### Response `200 OK`

```json
{ "mensaje": "Todas las notificaciones marcadas como leídas" }
```

---

### 6. GET `/api/health`

Verifica que el microservicio esté activo.

#### Response `200 OK`

```json
{ "status": "ok", "service": "notificaciones" }
```

---

## Tolerancia a fallos

El backend principal envuelve cada llamada al microservicio en un bloque `try/catch` con lógica fire-and-forget:

- Si el microservicio **no está disponible**, la operación de reservación continúa con normalidad.
- El backend imprime en consola:  
  `[reservaciones] microservicio de notificaciones no disponible — se omite notificación`
- El usuario **no recibe un error** — simplemente no llega la notificación.

Esto significa que el microservicio puede reiniciarse o estar caído sin afectar las reservaciones.

---

## Seguridad

El microservicio **no valida JWT**. La autenticación y autorización las realiza el backend principal antes de llamarlo. Los endpoints del microservicio están diseñados para consumo interno (backend → microservicio), no para ser llamados directamente desde el frontend o desde fuera de la red del servidor.
