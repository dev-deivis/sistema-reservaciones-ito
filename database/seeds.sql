-- Seeds de datos de prueba
-- Las contraseñas están hasheadas con bcrypt (10 rondas)
-- Todas corresponden a la contraseña: password

-- Tipos de espacio
INSERT INTO tipo_espacio (nombre, descripcion) VALUES
  ('Aula', 'Sala de clases estándar con pizarrón y pupitres'),
  ('Laboratorio', 'Laboratorio equipado con computadoras o equipo especializado'),
  ('Auditorio', 'Espacio grande para eventos y presentaciones')
ON CONFLICT DO NOTHING;

-- Usuarios
INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES
  ('Administrador ITO', 'admin@ito.mx', '$2a$10$C433KLZ1DH/30WJ1WWcsKuIlmLi1ICM13FqrMZ0i1FFBYttisdkmm', 'admin'),
  ('Juan Pérez García', 'juan@ito.mx', '$2a$10$C433KLZ1DH/30WJ1WWcsKuIlmLi1ICM13FqrMZ0i1FFBYttisdkmm', 'usuario'),
  ('María López Torres', 'maria@ito.mx', '$2a$10$C433KLZ1DH/30WJ1WWcsKuIlmLi1ICM13FqrMZ0i1FFBYttisdkmm', 'usuario')
ON CONFLICT DO NOTHING;

-- Espacios
INSERT INTO espacios (nombre, capacidad, ubicacion, estado, tipo_espacio_id) VALUES
  ('Aula 101', 35, 'Edificio A, Planta Baja', 'disponible', 1),
  ('Aula 201', 40, 'Edificio A, Segundo Piso', 'disponible', 1),
  ('Lab Computo 1', 30, 'Edificio B, Planta Baja', 'disponible', 2),
  ('Lab Redes', 25, 'Edificio B, Primer Piso', 'disponible', 2),
  ('Auditorio Principal', 200, 'Edificio Central', 'disponible', 3)
ON CONFLICT DO NOTHING;

-- Recursos por espacio
INSERT INTO recursos (nombre, descripcion, espacio_id) VALUES
  ('Proyector', 'Proyector EPSON full HD', 1),
  ('Pizarrón', 'Pizarrón blanco con marcadores', 1),
  ('Aire acondicionado', 'Minisplit 12000 BTU', 1),
  ('Proyector', 'Proyector BenQ', 2),
  ('Pizarrón', 'Pizarrón blanco con marcadores', 2),
  ('Computadoras', '30 equipos Dell con Windows 11', 3),
  ('Proyector', 'Proyector EPSON para presentaciones', 3),
  ('Impresora', 'Impresora HP LaserJet en red', 3),
  ('Switch de red', 'Switch administrable 48 puertos', 4),
  ('Patch panel', 'Panel de conexiones Cat6', 4),
  ('Sistema de sonido', 'Bocinas y micrófono inalámbrico', 5),
  ('Proyector', 'Proyector 4K para presentaciones', 5),
  ('Pantalla motorizada', 'Pantalla de 200 pulgadas', 5)
ON CONFLICT DO NOTHING;

-- Reservaciones de ejemplo (5 en distintos estados)
INSERT INTO reservaciones (usuario_id, espacio_id, fecha_inicio, fecha_fin, estado, motivo) VALUES
  (2, 1, '2025-06-02 08:00:00', '2025-06-02 10:00:00', 'confirmada', 'Clase de Programación Web'),
  (2, 3, '2025-06-03 10:00:00', '2025-06-03 12:00:00', 'pendiente',  'Práctica de base de datos'),
  (3, 2, '2025-06-04 14:00:00', '2025-06-04 16:00:00', 'cancelada',  'Reunión de academia'),
  (2, 5, '2025-06-05 09:00:00', '2025-06-05 13:00:00', 'confirmada', 'Ceremonia de graduación'),
  (3, 4, '2025-06-06 11:00:00', '2025-06-06 13:00:00', 'pendiente',  'Laboratorio de redes avanzadas');

-- Horarios bloqueados de ejemplo
INSERT INTO horarios_bloqueados (espacio_id, fecha_inicio, fecha_fin, razon) VALUES
  (1, '2025-06-10 00:00:00', '2025-06-10 23:59:00', 'Mantenimiento programado de instalaciones eléctricas'),
  (5, '2025-06-20 00:00:00', '2025-06-21 23:59:00', 'Evento institucional: Semana cultural ITO');

-- Notificaciones de ejemplo ligadas a las reservaciones anteriores
INSERT INTO notificaciones (usuario_id, reservacion_id, tipo, mensaje, leida) VALUES
  (2, 1, 'confirmacion', 'Tu reservación del Aula 101 para el 2 de junio fue confirmada exitosamente.', false),
  (2, 2, 'pendiente',    'Tu reservación del Lab Computo 1 está pendiente de aprobación.', false),
  (3, 3, 'cancelacion',  'Tu reservación del Aula 201 para el 4 de junio fue cancelada.', true);