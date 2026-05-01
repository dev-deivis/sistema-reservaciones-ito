const pool = require('../models/db');

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

const marcarLeida = async (req, res, next) => {
  try {
    const { id } = req.params;
    const usuario_id = req.usuario.id;

    const result = await pool.query(
      'UPDATE notificaciones SET leida = true WHERE id = $1 AND usuario_id = $2 RETURNING *',
      [id, usuario_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Notificación no encontrada' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

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

module.exports = { listarNotificaciones, marcarLeida, marcarTodasLeidas };
