# Documentación de la Base de Datos

Sistema de Reservaciones ITO — PostgreSQL 16

---

## Tablas

### `usuarios`
Almacena los usuarios del sistema (administradores y usuarios regulares).

| Columna | Tipo | Constraints | Descripción |
|---|---|---|---|
| id | SERIAL | PRIMARY KEY | Identificador único |
| nombre | VARCHAR(100) | NOT NULL | Nombre completo |
| email | VARCHAR(150) | UNIQUE, NOT NULL | Correo institucional |
| password_hash | VARCHAR(255) | NOT NULL | Contraseña cifrada con bcrypt |
| rol | VARCHAR(20) | CHECK (admin, usuario) | Rol del usuario en el sistema |
| created_at | TIMESTAMP | DEFAULT NOW() | Fecha de registro |

---

### `tipo_espacio`
Catálogo de tipos de espacios disponibles.

| Columna | Tipo | Constraints | Descripción |
|---|---|---|---|
| id | SERIAL | PRIMARY KEY | Identificador único |
| nombre | VARCHAR(80) | NOT NULL | Nombre del tipo (Aula, Laboratorio, Auditorio) |
| descripcion | TEXT | — | Descripción del tipo de espacio |

---

### `espacios`
Espacios físicos que pueden reservarse.

| Columna | Tipo | Constraints | Descripción |
|---|---|---|---|
| id | SERIAL | PRIMARY KEY | Identificador único |
| nombre | VARCHAR(100) | NOT NULL | Nombre del espacio |
| capacidad | INTEGER | NOT NULL | Número máximo de personas |
| ubicacion | VARCHAR(200) | — | Ubicación dentro del instituto |
| estado | VARCHAR(20) | CHECK (disponible, mantenimiento, inactivo) | Estado actual |
| tipo_espacio_id | INTEGER | FK → tipo_espacio(id) | Tipo de espacio al que pertenece |

---

### `recursos`
Recursos o equipos disponibles dentro de cada espacio.

| Columna | Tipo | Constraints | Descripción |
|---|---|---|---|
| id | SERIAL | PRIMARY KEY | Identificador único |
| nombre | VARCHAR(100) | NOT NULL | Nombre del recurso |
| descripcion | TEXT | — | Descripción detallada |
| espacio_id | INTEGER | FK → espacios(id) ON DELETE CASCADE | Espacio al que pertenece |

---

### `reservaciones`
Reservaciones realizadas por los usuarios sobre los espacios.

| Columna | Tipo | Constraints | Descripción |
|---|---|---|---|
| id | SERIAL | PRIMARY KEY | Identificador único |
| usuario_id | INTEGER | NOT NULL, FK → usuarios(id) | Usuario que reservó |
| espacio_id | INTEGER | NOT NULL, FK → espacios(id) | Espacio reservado |
| fecha_inicio | TIMESTAMP | NOT NULL | Inicio de la reservación |
| fecha_fin | TIMESTAMP | NOT NULL | Fin de la reservación |
| estado | VARCHAR(20) | CHECK (pendiente, confirmada, cancelada, completada) | Estado de la reservación |
| motivo | TEXT | — | Motivo o descripción del uso |
| created_at | TIMESTAMP | DEFAULT NOW() | Fecha de creación del registro |

**Constraint:** `fecha_fin > fecha_inicio` — garantiza que las fechas sean válidas.

---

### `horarios_bloqueados`
Períodos en que un espacio no está disponible por mantenimiento u otros motivos.

| Columna | Tipo | Constraints | Descripción |
|---|---|---|---|
| id | SERIAL | PRIMARY KEY | Identificador único |
| espacio_id | INTEGER | NOT NULL, FK → espacios(id) ON DELETE CASCADE | Espacio bloqueado |
| fecha_inicio | TIMESTAMP | NOT NULL | Inicio del bloqueo |
| fecha_fin | TIMESTAMP | NOT NULL | Fin del bloqueo |
| razon | TEXT | — | Motivo del bloqueo |

**Constraint:** `fecha_fin > fecha_inicio` — garantiza que las fechas sean válidas.

---

### `notificaciones`
Notificaciones enviadas a los usuarios relacionadas con sus reservaciones.

| Columna | Tipo | Constraints | Descripción |
|---|---|---|---|
| id | SERIAL | PRIMARY KEY | Identificador único |
| usuario_id | INTEGER | NOT NULL, FK → usuarios(id) ON DELETE CASCADE | Usuario destinatario |
| reservacion_id | INTEGER | FK → reservaciones(id) ON DELETE SET NULL | Reservación relacionada (opcional) |
| tipo | VARCHAR(50) | NOT NULL | Tipo: confirmacion, cancelacion, pendiente, etc. |
| mensaje | TEXT | NOT NULL | Texto de la notificación |
| leida | BOOLEAN | DEFAULT FALSE | Si el usuario ya la leyó |
| created_at | TIMESTAMP | DEFAULT NOW() | Fecha de creación |

---

### `historial_cambios`
Registro de auditoría de acciones realizadas sobre reservaciones.

| Columna | Tipo | Constraints | Descripción |
|---|---|---|---|
| id | SERIAL | PRIMARY KEY | Identificador único |
| reservacion_id | INTEGER | FK → reservaciones(id) ON DELETE SET NULL | Reservación afectada |
| usuario_id | INTEGER | FK → usuarios(id) ON DELETE SET NULL | Usuario que realizó la acción |
| accion | VARCHAR(50) | NOT NULL | Acción realizada (crear, cancelar, modificar) |
| detalle | TEXT | — | Descripción adicional |
| fecha | TIMESTAMP | DEFAULT NOW() | Fecha y hora de la acción |

---

## Índices

| Índice | Tabla | Columna(s) | Propósito |
|---|---|---|---|
| idx_reservaciones_espacio | reservaciones | espacio_id | Búsqueda rápida por espacio |
| idx_reservaciones_usuario | reservaciones | usuario_id | Búsqueda rápida por usuario |
| idx_reservaciones_fechas | reservaciones | fecha_inicio, fecha_fin | Consultas de disponibilidad por rango de fechas |
| idx_notificaciones_usuario | notificaciones | usuario_id | Listado rápido de notificaciones por usuario |

---

## Relaciones entre tablas

- Un **usuario** puede tener muchas **reservaciones** y muchas **notificaciones**.
- Un **espacio** pertenece a un **tipo_espacio** y puede tener muchos **recursos**.
- Una **reservación** pertenece a un **usuario** y a un **espacio**, y puede generar **notificaciones**.
- Un **espacio** puede tener varios **horarios_bloqueados**.
- El **historial_cambios** registra acciones sobre **reservaciones** hechas por **usuarios**.