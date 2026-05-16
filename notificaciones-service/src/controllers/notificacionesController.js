const pool = require('../models/db');

// GET /api/notificaciones?usuario_id=X
const listarNotificaciones = async (req, res) => {
  const { usuario_id } = req.query;

  if (!usuario_id) {
    return res.status(400).json({ error: 'usuario_id es requerido' });
  }

  try {
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
    console.error('[notificaciones-service] listarNotificaciones:', err.message);
    res.status(500).json({ error: 'Error interno del microservicio' });
  }
};

// GET /api/notificaciones/no-leidas?usuario_id=X
const noLeidas = async (req, res) => {
  const { usuario_id } = req.query;

  if (!usuario_id) {
    return res.status(400).json({ error: 'usuario_id es requerido' });
  }

  try {
    const result = await pool.query(`
      SELECT n.*, r.fecha_inicio, r.fecha_fin, e.nombre AS espacio_nombre
      FROM notificaciones n
      LEFT JOIN reservaciones r ON n.reservacion_id = r.id
      LEFT JOIN espacios e ON r.espacio_id = e.id
      WHERE n.usuario_id = $1 AND n.leida = false
      ORDER BY n.created_at DESC
    `, [usuario_id]);

    res.json({ total: result.rows.length, notificaciones: result.rows });
  } catch (err) {
    console.error('[notificaciones-service] noLeidas:', err.message);
    res.status(500).json({ error: 'Error interno del microservicio' });
  }
};

// POST /api/notificaciones
// Body: { usuario_id, reservacion_id, tipo, mensaje }
const crearNotificacion = async (req, res) => {
  const { usuario_id, reservacion_id, tipo, mensaje } = req.body;

  if (!usuario_id || !tipo || !mensaje) {
    return res.status(400).json({ error: 'usuario_id, tipo y mensaje son requeridos' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO notificaciones (usuario_id, reservacion_id, tipo, mensaje)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [usuario_id, reservacion_id || null, tipo, mensaje]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('[notificaciones-service] crearNotificacion:', err.message);
    res.status(500).json({ error: 'Error interno del microservicio' });
  }
};

// PATCH /api/notificaciones/:id/leer
// Body: { usuario_id }
const marcarLeida = async (req, res) => {
  const { id } = req.params;
  const { usuario_id } = req.body;

  if (!usuario_id) {
    return res.status(400).json({ error: 'usuario_id es requerido en el body' });
  }

  try {
    const existe = await pool.query(
      'SELECT * FROM notificaciones WHERE id = $1',
      [id]
    );

    if (existe.rows.length === 0) {
      return res.status(404).json({ error: 'Notificación no encontrada' });
    }

    if (String(existe.rows[0].usuario_id) !== String(usuario_id)) {
      return res.status(403).json({ error: 'No tienes permiso para acceder a esta notificación' });
    }

    const result = await pool.query(
      'UPDATE notificaciones SET leida = true WHERE id = $1 RETURNING *',
      [id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error('[notificaciones-service] marcarLeida:', err.message);
    res.status(500).json({ error: 'Error interno del microservicio' });
  }
};

// PATCH /api/notificaciones/leer-todas?usuario_id=X
const marcarTodasLeidas = async (req, res) => {
  const { usuario_id } = req.query;

  if (!usuario_id) {
    return res.status(400).json({ error: 'usuario_id es requerido' });
  }

  try {
    await pool.query(
      'UPDATE notificaciones SET leida = true WHERE usuario_id = $1 AND leida = false',
      [usuario_id]
    );

    res.json({ mensaje: 'Todas las notificaciones marcadas como leídas' });
  } catch (err) {
    console.error('[notificaciones-service] marcarTodasLeidas:', err.message);
    res.status(500).json({ error: 'Error interno del microservicio' });
  }
};

module.exports = { listarNotificaciones, noLeidas, crearNotificacion, marcarLeida, marcarTodasLeidas };
