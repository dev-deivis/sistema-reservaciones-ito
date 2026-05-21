-- Crear base de datos (ejecutar como superusuario si no existe)
-- CREATE DATABASE reservaciones_ito;

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  rol VARCHAR(20) NOT NULL DEFAULT 'usuario' CHECK (rol IN ('admin', 'usuario')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de tipos de espacio
CREATE TABLE IF NOT EXISTS tipo_espacio (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(80) NOT NULL,
  descripcion TEXT
);

-- Tabla de espacios
CREATE TABLE IF NOT EXISTS espacios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  capacidad INTEGER NOT NULL,
  ubicacion VARCHAR(200),
  estado VARCHAR(20) NOT NULL DEFAULT 'disponible' CHECK (estado IN ('disponible', 'mantenimiento', 'inactivo')),
  tipo_espacio_id INTEGER REFERENCES tipo_espacio(id) ON DELETE SET NULL
);

-- Tabla de recursos por espacio
CREATE TABLE IF NOT EXISTS recursos (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  espacio_id INTEGER REFERENCES espacios(id) ON DELETE CASCADE
);

-- Tabla de reservaciones
CREATE TABLE IF NOT EXISTS reservaciones (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  espacio_id INTEGER NOT NULL REFERENCES espacios(id) ON DELETE CASCADE,
  fecha_inicio TIMESTAMP NOT NULL,
  fecha_fin TIMESTAMP NOT NULL,
  estado VARCHAR(20) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'confirmada', 'cancelada', 'completada')),
  motivo TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fechas_validas CHECK (fecha_fin > fecha_inicio)
);

-- Tabla de horarios bloqueados
CREATE TABLE IF NOT EXISTS horarios_bloqueados (
  id SERIAL PRIMARY KEY,
  espacio_id INTEGER NOT NULL REFERENCES espacios(id) ON DELETE CASCADE,
  fecha_inicio TIMESTAMP NOT NULL,
  fecha_fin TIMESTAMP NOT NULL,
  razon TEXT,
  CONSTRAINT fechas_bloqueo_validas CHECK (fecha_fin > fecha_inicio)
);

-- Tabla de notificaciones
CREATE TABLE IF NOT EXISTS notificaciones (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  reservacion_id INTEGER REFERENCES reservaciones(id) ON DELETE SET NULL,
  tipo VARCHAR(50) NOT NULL,
  mensaje TEXT NOT NULL,
  leida BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de historial de cambios
CREATE TABLE IF NOT EXISTS historial_cambios (
  id SERIAL PRIMARY KEY,
  reservacion_id INTEGER REFERENCES reservaciones(id) ON DELETE SET NULL,
  usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
  accion VARCHAR(50) NOT NULL,
  detalle TEXT,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para rendimiento
CREATE INDEX IF NOT EXISTS idx_reservaciones_espacio ON reservaciones(espacio_id);
CREATE INDEX IF NOT EXISTS idx_reservaciones_usuario ON reservaciones(usuario_id);
CREATE INDEX IF NOT EXISTS idx_reservaciones_fechas ON reservaciones(fecha_inicio, fecha_fin);
CREATE INDEX IF NOT EXISTS idx_notificaciones_usuario ON notificaciones(usuario_id);

-- Migraciones aplicadas al schema inicial
-- 001_add_activo_usuarios
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT true;

-- 002_add_tipo_usuarios
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS tipo VARCHAR(20) DEFAULT 'estudiante';
