# Sistema de Reservaciones ITO

Sistema fullstack para la gestión de reservaciones de espacios institucionales en el Instituto Tecnológico de Oaxaca. Permite a estudiantes y docentes reservar aulas, laboratorios y auditorios, con validación de disponibilidad en tiempo real, notificaciones y control de acceso por roles.

---

## Tecnologías utilizadas

| Capa | Tecnología |
|------|-----------|
| Backend | Node.js 18+, Express 4 |
| Base de datos | PostgreSQL 16 |
| Autenticación | JSON Web Tokens (JWT) |
| Cifrado | bcryptjs |
| Frontend | React 18, Vite 5 |
| HTTP client | Axios |
| Enrutamiento | React Router DOM v6 |

---

## Requisitos previos

- **Node.js 18+** — [descargar](https://nodejs.org)
- **npm** (incluido con Node.js)
- **PostgreSQL** — una de las dos opciones:
  - Variante A: PostgreSQL instalado localmente
  - Variante B: Docker con contenedor PostgreSQL (configuración del equipo)

---

## Instalación

### Paso 1 — Clonar el repositorio

```bash
git clone <url-del-repo>
cd reservaciones-ito
```

### Paso 2 — Configurar la base de datos

Elige la variante según tu entorno.

---

#### Variante A: PostgreSQL local

Asegúrate de que el servicio de PostgreSQL esté corriendo y de conocer tu usuario y contraseña.

```bash
# Crear la base de datos
psql -U postgres -c "CREATE DATABASE reservaciones_ito;"

# Crear las tablas
psql -U postgres -d reservaciones_ito -f database/init.sql

# Cargar datos de prueba
psql -U postgres -d reservaciones_ito -f database/seeds.sql
```

Configura el `.env` del backend con tus credenciales locales (ver [Paso 3](#paso-3--configurar-el-env-del-backend)).

---

#### Variante B: PostgreSQL en Docker (configuración del equipo)

El contenedor ya debe estar corriendo. Si no lo está, levántalo primero:

```bash
docker run -d \
  --name postgres \
  -e POSTGRES_USER=admin \
  -e POSTGRES_PASSWORD=admin123 \
  -e POSTGRES_DB=postgres \
  -p 5432:5432 \
  postgres:16
```

Si el contenedor ya existe pero está detenido:

```bash
docker start postgres
```

Verificar que esté activo:

```bash
docker ps | grep postgres
```

Crear la base de datos y ejecutar los scripts desde el host:

```bash
# Crear la base de datos
docker exec -it postgres psql -U admin -c "CREATE DATABASE reservaciones_ito;"

# Copiar los scripts al contenedor
docker cp database/init.sql postgres:/init.sql
docker cp database/seeds.sql postgres:/seeds.sql

# Ejecutar el schema
docker exec -it postgres psql -U admin -d reservaciones_ito -f /init.sql

# Cargar datos de prueba
docker exec -it postgres psql -U admin -d reservaciones_ito -f /seeds.sql
```

---

### Paso 3 — Configurar el `.env` del backend

```bash
cd backend
cp .env.example .env
```

Edita el archivo `.env` con los valores correspondientes a tu variante:

```env
# Puerto en el que corre el servidor Express
PORT=3000

# Conexión a PostgreSQL
DB_HOST=localhost        # siempre localhost, el puerto 5432 está expuesto al host
DB_PORT=5432
DB_NAME=reservaciones_ito

# Variante A (PostgreSQL local)
DB_USER=postgres
DB_PASSWORD=tu_password_local

# Variante B (Docker del equipo)
DB_USER=admin
DB_PASSWORD=admin123

# Clave secreta para firmar los tokens JWT — cámbiala por una cadena larga y aleatoria
JWT_SECRET=cambia_esto_por_algo_muy_secreto_y_largo
JWT_EXPIRES_IN=24h
```

> Solo descomenta/activa los valores de la variante que uses. Los demás puedes dejarlos comentados.

---

### Paso 4 — Instalar dependencias y levantar el sistema

Abre **dos terminales** de forma simultánea.

**Terminal 1 — Backend:**

```bash
cd backend
npm install
npm run dev
```

El servidor quedará disponible en `http://localhost:3000`.  
Puedes verificarlo en `http://localhost:3000/api/health`.

**Terminal 2 — Frontend:**

```bash
cd frontend
npm install
npm run dev
```

La aplicación web quedará disponible en `http://localhost:5173`.  
Vite redirige automáticamente las llamadas a `/api` hacia el backend en el puerto 3000.

---

## Credenciales de prueba

| Nombre | Email | Contraseña | Rol |
|--------|-------|-----------|-----|
| Administrador ITO | admin@ito.mx | password | admin |
| Juan Pérez García | juan@ito.mx | password | usuario |

> Los hashes del archivo `seeds.sql` corresponden a la contraseña `password` cifrada con bcrypt (10 rondas). El rol `admin` tiene acceso a crear, editar y eliminar espacios; el rol `usuario` solo puede hacer reservaciones.

---

## Estructura del proyecto

```
reservaciones-ito/
│
├── backend/
│   ├── src/
│   │   ├── controllers/      # Lógica de cada módulo (auth, espacios, reservaciones...)
│   │   ├── routes/           # Definición de rutas REST por módulo
│   │   ├── middleware/        # auth.js (JWT) y errorHandler.js
│   │   ├── models/           # db.js — pool de conexiones a PostgreSQL
│   │   └── services/         # Lógica de negocio reutilizable (vacío por ahora)
│   ├── server.js             # Punto de entrada: Express, CORS, rutas montadas
│   ├── .env.example          # Plantilla de variables de entorno
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js      # Cliente HTTP con interceptors para JWT
│   │   ├── components/
│   │   │   └── Navbar.jsx    # Barra de navegación con logout
│   │   ├── context/
│   │   │   └── AuthContext.jsx  # Estado global de sesión (login/logout)
│   │   └── pages/
│   │       ├── Login.jsx
│   │       ├── Dashboard.jsx
│   │       ├── Espacios.jsx
│   │       ├── Reservaciones.jsx
│   │       ├── NuevaReservacion.jsx
│   │       └── Notificaciones.jsx
│   ├── index.html
│   ├── vite.config.js        # Proxy /api → localhost:3000
│   └── package.json
│
└── database/
    ├── init.sql              # Schema completo: tablas, constraints e índices
    └── seeds.sql             # Datos de prueba: tipos, espacios, usuarios y recursos
```

---

## Endpoints de la API

Todos los endpoints (excepto auth) requieren el header:

```
Authorization: Bearer <token>
```

### Autenticación

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| POST | `/api/auth/login` | Iniciar sesión, devuelve token JWT | No |
| POST | `/api/auth/registro` | Registrar nuevo usuario | No |

### Espacios

| Método | Ruta | Descripción | Rol mínimo |
|--------|------|-------------|-----------|
| GET | `/api/espacios` | Listar todos los espacios | usuario |
| GET | `/api/espacios/:id` | Detalle de un espacio con recursos | usuario |
| POST | `/api/espacios` | Crear espacio | admin |
| PUT | `/api/espacios/:id` | Actualizar espacio | admin |
| DELETE | `/api/espacios/:id` | Eliminar espacio | admin |

### Reservaciones

| Método | Ruta | Descripción | Rol mínimo |
|--------|------|-------------|-----------|
| GET | `/api/reservaciones` | Listar reservaciones (admin ve todas, usuario solo las suyas) | usuario |
| GET | `/api/reservaciones/:id` | Detalle de una reservación | usuario |
| POST | `/api/reservaciones` | Crear reservación (valida conflictos automáticamente) | usuario |
| PUT | `/api/reservaciones/:id` | Modificar fechas o motivo | usuario |
| PATCH | `/api/reservaciones/:id/cancelar` | Cancelar reservación | usuario |

### Disponibilidad

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/disponibilidad/espacio` | Verificar si un espacio está disponible en un rango. Params: `espacio_id`, `fecha_inicio`, `fecha_fin` |
| GET | `/api/disponibilidad/espacios` | Ver disponibilidad de todos los espacios en un rango. Params: `fecha_inicio`, `fecha_fin` |

### Notificaciones

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/notificaciones` | Listar notificaciones del usuario autenticado |
| PATCH | `/api/notificaciones/:id/leer` | Marcar una notificación como leída |
| PATCH | `/api/notificaciones/leer-todas` | Marcar todas las notificaciones como leídas |

---

## Cómo contribuir

1. Asegúrate de estar en `main` y tener la última versión:

   ```bash
   git checkout main
   git pull origin main
   ```

2. Crea una rama con el formato `feature/nombre-modulo`:

   ```bash
   git checkout -b feature/notificaciones-email
   ```

3. Haz commits descriptivos en español:

   ```bash
   git commit -m "agrega envío de correo al confirmar reservación"
   git commit -m "corrige validación de fechas en el controlador de reservaciones"
   ```

4. Sube tu rama y abre un Pull Request hacia `main`:

   ```bash
   git push origin feature/notificaciones-email
   ```

   Desde GitHub/GitLab: **New Pull Request → base: main ← compare: feature/nombre-modulo**

5. Espera revisión de al menos un compañero antes de hacer merge.

> No hacer push directo a `main`. Todos los cambios entran por Pull Request.

---

## Equipo de desarrollo

| Integrante |
|-----------|
| David |
| Diego |
| Alex |
| Karla |
| Cheluis |
| Heber |
| Isaac |

**Materia:** Desarrollo de Servicios Web — 8vo Semestre  
**Instituto Tecnológico de Oaxaca**
