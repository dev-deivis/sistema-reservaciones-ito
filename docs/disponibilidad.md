# Módulo de Disponibilidad — Documentación

**Responsable:** David  
**Rama:** `feature/modulo-disponibilidad`  
**Archivos:** `src/controllers/disponibilidadController.js`, `src/routes/disponibilidad.js`

---

## Descripción general

El módulo de disponibilidad permite consultar si un espacio institucional está libre en un momento dado. Expone dos endpoints: uno para ver todos los bloques ocupados de un espacio en una fecha concreta, y otro para verificar si un rango de horas específico presenta conflicto con reservaciones activas u horarios bloqueados.

Internamente, ambos endpoints usan el operador `OVERLAPS` de PostgreSQL para detectar solapamientos de forma precisa contra las tablas `reservaciones` y `horarios_bloqueados`.

Todos los endpoints requieren autenticación JWT.

---

## Base URL

```
http://localhost:3000/api/disponibilidad
```

---

## Autenticación

Todos los endpoints requieren el header:

```
Authorization: Bearer <token>
```

El token se obtiene haciendo `POST /api/auth/login`. Si se omite o es inválido, el servidor responde `401 Unauthorized`.

---

## Endpoints

---

### 1. GET `/:espacioId?fecha=YYYY-MM-DD`

Devuelve todos los bloques ocupados de un espacio en una fecha completa (00:00 – 23:59). Incluye tanto reservaciones activas como horarios bloqueados administrativamente.

#### Parámetros

| Tipo | Nombre | Requerido | Descripción |
|------|--------|-----------|-------------|
| Path param | `espacioId` | Sí | ID numérico del espacio a consultar |
| Query param | `fecha` | Sí | Fecha a consultar en formato `YYYY-MM-DD` |

#### Ejemplo de request

```
GET /api/disponibilidad/1?fecha=2026-05-10
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

#### Response exitoso — espacio libre `200 OK`

```json
{
  "espacio": {
    "id": 1,
    "nombre": "Aula 101",
    "estado": "disponible"
  },
  "fecha": "2026-05-10",
  "ocupado": false,
  "reservaciones": [],
  "bloqueados": []
}
```

#### Response exitoso — espacio con reservaciones `200 OK`

```json
{
  "espacio": {
    "id": 1,
    "nombre": "Aula 101",
    "estado": "disponible"
  },
  "fecha": "2026-05-10",
  "ocupado": true,
  "reservaciones": [
    {
      "id": 3,
      "fecha_inicio": "2026-05-10T09:00:00.000Z",
      "fecha_fin": "2026-05-10T11:00:00.000Z",
      "estado": "confirmada",
      "motivo": "Clase de Redes",
      "reservado_por": "Juan Pérez García"
    }
  ],
  "bloqueados": []
}
```

#### Responses de error

| Código | Motivo | Cuerpo |
|--------|--------|--------|
| `400` | Falta el parámetro `fecha` | `{ "error": "El parámetro fecha es requerido (formato YYYY-MM-DD)" }` |
| `400` | Formato de fecha incorrecto | `{ "error": "Formato de fecha inválido, usa YYYY-MM-DD" }` |
| `401` | Token ausente | `{ "error": "Token de acceso requerido" }` |
| `403` | Token inválido o expirado | `{ "error": "Token inválido o expirado" }` |
| `404` | Espacio no encontrado | `{ "error": "Espacio no encontrado" }` |

---

### 2. POST `/verificar`

Verifica si un espacio está disponible en un rango de fecha y hora exacto. Es el endpoint principal que usa el frontend antes de crear una reservación.

#### Parámetros

El cuerpo debe enviarse como JSON con `Content-Type: application/json`.

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `espacioId` | integer | Sí | ID del espacio a verificar |
| `fecha_inicio` | string ISO 8601 | Sí | Inicio del rango: `YYYY-MM-DDTHH:MM:SS` |
| `fecha_fin` | string ISO 8601 | Sí | Fin del rango: `YYYY-MM-DDTHH:MM:SS` |

#### Ejemplo de request

```
POST /api/disponibilidad/verificar
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "espacioId": 1,
  "fecha_inicio": "2026-05-10T08:00:00",
  "fecha_fin": "2026-05-10T10:00:00"
}
```

#### Response — disponible `200 OK`

```json
{
  "disponible": true
}
```

#### Response — no disponible por reservación `200 OK`

```json
{
  "disponible": false,
  "conflictos": {
    "reservaciones": [
      {
        "id": 3,
        "fecha_inicio": "2026-05-10T09:00:00.000Z",
        "fecha_fin": "2026-05-10T11:00:00.000Z",
        "estado": "confirmada",
        "reservado_por": "Juan Pérez García"
      }
    ],
    "bloqueados": []
  }
}
```

#### Response — no disponible por estado del espacio `200 OK`

```json
{
  "disponible": false,
  "razon": "El espacio está en estado \"mantenimiento\""
}
```

#### Responses de error

| Código | Motivo | Cuerpo |
|--------|--------|--------|
| `400` | Faltan campos en el body | `{ "error": "espacioId, fecha_inicio y fecha_fin son requeridos" }` |
| `400` | `fecha_inicio >= fecha_fin` | `{ "error": "fecha_inicio debe ser anterior a fecha_fin" }` |
| `401` | Token ausente | `{ "error": "Token de acceso requerido" }` |
| `403` | Token inválido o expirado | `{ "error": "Token inválido o expirado" }` |
| `404` | Espacio no encontrado | `{ "error": "Espacio no encontrado" }` |

---

## Notas de implementación

- **`OVERLAPS`** — Se usa el operador nativo de PostgreSQL `(fecha_inicio, fecha_fin) OVERLAPS ($1, $2)` en lugar de comparaciones manuales. Cubre todos los casos de solapamiento: reservación contenida, que envuelve al rango, que empieza antes y termina dentro, etc.
- **Estados excluidos** — Solo se consideran conflicto las reservaciones con estado distinto de `'cancelada'`. Las canceladas no bloquean el espacio.
- **Orden de rutas** — En el router, `/espacios` y `/verificar` se declaran antes de `/:espacioId` para evitar que Express los interprete como un parámetro dinámico.
- **Día completo** — El endpoint GET construye el rango `00:00:00 – 23:59:59` de la fecha recibida para cubrir todos los bloques del día.

---

## Evidencias de pruebas

### GET /:espacioId?fecha=YYYY-MM-DD — respuesta 200 con espacio libre

Request a `GET /api/disponibilidad/1?fecha=2026-05-10` con token válido. El servidor responde en 39 ms con `ocupado: false` y arrays vacíos de reservaciones y bloqueos.

![GET disponibilidad por fecha — 200 OK](screenshots/disponibilidad-get-exitoso.png)

---

### POST /verificar — espacio disponible en el rango solicitado

Request a `POST /api/disponibilidad/verificar` con body `{ "espacioId": 1, "fecha_inicio": "2026-05-10T08:00:00", "fecha_fin": "2026-05-10T10:00:00" }`. El servidor responde en 24 ms con `{ "disponible": true }`.

![POST verificar — disponible: true](screenshots/disponibilidad-post-verificar.png)

---

### POST /verificar — error 400 por body incompleto

Request a `POST /api/disponibilidad/verificar` sin enviar los campos requeridos en el body. El servidor responde `400 Bad Request` con el mensaje `"espacioId, fecha_inicio y fecha_fin son requeridos"`. Si en cambio se omite el token JWT, el servidor responde `401 Unauthorized` con `"Token de acceso requerido"`.

![POST verificar — 400 campos faltantes](screenshots/disponibilidad-error-sin-token.png)
