-- Seeds de datos de prueba
-- IMPORTANTE: Las contraseñas son hasheadas con bcrypt
-- password -> hash bcrypt
-- password -> hash bcrypt

-- Tipos de espacio
INSERT INTO tipo_espacio (nombre, descripcion) VALUES
  ('Aula', 'Sala de clases estándar con pizarrón y pupitres'),
  ('Laboratorio', 'Laboratorio equipado con computadoras o equipo especializado'),
  ('Auditorio', 'Espacio grande para eventos y presentaciones')
ON CONFLICT DO NOTHING;

-- Usuarios (contraseñas hasheadas con bcrypt rounds=10)
-- password
INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES
  ('Administrador ITO', 'admin@ito.mx', '$2a$10$C433KLZ1DH/30WJ1WWcsKuIlmLi1ICM13FqrMZ0i1FFBYttisdkmm', 'admin'),
  ('Juan Pérez García', 'juan@ito.mx', '$2a$10$C433KLZ1DH/30WJ1WWcsKuIlmLi1ICM13FqrMZ0i1FFBYttisdkmm', 'usuario')
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
  ('Proyector', 'Proyector BenQ', 2),
  ('Computadoras', '30 equipos Dell con Windows 11', 3),
  ('Switch de red', 'Switch administrable 48 puertos', 4),
  ('Sistema de sonido', 'Bocinas y micrófono inalámbrico', 5),
  ('Proyector', 'Proyector 4K para presentaciones', 5)
ON CONFLICT DO NOTHING;
