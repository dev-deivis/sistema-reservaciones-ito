# Módulo de Reservaciones

## Flujo Completo

```mermaid
graph TD
    A[Usuario solicita Crear Reservación] --> B{Validar Disponibilidad}
    B -- Conflicto (Reservación/Bloqueo) --> C[Rechazar con 409 Conflict]
    B -- Disponible --> D[Confirmar Reservación]
    D --> E[Insertar en Historial de Cambios]
    D --> F[Crear Notificación para el Usuario]
    E --> G[Retornar Reservación 201 Created]
    F --> G
```

1. **Crear**: El usuario envía los datos para una nueva reservación.
2. **Validar Disponibilidad**: El sistema verifica que no existan conflictos con otras reservaciones (no canceladas) ni horarios bloqueados para el espacio solicitado.
3. **Confirmar**: Se crea la reservación con estado 'pendiente'.
4. **Historial**: Se inserta un registro en el historial de cambios indicando la creación.
5. **Notificación**: Se genera una notificación para el usuario confirmando la creación.

## Restricciones de horario

Las siguientes reglas se validan tanto en el backend (400 Bad Request) como en el frontend antes de enviar la petición.

| # | Regla | Error devuelto |
|---|-------|----------------|
| 1 | **Día de la semana** — Solo lunes a viernes (`getDay()` ≠ 0 ni 6) | `"Solo se pueden hacer reservaciones de lunes a viernes"` |
| 2 | **Hora de inicio** — Entre las 7:00 y las 19:59 (`getHours()` ≥ 7 y < 20) | `"Las reservaciones solo pueden ser entre 7:00 AM y 8:00 PM"` |
| 3 | **Hora de fin** — No después de las 20:00 (`getHours()` ≤ 20) | `"La reservación no puede terminar después de las 8:00 PM"` |
| 4 | **Duración mínima** — Al menos 30 minutos de diferencia entre inicio y fin | `"La reservación debe tener una duración mínima de 30 minutos"` |
| 5 | **Duración máxima** — No más de 480 minutos (8 horas) | `"La reservación no puede durar más de 8 horas"` |

Estas validaciones se aplican al **crear** (`POST /api/reservaciones`) y al **modificar** (`PUT /api/reservaciones/:id`) una reservación, y se ejecutan antes de consultar disponibilidad en la base de datos.

## Endpoints

### 1. Obtener todas las reservaciones (Admin)
`GET /api/reservaciones`

**Request:**
- Headers: `Authorization: Bearer <token>` (Rol requerido: admin)

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "usuario_id": 2,
    "espacio_id": 1,
    "fecha_inicio": "2026-06-01T10:00:00.000Z",
    "fecha_fin": "2026-06-01T12:00:00.000Z",
    "estado": "pendiente",
    "motivo": "Reunión de equipo",
    "created_at": "2026-05-05T10:00:00.000Z",
    "usuario_nombre": "Juan Pérez",
    "espacio_nombre": "Sala de Juntas A"
  }
]
```

### 2. Obtener mis reservaciones
`GET /api/reservaciones/mis-reservaciones`

**Request:**
- Headers: `Authorization: Bearer <token>`

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "usuario_id": 2,
    "espacio_id": 1,
    "fecha_inicio": "2026-06-01T10:00:00.000Z",
    "fecha_fin": "2026-06-01T12:00:00.000Z",
    "estado": "pendiente",
    "motivo": "Reunión de equipo",
    "created_at": "2026-05-05T10:00:00.000Z",
    "usuario_nombre": "Juan Pérez",
    "espacio_nombre": "Sala de Juntas A"
  }
]
```

### 3. Obtener detalle de reservación
`GET /api/reservaciones/:id`

**Request:**
- Headers: `Authorization: Bearer <token>` (Debe ser el dueño o admin)

**Response (200 OK):**
```json
{
  "id": 1,
  "usuario_id": 2,
  "espacio_id": 1,
  "fecha_inicio": "2026-06-01T10:00:00.000Z",
  "fecha_fin": "2026-06-01T12:00:00.000Z",
  "estado": "pendiente",
  "motivo": "Reunión de equipo",
  "created_at": "2026-05-05T10:00:00.000Z",
  "usuario_nombre": "Juan Pérez",
  "espacio_nombre": "Sala de Juntas A"
}
```

### 4. Crear Reservación
`POST /api/reservaciones`

**Request:**
- Headers: `Authorization: Bearer <token>`
- Body:
```json
{
  "espacio_id": 1,
  "fecha_inicio": "2026-06-01T10:00:00",
  "fecha_fin": "2026-06-01T12:00:00",
  "motivo": "Reunión de equipo"
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "usuario_id": 2,
  "espacio_id": 1,
  "fecha_inicio": "2026-06-01T10:00:00.000Z",
  "fecha_fin": "2026-06-01T12:00:00.000Z",
  "estado": "pendiente",
  "motivo": "Reunión de equipo",
  "created_at": "2026-05-05T10:00:00.000Z"
}
```

### 5. Modificar Reservación
`PUT /api/reservaciones/:id`

**Request:**
- Headers: `Authorization: Bearer <token>` (Debe ser el dueño o admin)
- Body:
```json
{
  "fecha_inicio": "2026-06-01T11:00:00",
  "fecha_fin": "2026-06-01T13:00:00",
  "motivo": "Cambio de hora"
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "usuario_id": 2,
  "espacio_id": 1,
  "fecha_inicio": "2026-06-01T11:00:00.000Z",
  "fecha_fin": "2026-06-01T13:00:00.000Z",
  "estado": "pendiente",
  "motivo": "Cambio de hora",
  "created_at": "2026-05-05T10:00:00.000Z"
}
```

### 6. Cancelar Reservación
`PATCH /api/reservaciones/:id/cancelar`

**Request:**
- Headers: `Authorization: Bearer <token>` (Debe ser el dueño o admin)

**Response (200 OK):**
```json
{
  "id": 1,
  "usuario_id": 2,
  "espacio_id": 1,
  "fecha_inicio": "2026-06-01T10:00:00.000Z",
  "fecha_fin": "2026-06-01T12:00:00.000Z",
  "estado": "cancelada",
  "motivo": "Reunión de equipo",
  "created_at": "2026-05-05T10:00:00.000Z"
}
```
