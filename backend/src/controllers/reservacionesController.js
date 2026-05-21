const pool = require('../models/db');
const axios = require('axios');

const NOTIF_URL = process.env.NOTIF_SERVICE_URL || 'http://localhost:3001';

const validarHorarioReservacion = (fecha_inicio, fecha_fin) => {
  const inicio = new Date(fecha_inicio);
  const fin = new Date(fecha_fin);

  const dia = inicio.getDay();
  if (dia === 0 || dia === 6) {
    return { status: 400, error: 'Solo se pueden hacer reservaciones de lunes a viernes' };
  }

  const horaInicio = inicio.getHours();
  if (horaInicio < 7 || horaInicio >= 20) {
    return { status: 400, error: 'Las reservaciones solo pueden ser entre 7:00 AM y 8:00 PM' };
  }

  const horaFin = fin.getHours();
  if (horaFin > 20) {
    return { status: 400, error: 'La reservación no puede terminar después de las 8:00 PM' };
  }

  const diffMinutos = (fin - inicio) / (1000 * 60);
  if (diffMinutos < 30) {
    return { status: 400, error: 'La reservación debe tener una duración mínima de 30 minutos' };
  }
  if (diffMinutos > 480) {
    return { status: 400, error: 'La reservación no puede durar más de 8 horas' };
  }

  return null;
};

const notificar = async (payload) => {
  try {
    await axios.post(`${NOTIF_URL}/api/notificaciones`, payload);
  } catch {
    console.warn('[reservaciones] microservicio de notificaciones no disponible — se omite notificación');
  }
};

const crearReservacion = async (req, res, next) => {
  try {
    const { espacio_id, fecha_inicio, fecha_fin, motivo } = req.body;
    const usuario_id = req.usuario.id;

    if (!espacio_id || !fecha_inicio || !fecha_fin) {
      return res.status(400).json({ error: 'espacio_id, fecha_inicio y fecha_fin son requeridos' });
    }

    if (new Date(fecha_inicio) >= new Date(fecha_fin)) {
      return res.status(400).json({ error: 'fecha_inicio debe ser anterior a fecha_fin' });
    }

    const errHorario = validarHorarioReservacion(fecha_inicio, fecha_fin);
    if (errHorario) {
      return res.status(errHorario.status).json({ error: errHorario.error });
    }

    // Verificar conflictos
    const conflicto = await pool.query(`
      SELECT id FROM reservaciones
      WHERE espacio_id = $1
        AND estado NOT IN ('cancelada')
        AND (fecha_inicio, fecha_fin) OVERLAPS ($2::timestamp, $3::timestamp)
    `, [espacio_id, fecha_inicio, fecha_fin]);

    if (conflicto.rows.length > 0) {
      return res.status(409).json({ error: 'El espacio ya está reservado en ese horario' });
    }

    // Verificar horarios bloqueados
    const bloqueado = await pool.query(`
      SELECT id FROM horarios_bloqueados
      WHERE espacio_id = $1
        AND (fecha_inicio, fecha_fin) OVERLAPS ($2::timestamp, $3::timestamp)
    `, [espacio_id, fecha_inicio, fecha_fin]);

    if (bloqueado.rows.length > 0) {
      return res.status(409).json({ error: 'El espacio está bloqueado en ese horario' });
    }

    const result = await pool.query(
      `INSERT INTO reservaciones (usuario_id, espacio_id, fecha_inicio, fecha_fin, estado, motivo)
       VALUES ($1, $2, $3, $4, 'confirmada', $5) RETURNING *`,
      [usuario_id, espacio_id, fecha_inicio, fecha_fin, motivo]
    );

    const reservacion = result.rows[0];

    // Crear notificación vía microservicio (fire-and-forget, no bloquea el flujo)
    await notificar({
      usuario_id,
      reservacion_id: reservacion.id,
      tipo: 'confirmacion',
      mensaje: `Tu reservación para el ${fecha_inicio} fue confirmada exitosamente`,
    });

    // Registrar en historial
    await pool.query(
      `INSERT INTO historial_cambios (reservacion_id, usuario_id, accion, detalle)
       VALUES ($1, $2, 'creacion', 'Reservación creada')`,
      [reservacion.id, usuario_id]
    );

    res.status(201).json(reservacion);
  } catch (err) {
    next(err);
  }
};

const listarTodasReservaciones = async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT r.*, u.nombre AS usuario_nombre, e.nombre AS espacio_nombre
      FROM reservaciones r
      JOIN usuarios u ON r.usuario_id = u.id
      JOIN espacios e ON r.espacio_id = e.id
      ORDER BY r.fecha_inicio DESC
    `);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

const listarMisReservaciones = async (req, res, next) => {
  try {
    const usuario_id = req.usuario.id;

    const result = await pool.query(`
      SELECT r.*, u.nombre AS usuario_nombre, e.nombre AS espacio_nombre
      FROM reservaciones r
      JOIN usuarios u ON r.usuario_id = u.id
      JOIN espacios e ON r.espacio_id = e.id
      WHERE r.usuario_id = $1
      ORDER BY r.fecha_inicio DESC
    `, [usuario_id]);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

const obtenerReservacion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { id: usuario_id, rol } = req.usuario;

    const result = await pool.query(`
      SELECT r.*, u.nombre AS usuario_nombre, e.nombre AS espacio_nombre
      FROM reservaciones r
      JOIN usuarios u ON r.usuario_id = u.id
      JOIN espacios e ON r.espacio_id = e.id
      WHERE r.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Reservación no encontrada' });
    }

    const reservacion = result.rows[0];

    if (rol !== 'admin' && reservacion.usuario_id !== usuario_id) {
      return res.status(403).json({ error: 'No tienes permiso para ver esta reservación' });
    }

    res.json(reservacion);
  } catch (err) {
    next(err);
  }
};

const cancelarReservacion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { id: usuario_id, rol } = req.usuario;

    const reservacion = await pool.query('SELECT * FROM reservaciones WHERE id = $1', [id]);

    if (reservacion.rows.length === 0) {
      return res.status(404).json({ error: 'Reservación no encontrada' });
    }

    const res_data = reservacion.rows[0];

    if (rol !== 'admin' && res_data.usuario_id !== usuario_id) {
      return res.status(403).json({ error: 'No tienes permiso para cancelar esta reservación' });
    }

    if (res_data.estado === 'cancelada') {
      return res.status(400).json({ error: 'La reservación ya está cancelada' });
    }

    const result = await pool.query(
      "UPDATE reservaciones SET estado = 'cancelada' WHERE id = $1 RETURNING *",
      [id]
    );

    await pool.query(
      `INSERT INTO historial_cambios (reservacion_id, usuario_id, accion, detalle)
       VALUES ($1, $2, 'cancelacion', 'Reservación cancelada')`,
      [id, usuario_id]
    );

    await notificar({
      usuario_id: res_data.usuario_id,
      reservacion_id: id,
      tipo: 'cancelacion',
      mensaje: 'Tu reservación ha sido cancelada',
    });

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

const modificarReservacion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { fecha_inicio, fecha_fin, motivo } = req.body;
    const { id: usuario_id, rol } = req.usuario;

    const reservacion = await pool.query('SELECT * FROM reservaciones WHERE id = $1', [id]);

    if (reservacion.rows.length === 0) {
      return res.status(404).json({ error: 'Reservación no encontrada' });
    }

    const res_data = reservacion.rows[0];

    if (rol !== 'admin' && res_data.usuario_id !== usuario_id) {
      return res.status(403).json({ error: 'No tienes permiso para modificar esta reservación' });
    }

    if (res_data.estado === 'cancelada') {
      return res.status(400).json({ error: 'No se puede modificar una reservación cancelada' });
    }

    const nueva_inicio = fecha_inicio || res_data.fecha_inicio;
    const nueva_fin = fecha_fin || res_data.fecha_fin;

    if (new Date(nueva_inicio) >= new Date(nueva_fin)) {
      return res.status(400).json({ error: 'fecha_inicio debe ser anterior a fecha_fin' });
    }

    const errHorario = validarHorarioReservacion(nueva_inicio, nueva_fin);
    if (errHorario) {
      return res.status(errHorario.status).json({ error: errHorario.error });
    }

    const conflicto = await pool.query(`
      SELECT id FROM reservaciones
      WHERE espacio_id = $1
        AND id != $2
        AND estado NOT IN ('cancelada')
        AND (fecha_inicio, fecha_fin) OVERLAPS ($3::timestamp, $4::timestamp)
    `, [res_data.espacio_id, id, nueva_inicio, nueva_fin]);

    if (conflicto.rows.length > 0) {
      return res.status(409).json({ error: 'El espacio ya está reservado en ese horario' });
    }

    const bloqueado = await pool.query(`
      SELECT id FROM horarios_bloqueados
      WHERE espacio_id = $1
        AND (fecha_inicio, fecha_fin) OVERLAPS ($2::timestamp, $3::timestamp)
    `, [res_data.espacio_id, nueva_inicio, nueva_fin]);

    if (bloqueado.rows.length > 0) {
      return res.status(409).json({ error: 'El espacio está bloqueado en ese horario' });
    }

    const result = await pool.query(
      `UPDATE reservaciones SET
        fecha_inicio = $1, fecha_fin = $2, motivo = COALESCE($3, motivo)
       WHERE id = $4 RETURNING *`,
      [nueva_inicio, nueva_fin, motivo, id]
    );

    await pool.query(
      `INSERT INTO historial_cambios (reservacion_id, usuario_id, accion, detalle)
       VALUES ($1, $2, 'modificacion', 'Reservación modificada')`,
      [id, usuario_id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

module.exports = { crearReservacion, listarTodasReservaciones, listarMisReservaciones, obtenerReservacion, cancelarReservacion, modificarReservacion };
