# Resumen Técnico — Sistema de Reservaciones ITO

**Materia:** Desarrollo de Servicios Web — 8vo Semestre  
**Instituto Tecnológico de Oaxaca**  
**Equipo:** David, Diego, Alex, Karla, Cheluis, Heber, Isaac

---

## 1. Descripción general del sistema

El sistema permite a estudiantes y docentes del ITO reservar espacios institucionales (laboratorios, aulas especiales, salas de juntas) de forma centralizada y en tiempo real. Reemplaza el proceso manual (correo, papel) con una plataforma web que valida disponibilidad, evita conflictos de horario y mantiene un historial de uso.

### Tecnologías utilizadas

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Backend | Node.js + Express | 18+ / 4.x |
| Autenticación | JSON Web Tokens (JWT) | — |
| Cifrado de contraseñas | bcryptjs | — |
| Frontend | React + Vite | 18 / 5 |
| Cliente HTTP | Axios | — |
| Enrutamiento frontend | React Router DOM | v6 |
| Base de datos | PostgreSQL | 16 |

### Puertos

| Servicio | Puerto | URL local |
|---------|--------|-----------|
| Backend (API) | 3000 | `http://localhost:3000` |
| Frontend | 5173 | `http://localhost:5173` |

> Vite redirige automáticamente las llamadas a `/api` del frontend hacia el backend en el puerto 3000. No se necesita configurar CORS manualmente en desarrollo.

---

## 2. Cómo levantar el proyecto

### Requisitos previos

- Node.js 18+
- PostgreSQL 16 corriendo (local o en Docker)
- Base de datos `reservaciones_ito` creada e inicializada

### Inicializar la base de datos (solo la primera vez)

```bash
# Opción A: PostgreSQL local
psql -U postgres -c "CREATE DATABASE reservaciones_ito;"
psql -U postgres -d reservaciones_ito -f database/init.sql
psql -U postgres -d reservaciones_ito -f database/seeds.sql

# Opción B: Docker
docker exec -it postgres psql -U admin -c "CREATE DATABASE reservaciones_ito;"
docker cp database/init.sql postgres:/init.sql
docker cp database/seeds.sql postgres:/seeds.sql
docker exec -it postgres psql -U admin -d reservaciones_ito -f /init.sql
docker exec -it postgres psql -U admin -d reservaciones_ito -f /seeds.sql
```

### Levantar el backend

```bash
cd backend
npm install
npm run dev
# Servidor corriendo en http://localhost:3000
# Verificar: GET http://localhost:3000/api/health
```

### Levantar el frontend

```bash
cd frontend
npm install
npm run dev
# App disponible en http://localhost:5173
```

> Abrir dos terminales simultáneas: una para backend y otra para frontend.

### Credenciales de prueba

| Usuario | Email | Contraseña | Rol |
|---------|-------|-----------|-----|
| Administrador ITO | `admin@ito.mx` | `password` | admin |
| Juan Pérez García | `juan@ito.mx` | `password` | usuario |

El rol `admin` puede crear, editar y eliminar espacios, y ver todas las reservaciones del sistema. El rol `usuario` solo puede hacer y cancelar sus propias reservaciones.

---

## 3. Arquitectura del sistema

### Diagrama de capas

```
┌─────────────────────────────────────────────┐
│              NAVEGADOR (puerto 5173)         │
│         React + Vite + React Router          │
│   Login │ Dashboard │ Espacios │ Reservaciones│
└─────────────────┬───────────────────────────┘
                  │  HTTP + JSON (Axios)
                  │  Authorization: Bearer <token>
                  ▼
┌─────────────────────────────────────────────┐
│              BACKEND (puerto 3000)           │
│                Node.js + Express             │
│                                             │
│  ┌──────────┐  ┌─────────┐  ┌────────────┐ │
│  │  routes/ │  │  middle │  │ controllers│ │
│  │  (API)   │→ │  ware   │→ │ (lógica)   │ │
│  └──────────┘  └─────────┘  └─────┬──────┘ │
│                                   │        │
│                             ┌─────▼──────┐ │
│                             │  models/db │ │
│                             │  (pg pool) │ │
│                             └─────┬──────┘ │
└───────────────────────────────────┼────────┘
                                    │  SQL
                                    ▼
┌─────────────────────────────────────────────┐
│            PostgreSQL (puerto 5432)          │
│  usuarios │ espacios │ reservaciones │ ...   │
└─────────────────────────────────────────────┘
```

### Arquitectura REST modular por capas

El backend está organizado en **4 capas independientes** por módulo:

| Capa | Carpeta | Responsabilidad |
|------|---------|----------------|
| **Rutas (API)** | `src/routes/` | Define las URLs y aplica middleware de autenticación |
| **Lógica de negocio** | `src/controllers/` | Valida datos, orquesta operaciones, responde JSON |
| **Acceso a datos** | `src/models/db.js` | Pool de conexiones a PostgreSQL (pg) |
| **Base de datos** | PostgreSQL | Persiste datos, aplica constraints e índices |

Cada módulo (auth, espacios, reservaciones, disponibilidad, notificaciones) tiene su propio archivo en `routes/` y en `controllers/`. Los módulos se comunican entre sí internamente: por ejemplo, el controller de reservaciones reutiliza la misma lógica de validación del controller de disponibilidad antes de confirmar una reserva.

---

## 4. Módulos implementados

### Auth — `/api/auth`

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/login` | Inicia sesión, devuelve token JWT | No |
| POST | `/api/auth/registro` | Registra un nuevo usuario con rol `usuario` | No |

**Respuesta de login:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": { "id": 2, "nombre": "Juan Pérez García", "rol": "usuario" }
}
```

---

### Espacios — `/api/espacios`

| Método | Endpoint | Descripción | Rol mínimo |
|--------|----------|-------------|-----------|
| GET | `/api/espacios` | Lista todos los espacios con tipo | usuario |
| GET | `/api/espacios/:id` | Detalle de un espacio | usuario |
| GET | `/api/espacios/:id/recursos` | Recursos del espacio (proyector, etc.) | usuario |
| POST | `/api/espacios` | Crea un espacio | **admin** |
| PUT | `/api/espacios/:id` | Actualiza un espacio | **admin** |
| DELETE | `/api/espacios/:id` | Elimina un espacio (falla si tiene reservas activas) | **admin** |

---

### Reservaciones — `/api/reservaciones`

| Método | Endpoint | Descripción | Rol mínimo |
|--------|----------|-------------|-----------|
| GET | `/api/reservaciones` | Lista **todas** las reservaciones | **admin** |
| GET | `/api/reservaciones/mis-reservaciones` | Lista solo las del usuario autenticado | usuario |
| GET | `/api/reservaciones/:id` | Detalle (solo dueño o admin) | usuario |
| POST | `/api/reservaciones` | Crea reservación (valida conflictos automáticamente) | usuario |
| PUT | `/api/reservaciones/:id` | Modifica fechas o motivo (re-valida disponibilidad) | usuario |
| PATCH | `/api/reservaciones/:id/cancelar` | Cancela una reservación | usuario |

Al crear o cancelar una reservación el sistema registra automáticamente:
- Un registro en `historial_cambios` con la acción realizada.
- Una notificación en `notificaciones` para el usuario.

---

### Disponibilidad — `/api/disponibilidad`

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/disponibilidad/:espacioId?fecha=YYYY-MM-DD` | Bloques ocupados de un espacio en una fecha | sí |
| POST | `/api/disponibilidad/verificar` | Verifica si un espacio está libre en un rango exacto | sí |
| GET | `/api/disponibilidad/espacios?fecha_inicio=&fecha_fin=` | Disponibilidad de todos los espacios en un rango | sí |

**Body para verificar:**
```json
{ "espacioId": 1, "fecha_inicio": "2026-05-20T10:00:00", "fecha_fin": "2026-05-20T12:00:00" }
```

**Respuesta — disponible:**
```json
{ "disponible": true }
```

**Respuesta — ocupado:**
```json
{
  "disponible": false,
  "conflictos": {
    "reservaciones": [{ "id": 3, "fecha_inicio": "...", "fecha_fin": "..." }],
    "bloqueados": []
  }
}
```

---

### Notificaciones — `/api/notificaciones`

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/notificaciones` | Lista todas las notificaciones del usuario | sí |
| GET | `/api/notificaciones/no-leidas` | Solo las no leídas (para el badge del navbar) | sí |
| PATCH | `/api/notificaciones/:id/leer` | Marca una notificación como leída | sí |
| PATCH | `/api/notificaciones/leer-todas` | Marca todas como leídas | sí |

---

## 5. Roles y permisos

### Tabla de acceso por rol

| Funcionalidad | admin | usuario |
|--------------|:-----:|:-------:|
| Ver todos los espacios | ✅ | ✅ |
| Crear / editar / eliminar espacios | ✅ | ❌ |
| Ver disponibilidad de espacios | ✅ | ✅ |
| Crear reservación | ✅ | ✅ |
| Ver **todas** las reservaciones | ✅ | ❌ |
| Ver **sus propias** reservaciones | ✅ | ✅ |
| Cancelar cualquier reservación | ✅ | ❌ |
| Cancelar su propia reservación | ✅ | ✅ |
| Modificar reservación | ✅ | solo la propia |
| Ver notificaciones | ✅ | ✅ (solo las propias) |

### Cómo funciona el token JWT

1. El usuario hace `POST /api/auth/login` con email y password.
2. El servidor valida las credenciales con bcrypt, genera un token firmado con `JWT_SECRET` y lo devuelve.
3. El cliente (React + Axios) guarda el token en `localStorage` y lo incluye en **todas** las peticiones siguientes:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

4. El middleware `auth.js` del backend verifica la firma del token en cada request protegido. Si el token es inválido o expiró, responde `401` y el frontend redirige al login.
5. El middleware `authAdmin` hace lo mismo pero además verifica que `req.usuario.rol === 'admin'`. Si no, responde `403`.

---

## 6. Base de datos

Se usa **PostgreSQL 16** (no MySQL ni MongoDB). La justificación técnica está en la sección de preguntas frecuentes.

### Las 8 tablas del sistema

| Tabla | Descripción |
|-------|-------------|
| `usuarios` | Almacena nombre, email, hash de contraseña y rol (`admin` / `usuario`) |
| `tipo_espacio` | Catálogo de tipos: laboratorio, sala de juntas, aula especial, etc. |
| `espacios` | Espacios reservables con nombre, capacidad, ubicación y estado |
| `recursos` | Equipamiento de cada espacio (proyector, cómputo, etc.), relación N→1 con espacios |
| `reservaciones` | Registro de cada reserva: quién, qué espacio, cuándo, estado y motivo |
| `horarios_bloqueados` | Períodos en que un espacio no puede reservarse (mantenimiento, eventos fijos) |
| `notificaciones` | Avisos automáticos de confirmación y cancelación para cada usuario |
| `historial_cambios` | Auditoría de todas las acciones sobre reservaciones (creación, modificación, cancelación) |

### Relaciones principales

```
usuarios ──< reservaciones >── espacios
usuarios ──< notificaciones
reservaciones ──< historial_cambios
espacios ──< recursos
espacios ──< horarios_bloqueados
espacios >── tipo_espacio
```

### Validaciones en la base de datos

- `CHECK (fecha_fin > fecha_inicio)` en reservaciones y horarios_bloqueados.
- `CHECK (rol IN ('admin', 'usuario'))` en usuarios.
- `CHECK (estado IN ('pendiente', 'confirmada', 'cancelada', 'completada'))` en reservaciones.
- Índices en `reservaciones(espacio_id)`, `reservaciones(usuario_id)`, `reservaciones(fecha_inicio, fecha_fin)` y `notificaciones(usuario_id)` para rendimiento en las consultas de disponibilidad.

---

## 7. Metodología

### Kanban con GitHub Projects

El equipo usa **Kanban** con 4 columnas en GitHub Projects:

```
TODO  ──►  IN PROGRESS  ──►  IN REVIEW  ──►  DONE
```

| Columna | Significado |
|---------|-------------|
| **Todo** | Tarea pendiente de iniciar |
| **In Progress** | El integrante está desarrollando en su rama `feature/` |
| **In Review** | PR abierto, esperando revisión de David |
| **Done** | PR mergeado a `main` |

### Flujo de trabajo con Git

```bash
# 1. Crear rama desde main actualizado
git checkout main && git pull origin main
git checkout -b feature/mi-modulo

# 2. Desarrollar y hacer commits frecuentes
git add archivo.js
git commit -m "agrega validación de fechas en reservaciones"

# 3. Subir rama y abrir Pull Request
git push origin feature/mi-modulo
# → Abrir PR en GitHub: base: main ← compare: feature/mi-modulo

# 4. David revisa, aprueba y hace merge a main

# 5. Todos jalamos los cambios
git fetch origin && git merge origin/main
```

**Regla:** nunca hacer push directo a `main`. Todo entra por Pull Request.

---

## 8. Lo que falta por implementar

| Pendiente | Prioridad | Responsable |
|-----------|-----------|------------|
| Integración con servicio externo / sistema de tickets (requisito obligatorio del doc) | 🔴 Alta | Por definir |
| `POSTMAN_COLLECTION.json` exportado en la raíz del proyecto | 🔴 Alta | Karla |
| `DOCUMENTACION.md` consolidado (entregable final) | 🟡 Media | Karla |
| Capturas `.png` del frontend en `docs/screenshots/reservaciones/` | 🟡 Media | Cheluis |

> El punto más crítico es la integración con servicio externo. El documento del profesor lo lista como **requisito técnico obligatorio** bajo "Consumo de servicios → Integración con sistema de tickets → Uso de endpoints o webhooks". Actualmente no existe ninguna llamada a API externa en el proyecto.

---

## 9. Preguntas frecuentes del profesor

### ¿Por qué usaron PostgreSQL y no MySQL o MongoDB?

El documento sugería MySQL o MongoDB, pero elegimos PostgreSQL porque tiene el operador `OVERLAPS` que detecta solapamientos de horario de forma nativa y precisa en una sola query SQL:

```sql
SELECT id FROM reservaciones
WHERE espacio_id = $1
  AND estado NOT IN ('cancelada')
  AND (fecha_inicio, fecha_fin) OVERLAPS ($2::timestamp, $3::timestamp)
```

Con MySQL habría que hacer comparaciones manuales de rangos (`fecha_inicio < fin_solicitado AND fecha_fin > inicio_solicitado`), que son más propensas a errores. PostgreSQL es también más estricto con tipos y constraints, lo que mejora la integridad de los datos.

---

### ¿Qué arquitectura usan?

**REST modular por capas.** El sistema no es un monolito: cada módulo (espacios, reservaciones, disponibilidad, notificaciones) tiene su propio archivo de rutas y su propio controller con lógica independiente. La comunicación entre módulos ocurre internamente a nivel de código (no hay microservicios separados por red), pero la separación de responsabilidades es clara.

La arquitectura tiene 4 capas:
1. **Rutas** — definen URLs y aplican middleware de auth.
2. **Controllers** — contienen toda la lógica de negocio.
3. **Acceso a datos** — el pool de pg ejecuta las queries SQL.
4. **Base de datos** — PostgreSQL persiste y valida los datos.

---

### ¿Cómo evitan conflictos de horario?

En dos niveles:

**Nivel base de datos** — al crear o modificar una reservación, el controller ejecuta esta query antes de insertar:

```sql
SELECT id FROM reservaciones
WHERE espacio_id = $1
  AND estado NOT IN ('cancelada')
  AND (fecha_inicio, fecha_fin) OVERLAPS ($2::timestamp, $3::timestamp)
```

Si devuelve algún resultado, el servidor responde `409 Conflict` y no guarda la reservación.

**Nivel disponibilidad** — el endpoint `POST /api/disponibilidad/verificar` permite al frontend consultar disponibilidad antes incluso de intentar crear la reserva, mostrando al usuario un mensaje verde o rojo en tiempo real.

---

### ¿Cómo funciona la autenticación?

1. El usuario envía email y contraseña a `POST /api/auth/login`.
2. El servidor busca al usuario en la base de datos y compara la contraseña con el hash guardado usando **bcrypt**.
3. Si coincide, genera un **token JWT** firmado con la clave secreta `JWT_SECRET`. El token contiene `{ id, email, rol }` del usuario y expira en 24 horas.
4. El frontend guarda el token en `localStorage` y lo envía en cada petición:
   ```
   Authorization: Bearer <token>
   ```
5. El middleware `auth.js` verifica la firma del token en cada request. Si es válido, extrae los datos del usuario y los pone en `req.usuario` para que el controller los use.
6. Si el token expiró o es inválido, el interceptor de Axios detecta el `401` y redirige al login automáticamente.

---

### ¿Cómo se comunican los módulos entre sí?

A través de llamadas internas entre controllers. Por ejemplo, cuando se crea una reservación:

```
POST /api/reservaciones
        ↓
reservacionesController.crearReservacion()
        ↓ (query SQL de verificación de conflictos — misma lógica que disponibilidad)
        ↓ si hay conflicto → 409
        ↓ si está libre → INSERT en reservaciones
        ↓ INSERT en historial_cambios (accion: 'creacion')
        ↓ INSERT en notificaciones (tipo: 'confirmacion')
        ↓ 201 Created con los datos de la reservación
```

No se hacen llamadas HTTP internas entre módulos (no son microservicios independientes); la lógica se reutiliza directamente en el mismo proceso de Node.js.

---

*Documento generado para el equipo de Desarrollo de Servicios Web — 8vo Semestre, ITO. Mayo 2026.*
