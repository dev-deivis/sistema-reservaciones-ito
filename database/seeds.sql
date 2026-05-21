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
INSERT INTO usuarios (nombre, email, password_hash, rol, activo) VALUES
  ('Administrador ITO', 'admin@ito.mx', '$2a$10$C433KLZ1DH/30WJ1WWcsKuIlmLi1ICM13FqrMZ0i1FFBYttisdkmm', 'admin', true),
  ('Juan Pérez García', 'juan@ito.mx', '$2a$10$C433KLZ1DH/30WJ1WWcsKuIlmLi1ICM13FqrMZ0i1FFBYttisdkmm', 'usuario', true),
  ('María López Torres', 'maria@ito.mx', '$2a$10$C433KLZ1DH/30WJ1WWcsKuIlmLi1ICM13FqrMZ0i1FFBYttisdkmm', 'usuario', true)
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
  ((SELECT id FROM usuarios WHERE email='juan@ito.mx' LIMIT 1),  (SELECT id FROM espacios WHERE nombre='Aula 101' LIMIT 1),          '2025-06-02 08:00:00', '2025-06-02 10:00:00', 'confirmada', 'Clase de Programación Web'),
  ((SELECT id FROM usuarios WHERE email='juan@ito.mx' LIMIT 1),  (SELECT id FROM espacios WHERE nombre='Lab Computo 1' LIMIT 1),     '2025-06-03 10:00:00', '2025-06-03 12:00:00', 'pendiente',  'Práctica de base de datos'),
  ((SELECT id FROM usuarios WHERE email='maria@ito.mx' LIMIT 1), (SELECT id FROM espacios WHERE nombre='Aula 201' LIMIT 1),          '2025-06-04 14:00:00', '2025-06-04 16:00:00', 'cancelada',  'Reunión de academia'),
  ((SELECT id FROM usuarios WHERE email='juan@ito.mx' LIMIT 1),  (SELECT id FROM espacios WHERE nombre='Auditorio Principal' LIMIT 1),'2025-06-05 09:00:00', '2025-06-05 13:00:00', 'confirmada', 'Ceremonia de graduación'),
  ((SELECT id FROM usuarios WHERE email='maria@ito.mx' LIMIT 1), (SELECT id FROM espacios WHERE nombre='Lab Redes' LIMIT 1),         '2025-06-06 11:00:00', '2025-06-06 13:00:00', 'pendiente',  'Laboratorio de redes avanzadas');

-- Horarios bloqueados de ejemplo
INSERT INTO horarios_bloqueados (espacio_id, fecha_inicio, fecha_fin, razon) VALUES
  ((SELECT id FROM espacios WHERE nombre='Aula 101' LIMIT 1),          '2025-06-10 00:00:00', '2025-06-10 23:59:00', 'Mantenimiento programado de instalaciones eléctricas'),
  ((SELECT id FROM espacios WHERE nombre='Auditorio Principal' LIMIT 1),'2025-06-20 00:00:00', '2025-06-21 23:59:00', 'Evento institucional: Semana cultural ITO');

-- Notificaciones de ejemplo ligadas a las reservaciones anteriores
INSERT INTO notificaciones (usuario_id, reservacion_id, tipo, mensaje, leida) VALUES
  ((SELECT id FROM usuarios WHERE email='juan@ito.mx' LIMIT 1),
   (SELECT id FROM reservaciones WHERE motivo='Clase de Programación Web' LIMIT 1),
   'confirmacion', 'Tu reservación del Aula 101 para el 2 de junio fue confirmada exitosamente.', false),
  ((SELECT id FROM usuarios WHERE email='juan@ito.mx' LIMIT 1),
   (SELECT id FROM reservaciones WHERE motivo='Práctica de base de datos' LIMIT 1),
   'pendiente', 'Tu reservación del Lab Computo 1 está pendiente de aprobación.', false),
  ((SELECT id FROM usuarios WHERE email='maria@ito.mx' LIMIT 1),
   (SELECT id FROM reservaciones WHERE motivo='Reunión de academia' LIMIT 1),
   'cancelacion', 'Tu reservación del Aula 201 para el 4 de junio fue cancelada.', true);

-- ============================================================
-- DATOS ADICIONALES — Expansión realista del sistema ITO
-- ============================================================

-- Tipos de espacio adicionales
INSERT INTO tipo_espacio (nombre, descripcion) VALUES
  ('Sala de Juntas',  'Sala equipada para reuniones y videoconferencias'),
  ('Taller',          'Taller para prácticas de manufactura y electrónica'),
  ('Cancha',          'Área deportiva para actividades físicas y eventos')
ON CONFLICT DO NOTHING;

-- Usuarios adicionales — estudiantes y docentes (contraseña: password)
INSERT INTO usuarios (nombre, email, password_hash, rol, activo) VALUES
  ('Carlos Mendoza Ruiz',      'carlos@ito.mx',   '$2a$10$C433KLZ1DH/30WJ1WWcsKuIlmLi1ICM13FqrMZ0i1FFBYttisdkmm', 'usuario', true),
  ('Ana Hernández Vásquez',    'ana@ito.mx',      '$2a$10$C433KLZ1DH/30WJ1WWcsKuIlmLi1ICM13FqrMZ0i1FFBYttisdkmm', 'usuario', true),
  ('Luis Martínez Pérez',      'luis@ito.mx',     '$2a$10$C433KLZ1DH/30WJ1WWcsKuIlmLi1ICM13FqrMZ0i1FFBYttisdkmm', 'usuario', true),
  ('Rosa García Morales',      'rosa@ito.mx',     '$2a$10$C433KLZ1DH/30WJ1WWcsKuIlmLi1ICM13FqrMZ0i1FFBYttisdkmm', 'usuario', true),
  ('Fernando Díaz Torres',     'fernando@ito.mx', '$2a$10$C433KLZ1DH/30WJ1WWcsKuIlmLi1ICM13FqrMZ0i1FFBYttisdkmm', 'usuario', true),
  ('Gabriela Reyes Solano',    'gabriela@ito.mx', '$2a$10$C433KLZ1DH/30WJ1WWcsKuIlmLi1ICM13FqrMZ0i1FFBYttisdkmm', 'usuario', true),
  ('Miguel Ángel Cruz López',  'miguel@ito.mx',   '$2a$10$C433KLZ1DH/30WJ1WWcsKuIlmLi1ICM13FqrMZ0i1FFBYttisdkmm', 'usuario', true),
  ('Sofía Ramírez Guzmán',     'sofia@ito.mx',    '$2a$10$C433KLZ1DH/30WJ1WWcsKuIlmLi1ICM13FqrMZ0i1FFBYttisdkmm', 'usuario', true),
  ('Andrés Castillo Nava',     'andres@ito.mx',   '$2a$10$C433KLZ1DH/30WJ1WWcsKuIlmLi1ICM13FqrMZ0i1FFBYttisdkmm', 'usuario', true),
  ('Patricia Sánchez Flores',  'patricia@ito.mx', '$2a$10$C433KLZ1DH/30WJ1WWcsKuIlmLi1ICM13FqrMZ0i1FFBYttisdkmm', 'usuario', true),
  ('Héctor Mendoza Jiménez',   'hector@ito.mx',   '$2a$10$C433KLZ1DH/30WJ1WWcsKuIlmLi1ICM13FqrMZ0i1FFBYttisdkmm', 'usuario', true),
  ('Diana Ortega Medina',      'diana@ito.mx',    '$2a$10$C433KLZ1DH/30WJ1WWcsKuIlmLi1ICM13FqrMZ0i1FFBYttisdkmm', 'usuario', true),
  ('Roberto Silva Vargas',     'roberto@ito.mx',  '$2a$10$C433KLZ1DH/30WJ1WWcsKuIlmLi1ICM13FqrMZ0i1FFBYttisdkmm', 'usuario', true),
  ('Valeria Morales Castro',   'valeria@ito.mx',  '$2a$10$C433KLZ1DH/30WJ1WWcsKuIlmLi1ICM13FqrMZ0i1FFBYttisdkmm', 'usuario', true),
  ('Jorge Ríos Espinoza',      'jorge@ito.mx',    '$2a$10$C433KLZ1DH/30WJ1WWcsKuIlmLi1ICM13FqrMZ0i1FFBYttisdkmm', 'usuario', true),
  ('Mónica Lara Villanueva',   'monica@ito.mx',   '$2a$10$C433KLZ1DH/30WJ1WWcsKuIlmLi1ICM13FqrMZ0i1FFBYttisdkmm', 'usuario', true),
  ('Eduardo Fuentes Alvarado', 'eduardo@ito.mx',  '$2a$10$C433KLZ1DH/30WJ1WWcsKuIlmLi1ICM13FqrMZ0i1FFBYttisdkmm', 'usuario', true)
ON CONFLICT (email) DO NOTHING;

-- Espacios adicionales
INSERT INTO espacios (nombre, capacidad, ubicacion, estado, tipo_espacio_id) VALUES
  ('Aula 102',              35,  'Edificio A, Planta Baja',        'disponible',    (SELECT id FROM tipo_espacio WHERE nombre = 'Aula' LIMIT 1)),
  ('Aula 103',              35,  'Edificio A, Planta Baja',        'disponible',    (SELECT id FROM tipo_espacio WHERE nombre = 'Aula' LIMIT 1)),
  ('Aula 202',              40,  'Edificio A, Segundo Piso',       'disponible',    (SELECT id FROM tipo_espacio WHERE nombre = 'Aula' LIMIT 1)),
  ('Aula 203',              40,  'Edificio A, Segundo Piso',       'mantenimiento', (SELECT id FROM tipo_espacio WHERE nombre = 'Aula' LIMIT 1)),
  ('Aula 301',              45,  'Edificio A, Tercer Piso',        'disponible',    (SELECT id FROM tipo_espacio WHERE nombre = 'Aula' LIMIT 1)),
  ('Aula 302',              45,  'Edificio A, Tercer Piso',        'disponible',    (SELECT id FROM tipo_espacio WHERE nombre = 'Aula' LIMIT 1)),
  ('Aula Magna',            80,  'Edificio Central, Planta Baja',  'disponible',    (SELECT id FROM tipo_espacio WHERE nombre = 'Aula' LIMIT 1)),
  ('Aula 104',              30,  'Edificio A, Planta Baja',        'inactivo',      (SELECT id FROM tipo_espacio WHERE nombre = 'Aula' LIMIT 1)),
  ('Lab Computo 2',         28,  'Edificio B, Planta Baja',        'disponible',    (SELECT id FROM tipo_espacio WHERE nombre = 'Laboratorio' LIMIT 1)),
  ('Lab Electrónica',       20,  'Edificio B, Primer Piso',        'disponible',    (SELECT id FROM tipo_espacio WHERE nombre = 'Laboratorio' LIMIT 1)),
  ('Lab Mecánica',          18,  'Edificio C, Planta Baja',        'disponible',    (SELECT id FROM tipo_espacio WHERE nombre = 'Laboratorio' LIMIT 1)),
  ('Lab Química',           24,  'Edificio C, Primer Piso',        'disponible',    (SELECT id FROM tipo_espacio WHERE nombre = 'Laboratorio' LIMIT 1)),
  ('Lab Robótica',          15,  'Edificio B, Segundo Piso',       'disponible',    (SELECT id FROM tipo_espacio WHERE nombre = 'Laboratorio' LIMIT 1)),
  ('Sala de Juntas A',      20,  'Edificio Administrativo',        'disponible',    (SELECT id FROM tipo_espacio WHERE nombre = 'Sala de Juntas' LIMIT 1)),
  ('Sala de Juntas B',      12,  'Edificio Administrativo',        'disponible',    (SELECT id FROM tipo_espacio WHERE nombre = 'Sala de Juntas' LIMIT 1)),
  ('Sala Videoconferencias',16,  'Edificio Administrativo',        'disponible',    (SELECT id FROM tipo_espacio WHERE nombre = 'Sala de Juntas' LIMIT 1)),
  ('Taller Electrónica',    22,  'Edificio D, Planta Baja',        'disponible',    (SELECT id FROM tipo_espacio WHERE nombre = 'Taller' LIMIT 1)),
  ('Taller Mecánica',       20,  'Edificio D, Primer Piso',        'disponible',    (SELECT id FROM tipo_espacio WHERE nombre = 'Taller' LIMIT 1)),
  ('Auditorio Norte',       150, 'Edificio Norte',                 'disponible',    (SELECT id FROM tipo_espacio WHERE nombre = 'Auditorio' LIMIT 1)),
  ('Cancha Principal',      200, 'Área Deportiva',                 'disponible',    (SELECT id FROM tipo_espacio WHERE nombre = 'Cancha' LIMIT 1))
ON CONFLICT DO NOTHING;

-- Recursos para los espacios nuevos
INSERT INTO recursos (nombre, descripcion, espacio_id) VALUES
  ('Proyector',             'Proyector BenQ WXGA',                           (SELECT id FROM espacios WHERE nombre = 'Aula 102' LIMIT 1)),
  ('Pizarrón',              'Pizarrón blanco con marcadores',                 (SELECT id FROM espacios WHERE nombre = 'Aula 102' LIMIT 1)),
  ('Proyector',             'Proyector EPSON full HD',                        (SELECT id FROM espacios WHERE nombre = 'Aula 103' LIMIT 1)),
  ('Pizarrón',              'Pizarrón blanco con marcadores',                 (SELECT id FROM espacios WHERE nombre = 'Aula 103' LIMIT 1)),
  ('Proyector',             'Proyector Optoma HD',                            (SELECT id FROM espacios WHERE nombre = 'Aula 202' LIMIT 1)),
  ('Aire acondicionado',    'Minisplit 18000 BTU',                            (SELECT id FROM espacios WHERE nombre = 'Aula 202' LIMIT 1)),
  ('Proyector',             'Proyector interactivo LG',                       (SELECT id FROM espacios WHERE nombre = 'Aula 301' LIMIT 1)),
  ('Pizarrón interactivo',  'Pizarrón táctil con software educativo',         (SELECT id FROM espacios WHERE nombre = 'Aula 301' LIMIT 1)),
  ('Aire acondicionado',    'Minisplit 18000 BTU',                            (SELECT id FROM espacios WHERE nombre = 'Aula 301' LIMIT 1)),
  ('Proyector',             'Proyector Sony VPL',                             (SELECT id FROM espacios WHERE nombre = 'Aula 302' LIMIT 1)),
  ('Pizarrón',              'Pizarrón blanco con marcadores',                 (SELECT id FROM espacios WHERE nombre = 'Aula 302' LIMIT 1)),
  ('Proyector',             'Proyector de gran formato 5000 lúmenes',         (SELECT id FROM espacios WHERE nombre = 'Aula Magna' LIMIT 1)),
  ('Sistema de sonido',     'Bocinas de techo y micrófono inalámbrico',       (SELECT id FROM espacios WHERE nombre = 'Aula Magna' LIMIT 1)),
  ('Computadoras',          '28 equipos HP con Windows 11',                   (SELECT id FROM espacios WHERE nombre = 'Lab Computo 2' LIMIT 1)),
  ('Proyector',             'Proyector EPSON para presentaciones',            (SELECT id FROM espacios WHERE nombre = 'Lab Computo 2' LIMIT 1)),
  ('Impresora',             'Impresora Canon LaserJet en red',                (SELECT id FROM espacios WHERE nombre = 'Lab Computo 2' LIMIT 1)),
  ('Osciloscopio',          'Osciloscopio digital 4 canales x20',             (SELECT id FROM espacios WHERE nombre = 'Lab Electrónica' LIMIT 1)),
  ('Multímetro',            'Multímetros digitales x20',                      (SELECT id FROM espacios WHERE nombre = 'Lab Electrónica' LIMIT 1)),
  ('Fuente de poder',       'Fuentes variables de laboratorio x20',           (SELECT id FROM espacios WHERE nombre = 'Lab Electrónica' LIMIT 1)),
  ('Torno',                 'Torno mecánico convencional',                    (SELECT id FROM espacios WHERE nombre = 'Lab Mecánica' LIMIT 1)),
  ('Fresadora',             'Fresadora vertical manual',                      (SELECT id FROM espacios WHERE nombre = 'Lab Mecánica' LIMIT 1)),
  ('Campana extractora',    'Sistema de ventilación forzada',                 (SELECT id FROM espacios WHERE nombre = 'Lab Química' LIMIT 1)),
  ('Microscopio',           'Microscopios ópticos x24',                       (SELECT id FROM espacios WHERE nombre = 'Lab Química' LIMIT 1)),
  ('Robots educativos',     'Kits de robótica Arduino x15',                   (SELECT id FROM espacios WHERE nombre = 'Lab Robótica' LIMIT 1)),
  ('Impresora 3D',          'Impresora 3D Creality Ender 3',                  (SELECT id FROM espacios WHERE nombre = 'Lab Robótica' LIMIT 1)),
  ('Pantalla TV',           'Smart TV 65 pulgadas',                           (SELECT id FROM espacios WHERE nombre = 'Sala de Juntas A' LIMIT 1)),
  ('Cámara videoconferencia','Cámara 4K con micrófono omnidireccional',       (SELECT id FROM espacios WHERE nombre = 'Sala de Juntas A' LIMIT 1)),
  ('Pizarrón',              'Pizarrón blanco con marcadores',                 (SELECT id FROM espacios WHERE nombre = 'Sala de Juntas A' LIMIT 1)),
  ('Pantalla TV',           'Smart TV 55 pulgadas',                           (SELECT id FROM espacios WHERE nombre = 'Sala de Juntas B' LIMIT 1)),
  ('Pizarrón',              'Pizarrón blanco con marcadores',                 (SELECT id FROM espacios WHERE nombre = 'Sala de Juntas B' LIMIT 1)),
  ('Sistema Zoom Room',     'Videoconferencia con cámara PTZ y TV 86"',       (SELECT id FROM espacios WHERE nombre = 'Sala Videoconferencias' LIMIT 1)),
  ('Soldadores',            'Estaciones de soldadura de estaño x22',          (SELECT id FROM espacios WHERE nombre = 'Taller Electrónica' LIMIT 1)),
  ('Osciloscopio portátil', 'Osciloscopio portátil para prácticas',           (SELECT id FROM espacios WHERE nombre = 'Taller Electrónica' LIMIT 1)),
  ('Prensa hidráulica',     'Prensa hidráulica 20 toneladas',                 (SELECT id FROM espacios WHERE nombre = 'Taller Mecánica' LIMIT 1)),
  ('Compresor',             'Compresor de aire 100 L',                        (SELECT id FROM espacios WHERE nombre = 'Taller Mecánica' LIMIT 1)),
  ('Sistema de sonido',     'Bocinas y micrófono inalámbrico para eventos',   (SELECT id FROM espacios WHERE nombre = 'Auditorio Norte' LIMIT 1)),
  ('Proyector',             'Proyector 4K 6000 lúmenes',                      (SELECT id FROM espacios WHERE nombre = 'Auditorio Norte' LIMIT 1)),
  ('Pantalla motorizada',   'Pantalla eléctrica 200 pulgadas',                (SELECT id FROM espacios WHERE nombre = 'Auditorio Norte' LIMIT 1)),
  ('Sistema de sonido',     'Bocinas portátiles y micrófono inalámbrico',     (SELECT id FROM espacios WHERE nombre = 'Cancha Principal' LIMIT 1));

-- Reservaciones adicionales
-- Pasadas (ene–abr 2026): completadas y canceladas
-- Recientes (may 1–12 2026): completadas
-- Presentes y futuras (may 13+ y jun–jul 2026): pendientes y confirmadas
INSERT INTO reservaciones (usuario_id, espacio_id, fecha_inicio, fecha_fin, estado, motivo) VALUES
  -- Enero 2026 — completadas
  ((SELECT id FROM usuarios WHERE email='carlos@ito.mx' LIMIT 1),   (SELECT id FROM espacios WHERE nombre='Aula 102' LIMIT 1),          '2026-01-12 08:00', '2026-01-12 10:00', 'completada', 'Clase de Álgebra Lineal'),
  ((SELECT id FROM usuarios WHERE email='ana@ito.mx' LIMIT 1),      (SELECT id FROM espacios WHERE nombre='Lab Computo 2' LIMIT 1),     '2026-01-13 10:00', '2026-01-13 12:00', 'completada', 'Práctica de programación en Python'),
  ((SELECT id FROM usuarios WHERE email='luis@ito.mx' LIMIT 1),     (SELECT id FROM espacios WHERE nombre='Lab Redes' LIMIT 1),         '2026-01-15 14:00', '2026-01-15 16:00', 'completada', 'Práctica de configuración de routers'),
  ((SELECT id FROM usuarios WHERE email='rosa@ito.mx' LIMIT 1),     (SELECT id FROM espacios WHERE nombre='Sala de Juntas A' LIMIT 1),  '2026-01-20 09:00', '2026-01-20 11:00', 'completada', 'Reunión de academia de Sistemas'),
  ((SELECT id FROM usuarios WHERE email='fernando@ito.mx' LIMIT 1), (SELECT id FROM espacios WHERE nombre='Aula 301' LIMIT 1),          '2026-01-22 07:00', '2026-01-22 09:00', 'cancelada',  'Exposición de proyecto integrador'),
  -- Febrero 2026
  ((SELECT id FROM usuarios WHERE email='gabriela@ito.mx' LIMIT 1), (SELECT id FROM espacios WHERE nombre='Lab Electrónica' LIMIT 1),   '2026-02-03 10:00', '2026-02-03 13:00', 'completada', 'Práctica de circuitos analógicos'),
  ((SELECT id FROM usuarios WHERE email='miguel@ito.mx' LIMIT 1),   (SELECT id FROM espacios WHERE nombre='Aula 202' LIMIT 1),          '2026-02-05 08:00', '2026-02-05 10:00', 'completada', 'Examen de Cálculo Diferencial'),
  ((SELECT id FROM usuarios WHERE email='sofia@ito.mx' LIMIT 1),    (SELECT id FROM espacios WHERE nombre='Auditorio Principal' LIMIT 1),'2026-02-10 16:00', '2026-02-10 19:00', 'completada', 'Presentación de proyectos de titulación'),
  ((SELECT id FROM usuarios WHERE email='andres@ito.mx' LIMIT 1),   (SELECT id FROM espacios WHERE nombre='Lab Computo 1' LIMIT 1),     '2026-02-12 10:00', '2026-02-12 12:00', 'cancelada',  'Taller de desarrollo web con React'),
  ((SELECT id FROM usuarios WHERE email='patricia@ito.mx' LIMIT 1), (SELECT id FROM espacios WHERE nombre='Sala de Juntas B' LIMIT 1),  '2026-02-18 11:00', '2026-02-18 13:00', 'completada', 'Junta de coordinadores de carrera'),
  -- Marzo 2026
  ((SELECT id FROM usuarios WHERE email='hector@ito.mx' LIMIT 1),   (SELECT id FROM espacios WHERE nombre='Lab Robótica' LIMIT 1),      '2026-03-03 09:00', '2026-03-03 12:00', 'completada', 'Práctica de programación de robots'),
  ((SELECT id FROM usuarios WHERE email='diana@ito.mx' LIMIT 1),    (SELECT id FROM espacios WHERE nombre='Aula 103' LIMIT 1),          '2026-03-05 13:00', '2026-03-05 15:00', 'completada', 'Clase de Estructuras de Datos'),
  ((SELECT id FROM usuarios WHERE email='roberto@ito.mx' LIMIT 1),  (SELECT id FROM espacios WHERE nombre='Taller Electrónica' LIMIT 1),'2026-03-10 08:00', '2026-03-10 11:00', 'completada', 'Práctica de soldadura SMD'),
  ((SELECT id FROM usuarios WHERE email='valeria@ito.mx' LIMIT 1),  (SELECT id FROM espacios WHERE nombre='Cancha Principal' LIMIT 1),  '2026-03-15 10:00', '2026-03-15 13:00', 'completada', 'Torneo intercarreras de voleibol'),
  ((SELECT id FROM usuarios WHERE email='jorge@ito.mx' LIMIT 1),    (SELECT id FROM espacios WHERE nombre='Lab Química' LIMIT 1),       '2026-03-18 14:00', '2026-03-18 17:00', 'cancelada',  'Práctica de análisis de muestras'),
  ((SELECT id FROM usuarios WHERE email='monica@ito.mx' LIMIT 1),   (SELECT id FROM espacios WHERE nombre='Auditorio Norte' LIMIT 1),   '2026-03-25 09:00', '2026-03-25 13:00', 'completada', 'Conferencia de innovación tecnológica'),
  ((SELECT id FROM usuarios WHERE email='eduardo@ito.mx' LIMIT 1),  (SELECT id FROM espacios WHERE nombre='Aula Magna' LIMIT 1),        '2026-03-27 15:00', '2026-03-27 18:00', 'completada', 'Ceremonia de bienvenida a nuevos alumnos'),
  -- Abril 2026
  ((SELECT id FROM usuarios WHERE email='carlos@ito.mx' LIMIT 1),   (SELECT id FROM espacios WHERE nombre='Lab Computo 2' LIMIT 1),     '2026-04-07 10:00', '2026-04-07 12:00', 'completada', 'Examen de Programación Orientada a Objetos'),
  ((SELECT id FROM usuarios WHERE email='ana@ito.mx' LIMIT 1),      (SELECT id FROM espacios WHERE nombre='Sala Videoconferencias' LIMIT 1),'2026-04-08 09:00','2026-04-08 10:30','completada','Reunión con empresa vinculada por videollamada'),
  ((SELECT id FROM usuarios WHERE email='luis@ito.mx' LIMIT 1),     (SELECT id FROM espacios WHERE nombre='Taller Mecánica' LIMIT 1),   '2026-04-10 08:00', '2026-04-10 11:00', 'completada', 'Práctica de ajuste y calibración'),
  ((SELECT id FROM usuarios WHERE email='rosa@ito.mx' LIMIT 1),     (SELECT id FROM espacios WHERE nombre='Aula 302' LIMIT 1),          '2026-04-14 13:00', '2026-04-14 15:00', 'cancelada',  'Curso de metodología de investigación'),
  ((SELECT id FROM usuarios WHERE email='fernando@ito.mx' LIMIT 1), (SELECT id FROM espacios WHERE nombre='Lab Redes' LIMIT 1),         '2026-04-16 09:00', '2026-04-16 12:00', 'completada', 'Práctica de protocolo TCP/IP'),
  ((SELECT id FROM usuarios WHERE email='gabriela@ito.mx' LIMIT 1), (SELECT id FROM espacios WHERE nombre='Sala de Juntas A' LIMIT 1),  '2026-04-22 10:00', '2026-04-22 12:00', 'completada', 'Reunión de seguimiento de residencias profesionales'),
  ((SELECT id FROM usuarios WHERE email='miguel@ito.mx' LIMIT 1),   (SELECT id FROM espacios WHERE nombre='Auditorio Principal' LIMIT 1),'2026-04-28 17:00', '2026-04-28 20:00', 'completada', 'Noche cultural del ITO'),
  -- Mayo 2026 — primera quincena (ya pasadas, completadas)
  ((SELECT id FROM usuarios WHERE email='sofia@ito.mx' LIMIT 1),    (SELECT id FROM espacios WHERE nombre='Aula 301' LIMIT 1),          '2026-05-05 08:00', '2026-05-05 10:00', 'completada', 'Clase de Bases de Datos Avanzadas'),
  ((SELECT id FROM usuarios WHERE email='andres@ito.mx' LIMIT 1),   (SELECT id FROM espacios WHERE nombre='Lab Mecánica' LIMIT 1),      '2026-05-06 10:00', '2026-05-06 13:00', 'completada', 'Práctica de manufactura CNC'),
  ((SELECT id FROM usuarios WHERE email='patricia@ito.mx' LIMIT 1), (SELECT id FROM espacios WHERE nombre='Sala de Juntas B' LIMIT 1),  '2026-05-07 09:00', '2026-05-07 10:30', 'completada', 'Entrevista de seguimiento a egresados'),
  ((SELECT id FROM usuarios WHERE email='hector@ito.mx' LIMIT 1),   (SELECT id FROM espacios WHERE nombre='Lab Computo 1' LIMIT 1),     '2026-05-08 10:00', '2026-05-08 12:00', 'completada', 'Taller de seguridad informática'),
  ((SELECT id FROM usuarios WHERE email='diana@ito.mx' LIMIT 1),    (SELECT id FROM espacios WHERE nombre='Aula Magna' LIMIT 1),        '2026-05-09 15:00', '2026-05-09 18:00', 'completada', 'Congreso estudiantil de ingeniería'),
  ((SELECT id FROM usuarios WHERE email='roberto@ito.mx' LIMIT 1),  (SELECT id FROM espacios WHERE nombre='Lab Electrónica' LIMIT 1),   '2026-05-12 08:00', '2026-05-12 11:00', 'completada', 'Práctica de amplificadores operacionales'),
  -- Mayo 2026 — segunda quincena (vigentes)
  ((SELECT id FROM usuarios WHERE email='valeria@ito.mx' LIMIT 1),  (SELECT id FROM espacios WHERE nombre='Aula 102' LIMIT 1),          '2026-05-14 08:00', '2026-05-14 10:00', 'confirmada', 'Clase de Ingeniería de Software'),
  ((SELECT id FROM usuarios WHERE email='jorge@ito.mx' LIMIT 1),    (SELECT id FROM espacios WHERE nombre='Lab Redes' LIMIT 1),         '2026-05-15 10:00', '2026-05-15 13:00', 'confirmada', 'Práctica de redes inalámbricas'),
  ((SELECT id FROM usuarios WHERE email='monica@ito.mx' LIMIT 1),   (SELECT id FROM espacios WHERE nombre='Sala de Juntas A' LIMIT 1),  '2026-05-16 09:00', '2026-05-16 11:00', 'pendiente',  'Reunión de planeación semestral'),
  ((SELECT id FROM usuarios WHERE email='eduardo@ito.mx' LIMIT 1),  (SELECT id FROM espacios WHERE nombre='Lab Robótica' LIMIT 1),      '2026-05-19 14:00', '2026-05-19 17:00', 'pendiente',  'Práctica de visión computacional'),
  ((SELECT id FROM usuarios WHERE email='carlos@ito.mx' LIMIT 1),   (SELECT id FROM espacios WHERE nombre='Aula 301' LIMIT 1),          '2026-05-20 07:00', '2026-05-20 09:00', 'confirmada', 'Repaso de examen de Análisis de Algoritmos'),
  ((SELECT id FROM usuarios WHERE email='ana@ito.mx' LIMIT 1),      (SELECT id FROM espacios WHERE nombre='Taller Electrónica' LIMIT 1),'2026-05-21 10:00', '2026-05-21 13:00', 'pendiente',  'Taller de IoT con ESP32'),
  ((SELECT id FROM usuarios WHERE email='luis@ito.mx' LIMIT 1),     (SELECT id FROM espacios WHERE nombre='Auditorio Norte' LIMIT 1),   '2026-05-23 15:00', '2026-05-23 18:00', 'confirmada', 'Expo de proyectos de Ingeniería en Sistemas'),
  -- Junio 2026 — futuras
  ((SELECT id FROM usuarios WHERE email='rosa@ito.mx' LIMIT 1),     (SELECT id FROM espacios WHERE nombre='Aula 202' LIMIT 1),          '2026-06-02 08:00', '2026-06-02 10:00', 'pendiente',  'Clase de Sistemas Operativos'),
  ((SELECT id FROM usuarios WHERE email='fernando@ito.mx' LIMIT 1), (SELECT id FROM espacios WHERE nombre='Lab Química' LIMIT 1),       '2026-06-04 10:00', '2026-06-04 13:00', 'pendiente',  'Práctica de síntesis de polímeros'),
  ((SELECT id FROM usuarios WHERE email='gabriela@ito.mx' LIMIT 1), (SELECT id FROM espacios WHERE nombre='Sala Videoconferencias' LIMIT 1),'2026-06-05 09:00','2026-06-05 11:00','pendiente','Defensa de residencia profesional por videollamada'),
  ((SELECT id FROM usuarios WHERE email='miguel@ito.mx' LIMIT 1),   (SELECT id FROM espacios WHERE nombre='Aula Magna' LIMIT 1),        '2026-06-10 16:00', '2026-06-10 20:00', 'pendiente',  'Ceremonia de titulación generación 2026'),
  ((SELECT id FROM usuarios WHERE email='sofia@ito.mx' LIMIT 1),    (SELECT id FROM espacios WHERE nombre='Cancha Principal' LIMIT 1),  '2026-06-14 09:00', '2026-06-14 14:00', 'pendiente',  'Festival deportivo fin de semestre'),
  ((SELECT id FROM usuarios WHERE email='andres@ito.mx' LIMIT 1),   (SELECT id FROM espacios WHERE nombre='Lab Computo 2' LIMIT 1),     '2026-06-17 10:00', '2026-06-17 12:00', 'pendiente',  'Examen final de Desarrollo de Software'),
  ((SELECT id FROM usuarios WHERE email='patricia@ito.mx' LIMIT 1), (SELECT id FROM espacios WHERE nombre='Auditorio Principal' LIMIT 1),'2026-07-03 09:00', '2026-07-03 13:00', 'pendiente',  'Congreso regional de tecnología e innovación');

-- Horarios bloqueados adicionales
INSERT INTO horarios_bloqueados (espacio_id, fecha_inicio, fecha_fin, razon) VALUES
  ((SELECT id FROM espacios WHERE nombre='Aula 203' LIMIT 1),          '2026-05-01 00:00', '2026-06-30 23:59', 'Remodelación del techo — fuera de servicio'),
  ((SELECT id FROM espacios WHERE nombre='Aula 104' LIMIT 1),          '2026-01-01 00:00', '2026-12-31 23:59', 'Espacio inactivo por bajo aforo'),
  ((SELECT id FROM espacios WHERE nombre='Lab Mecánica' LIMIT 1),      '2026-06-01 00:00', '2026-06-05 23:59', 'Mantenimiento preventivo de maquinaria'),
  ((SELECT id FROM espacios WHERE nombre='Auditorio Norte' LIMIT 1),   '2026-06-08 00:00', '2026-06-09 23:59', 'Montaje de escenario para graduación'),
  ((SELECT id FROM espacios WHERE nombre='Cancha Principal' LIMIT 1),  '2026-06-16 00:00', '2026-06-16 23:59', 'Reservada para evento deportivo institucional'),
  ((SELECT id FROM espacios WHERE nombre='Lab Computo 1' LIMIT 1),     '2026-05-25 07:00', '2026-05-25 14:00', 'Actualización de sistemas operativos en red'),
  ((SELECT id FROM espacios WHERE nombre='Sala de Juntas A' LIMIT 1),  '2026-05-28 09:00', '2026-05-28 13:00', 'Visita de auditores del TECNM'),
  ((SELECT id FROM espacios WHERE nombre='Aula Magna' LIMIT 1),        '2026-06-10 14:00', '2026-06-10 20:00', 'Ceremonia de titulación — montaje previo');

-- Notificaciones para reservaciones de los nuevos usuarios
-- (confirmaciones de reservaciones vigentes y futuras)
INSERT INTO notificaciones (usuario_id, reservacion_id, tipo, mensaje, leida) VALUES
  ((SELECT id FROM usuarios WHERE email='valeria@ito.mx' LIMIT 1),
   (SELECT id FROM reservaciones WHERE motivo='Clase de Ingeniería de Software' LIMIT 1),
   'confirmacion', 'Tu reservación del Aula 102 para el 14 de mayo fue confirmada.', false),

  ((SELECT id FROM usuarios WHERE email='jorge@ito.mx' LIMIT 1),
   (SELECT id FROM reservaciones WHERE motivo='Práctica de redes inalámbricas' LIMIT 1),
   'confirmacion', 'Tu reservación del Lab Redes para el 15 de mayo fue confirmada.', false),

  ((SELECT id FROM usuarios WHERE email='monica@ito.mx' LIMIT 1),
   (SELECT id FROM reservaciones WHERE motivo='Reunión de planeación semestral' LIMIT 1),
   'confirmacion', 'Tu reservación de Sala de Juntas A para el 16 de mayo está pendiente de aprobación.', false),

  ((SELECT id FROM usuarios WHERE email='eduardo@ito.mx' LIMIT 1),
   (SELECT id FROM reservaciones WHERE motivo='Práctica de visión computacional' LIMIT 1),
   'confirmacion', 'Tu reservación del Lab Robótica para el 19 de mayo está pendiente de aprobación.', true),

  ((SELECT id FROM usuarios WHERE email='carlos@ito.mx' LIMIT 1),
   (SELECT id FROM reservaciones WHERE motivo='Repaso de examen de Análisis de Algoritmos' LIMIT 1),
   'confirmacion', 'Tu reservación del Aula 301 para el 20 de mayo fue confirmada.', false),

  ((SELECT id FROM usuarios WHERE email='ana@ito.mx' LIMIT 1),
   (SELECT id FROM reservaciones WHERE motivo='Taller de IoT con ESP32' LIMIT 1),
   'confirmacion', 'Tu reservación del Taller Electrónica para el 21 de mayo está pendiente.', false),

  ((SELECT id FROM usuarios WHERE email='luis@ito.mx' LIMIT 1),
   (SELECT id FROM reservaciones WHERE motivo='Expo de proyectos de Ingeniería en Sistemas' LIMIT 1),
   'confirmacion', 'Tu reservación del Auditorio Norte para el 23 de mayo fue confirmada.', true),

  ((SELECT id FROM usuarios WHERE email='rosa@ito.mx' LIMIT 1),
   (SELECT id FROM reservaciones WHERE motivo='Clase de Sistemas Operativos' LIMIT 1),
   'confirmacion', 'Tu reservación del Aula 202 para el 2 de junio está pendiente de aprobación.', false),

  ((SELECT id FROM usuarios WHERE email='gabriela@ito.mx' LIMIT 1),
   (SELECT id FROM reservaciones WHERE motivo='Defensa de residencia profesional por videollamada' LIMIT 1),
   'confirmacion', 'Tu reservación de Sala Videoconferencias para el 5 de junio está pendiente.', false),

  ((SELECT id FROM usuarios WHERE email='miguel@ito.mx' LIMIT 1),
   (SELECT id FROM reservaciones WHERE motivo='Ceremonia de titulación generación 2026' LIMIT 1),
   'confirmacion', 'Tu reservación del Aula Magna para el 10 de junio está pendiente de aprobación.', false),

  -- Notificaciones de cancelaciones pasadas
  ((SELECT id FROM usuarios WHERE email='fernando@ito.mx' LIMIT 1), NULL, 'cancelacion',
   'Tu reservación del Aula 301 para el 22 de enero fue cancelada.', true),

  ((SELECT id FROM usuarios WHERE email='andres@ito.mx' LIMIT 1),   NULL, 'cancelacion',
   'Tu reservación del Lab Computo 1 para el 12 de febrero fue cancelada.', true),

  ((SELECT id FROM usuarios WHERE email='jorge@ito.mx' LIMIT 1),    NULL, 'cancelacion',
   'Tu reservación del Lab Química para el 18 de marzo fue cancelada.', true),

  ((SELECT id FROM usuarios WHERE email='rosa@ito.mx' LIMIT 1),     NULL, 'cancelacion',
   'Tu reservación del Aula 302 para el 14 de abril fue cancelada.', true),

  -- Recordatorios de reservaciones próximas
  ((SELECT id FROM usuarios WHERE email='luis@ito.mx' LIMIT 1),
   (SELECT id FROM reservaciones WHERE motivo='Expo de proyectos de Ingeniería en Sistemas' LIMIT 1),
   'recordatorio', 'Recordatorio: tienes una reservación del Auditorio Norte mañana a las 15:00.', false),

  ((SELECT id FROM usuarios WHERE email='miguel@ito.mx' LIMIT 1),
   (SELECT id FROM reservaciones WHERE motivo='Ceremonia de titulación generación 2026' LIMIT 1),
   'recordatorio', 'Recordatorio: tienes reservado el Aula Magna el 10 de junio para la ceremonia de titulación.', false);

-- Historial de cambios para las reservaciones nuevas (una entrada por creación)
INSERT INTO historial_cambios (reservacion_id, usuario_id, accion, detalle) VALUES
  ((SELECT id FROM reservaciones WHERE motivo='Clase de Álgebra Lineal' LIMIT 1),                      (SELECT id FROM usuarios WHERE email='carlos@ito.mx' LIMIT 1),   'creacion',     'Reservación creada'),
  ((SELECT id FROM reservaciones WHERE motivo='Práctica de programación en Python' LIMIT 1),           (SELECT id FROM usuarios WHERE email='ana@ito.mx' LIMIT 1),      'creacion',     'Reservación creada'),
  ((SELECT id FROM reservaciones WHERE motivo='Práctica de configuración de routers' LIMIT 1),         (SELECT id FROM usuarios WHERE email='luis@ito.mx' LIMIT 1),     'creacion',     'Reservación creada'),
  ((SELECT id FROM reservaciones WHERE motivo='Reunión de academia de Sistemas' LIMIT 1),              (SELECT id FROM usuarios WHERE email='rosa@ito.mx' LIMIT 1),     'creacion',     'Reservación creada'),
  ((SELECT id FROM reservaciones WHERE motivo='Exposición de proyecto integrador' LIMIT 1),            (SELECT id FROM usuarios WHERE email='fernando@ito.mx' LIMIT 1), 'creacion',     'Reservación creada'),
  ((SELECT id FROM reservaciones WHERE motivo='Exposición de proyecto integrador' LIMIT 1),            (SELECT id FROM usuarios WHERE email='fernando@ito.mx' LIMIT 1), 'cancelacion',  'Reservación cancelada por el usuario'),
  ((SELECT id FROM reservaciones WHERE motivo='Práctica de circuitos analógicos' LIMIT 1),             (SELECT id FROM usuarios WHERE email='gabriela@ito.mx' LIMIT 1),'creacion',     'Reservación creada'),
  ((SELECT id FROM reservaciones WHERE motivo='Examen de Cálculo Diferencial' LIMIT 1),                (SELECT id FROM usuarios WHERE email='miguel@ito.mx' LIMIT 1),   'creacion',     'Reservación creada'),
  ((SELECT id FROM reservaciones WHERE motivo='Presentación de proyectos de titulación' LIMIT 1),      (SELECT id FROM usuarios WHERE email='sofia@ito.mx' LIMIT 1),    'creacion',     'Reservación creada'),
  ((SELECT id FROM reservaciones WHERE motivo='Taller de desarrollo web con React' LIMIT 1),           (SELECT id FROM usuarios WHERE email='andres@ito.mx' LIMIT 1),   'creacion',     'Reservación creada'),
  ((SELECT id FROM reservaciones WHERE motivo='Taller de desarrollo web con React' LIMIT 1),           (SELECT id FROM usuarios WHERE email='andres@ito.mx' LIMIT 1),   'cancelacion',  'Reservación cancelada por el usuario'),
  ((SELECT id FROM reservaciones WHERE motivo='Junta de coordinadores de carrera' LIMIT 1),            (SELECT id FROM usuarios WHERE email='patricia@ito.mx' LIMIT 1),'creacion',     'Reservación creada'),
  ((SELECT id FROM reservaciones WHERE motivo='Práctica de programación de robots' LIMIT 1),           (SELECT id FROM usuarios WHERE email='hector@ito.mx' LIMIT 1),   'creacion',     'Reservación creada'),
  ((SELECT id FROM reservaciones WHERE motivo='Clase de Estructuras de Datos' LIMIT 1),                (SELECT id FROM usuarios WHERE email='diana@ito.mx' LIMIT 1),    'creacion',     'Reservación creada'),
  ((SELECT id FROM reservaciones WHERE motivo='Práctica de soldadura SMD' LIMIT 1),                    (SELECT id FROM usuarios WHERE email='roberto@ito.mx' LIMIT 1),  'creacion',     'Reservación creada'),
  ((SELECT id FROM reservaciones WHERE motivo='Torneo intercarreras de voleibol' LIMIT 1),             (SELECT id FROM usuarios WHERE email='valeria@ito.mx' LIMIT 1),  'creacion',     'Reservación creada'),
  ((SELECT id FROM reservaciones WHERE motivo='Práctica de análisis de muestras' LIMIT 1),             (SELECT id FROM usuarios WHERE email='jorge@ito.mx' LIMIT 1),    'creacion',     'Reservación creada'),
  ((SELECT id FROM reservaciones WHERE motivo='Práctica de análisis de muestras' LIMIT 1),             (SELECT id FROM usuarios WHERE email='jorge@ito.mx' LIMIT 1),    'cancelacion',  'Reservación cancelada por el usuario'),
  ((SELECT id FROM reservaciones WHERE motivo='Conferencia de innovación tecnológica' LIMIT 1),        (SELECT id FROM usuarios WHERE email='monica@ito.mx' LIMIT 1),   'creacion',     'Reservación creada'),
  ((SELECT id FROM reservaciones WHERE motivo='Ceremonia de bienvenida a nuevos alumnos' LIMIT 1),     (SELECT id FROM usuarios WHERE email='eduardo@ito.mx' LIMIT 1),  'creacion',     'Reservación creada'),
  ((SELECT id FROM reservaciones WHERE motivo='Examen de Programación Orientada a Objetos' LIMIT 1),   (SELECT id FROM usuarios WHERE email='carlos@ito.mx' LIMIT 1),   'creacion',     'Reservación creada'),
  ((SELECT id FROM reservaciones WHERE motivo='Reunión con empresa vinculada por videollamada' LIMIT 1),(SELECT id FROM usuarios WHERE email='ana@ito.mx' LIMIT 1),      'creacion',     'Reservación creada'),
  ((SELECT id FROM reservaciones WHERE motivo='Práctica de ajuste y calibración' LIMIT 1),             (SELECT id FROM usuarios WHERE email='luis@ito.mx' LIMIT 1),     'creacion',     'Reservación creada'),
  ((SELECT id FROM reservaciones WHERE motivo='Curso de metodología de investigación' LIMIT 1),        (SELECT id FROM usuarios WHERE email='rosa@ito.mx' LIMIT 1),     'creacion',     'Reservación creada'),
  ((SELECT id FROM reservaciones WHERE motivo='Curso de metodología de investigación' LIMIT 1),        (SELECT id FROM usuarios WHERE email='rosa@ito.mx' LIMIT 1),     'cancelacion',  'Reservación cancelada por el usuario'),
  ((SELECT id FROM reservaciones WHERE motivo='Práctica de protocolo TCP/IP' LIMIT 1),                 (SELECT id FROM usuarios WHERE email='fernando@ito.mx' LIMIT 1), 'creacion',     'Reservación creada'),
  ((SELECT id FROM reservaciones WHERE motivo='Reunión de seguimiento de residencias profesionales' LIMIT 1),(SELECT id FROM usuarios WHERE email='gabriela@ito.mx' LIMIT 1),'creacion','Reservación creada'),
  ((SELECT id FROM reservaciones WHERE motivo='Noche cultural del ITO' LIMIT 1),                       (SELECT id FROM usuarios WHERE email='miguel@ito.mx' LIMIT 1),   'creacion',     'Reservación creada'),
  ((SELECT id FROM reservaciones WHERE motivo='Clase de Bases de Datos Avanzadas' LIMIT 1),            (SELECT id FROM usuarios WHERE email='sofia@ito.mx' LIMIT 1),    'creacion',     'Reservación creada'),
  ((SELECT id FROM reservaciones WHERE motivo='Práctica de manufactura CNC' LIMIT 1),                  (SELECT id FROM usuarios WHERE email='andres@ito.mx' LIMIT 1),   'creacion',     'Reservación creada'),
  ((SELECT id FROM reservaciones WHERE motivo='Entrevista de seguimiento a egresados' LIMIT 1),        (SELECT id FROM usuarios WHERE email='patricia@ito.mx' LIMIT 1), 'creacion',     'Reservación creada'),
  ((SELECT id FROM reservaciones WHERE motivo='Taller de seguridad informática' LIMIT 1),              (SELECT id FROM usuarios WHERE email='hector@ito.mx' LIMIT 1),   'creacion',     'Reservación creada'),
  ((SELECT id FROM reservaciones WHERE motivo='Congreso estudiantil de ingeniería' LIMIT 1),           (SELECT id FROM usuarios WHERE email='diana@ito.mx' LIMIT 1),    'creacion',     'Reservación creada'),
  ((SELECT id FROM reservaciones WHERE motivo='Práctica de amplificadores operacionales' LIMIT 1),     (SELECT id FROM usuarios WHERE email='roberto@ito.mx' LIMIT 1),  'creacion',     'Reservación creada'),
  ((SELECT id FROM reservaciones WHERE motivo='Clase de Ingeniería de Software' LIMIT 1),              (SELECT id FROM usuarios WHERE email='valeria@ito.mx' LIMIT 1),  'creacion',     'Reservación creada'),
  ((SELECT id FROM reservaciones WHERE motivo='Práctica de redes inalámbricas' LIMIT 1),               (SELECT id FROM usuarios WHERE email='jorge@ito.mx' LIMIT 1),    'creacion',     'Reservación creada'),
  ((SELECT id FROM reservaciones WHERE motivo='Reunión de planeación semestral' LIMIT 1),              (SELECT id FROM usuarios WHERE email='monica@ito.mx' LIMIT 1),   'creacion',     'Reservación creada'),
  ((SELECT id FROM reservaciones WHERE motivo='Práctica de visión computacional' LIMIT 1),             (SELECT id FROM usuarios WHERE email='eduardo@ito.mx' LIMIT 1),  'creacion',     'Reservación creada'),
  ((SELECT id FROM reservaciones WHERE motivo='Repaso de examen de Análisis de Algoritmos' LIMIT 1),   (SELECT id FROM usuarios WHERE email='carlos@ito.mx' LIMIT 1),   'creacion',     'Reservación creada'),
  ((SELECT id FROM reservaciones WHERE motivo='Taller de IoT con ESP32' LIMIT 1),                      (SELECT id FROM usuarios WHERE email='ana@ito.mx' LIMIT 1),      'creacion',     'Reservación creada'),
  ((SELECT id FROM reservaciones WHERE motivo='Expo de proyectos de Ingeniería en Sistemas' LIMIT 1),  (SELECT id FROM usuarios WHERE email='luis@ito.mx' LIMIT 1),     'creacion',     'Reservación creada'),
  ((SELECT id FROM reservaciones WHERE motivo='Clase de Sistemas Operativos' LIMIT 1),                 (SELECT id FROM usuarios WHERE email='rosa@ito.mx' LIMIT 1),     'creacion',     'Reservación creada'),
  ((SELECT id FROM reservaciones WHERE motivo='Práctica de síntesis de polímeros' LIMIT 1),            (SELECT id FROM usuarios WHERE email='fernando@ito.mx' LIMIT 1), 'creacion',     'Reservación creada'),
  ((SELECT id FROM reservaciones WHERE motivo='Defensa de residencia profesional por videollamada' LIMIT 1),(SELECT id FROM usuarios WHERE email='gabriela@ito.mx' LIMIT 1),'creacion','Reservación creada'),
  ((SELECT id FROM reservaciones WHERE motivo='Ceremonia de titulación generación 2026' LIMIT 1),      (SELECT id FROM usuarios WHERE email='miguel@ito.mx' LIMIT 1),   'creacion',     'Reservación creada'),
  ((SELECT id FROM reservaciones WHERE motivo='Festival deportivo fin de semestre' LIMIT 1),           (SELECT id FROM usuarios WHERE email='sofia@ito.mx' LIMIT 1),    'creacion',     'Reservación creada'),
  ((SELECT id FROM reservaciones WHERE motivo='Examen final de Desarrollo de Software' LIMIT 1),       (SELECT id FROM usuarios WHERE email='andres@ito.mx' LIMIT 1),   'creacion',     'Reservación creada'),
  ((SELECT id FROM reservaciones WHERE motivo='Congreso regional de tecnología e innovación' LIMIT 1), (SELECT id FROM usuarios WHERE email='patricia@ito.mx' LIMIT 1), 'creacion',     'Reservación creada');