const pool = require('../models/db');

// GET /api/notificaciones — listar todas las notificaciones del usuario autenticado
const listarNotificaciones = async (req, res, next) => {
  try {
    const usuario_id = req.usuario.id;

    const result = await pool.query(`
      SELECT n.*, r.fecha_inicio, r.fecha_fin, e.nombre AS espacio_nombre
      FROM notificaciones n
      LEFT JOIN reservaciones r ON n.reservacion_id = r.id
      LEFT JOIN espacios e ON r.espacio_id = e.id
      WHERE n.usuario_id = $1
      ORDER BY n.created_at DESC
    `, [usuario_id]);

    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/notificaciones/:id/leer — marcar una notificación como leída
const marcarLeida = async (req, res, next) => {
  try {
    const { id } = req.params;
    const usuario_id = req.usuario.id;

    // Primero verificamos si la notificación existe (sin importar el dueño)
    const existe = await pool.query(
      'SELECT * FROM notificaciones WHERE id = $1',
      [id]
    );

    if (existe.rows.length === 0) {
      return res.status(404).json({ error: 'Notificación no encontrada' });
    }

    // Si existe pero pertenece a otro usuario → 403
    if (existe.rows[0].usuario_id !== usuario_id) {
      return res.status(403).json({ error: 'No tienes permiso para acceder a esta notificación' });
    }

    const result = await pool.query(
      'UPDATE notificaciones SET leida = true WHERE id = $1 RETURNING *',
      [id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

// GET /api/notificaciones/no-leidas — contar y listar notificaciones sin leer del usuario
const noLeidas = async (req, res, next) => {
  try {
    const usuario_id = req.usuario.id;

    const result = await pool.query(`
      SELECT n.*, r.fecha_inicio, r.fecha_fin, e.nombre AS espacio_nombre
      FROM notificaciones n
      LEFT JOIN reservaciones r ON n.reservacion_id = r.id
      LEFT JOIN espacios e ON r.espacio_id = e.id
      WHERE n.usuario_id = $1 AND n.leida = false
      ORDER BY n.created_at DESC
    `, [usuario_id]);

    res.json({
      total: result.rows.length,
      notificaciones: result.rows
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/notificaciones/leer-todas — marcar todas como leídas
const marcarTodasLeidas = async (req, res, next) => {
  try {
    const usuario_id = req.usuario.id;

    await pool.query(
      'UPDATE notificaciones SET leida = true WHERE usuario_id = $1 AND leida = false',
      [usuario_id]
    );

    res.json({ mensaje: 'Todas las notificaciones marcadas como leídas' });
  } catch (err) {
    next(err);
  }
};

module.exports = { listarNotificaciones, marcarLeida, marcarTodasLeidas, noLeidas };