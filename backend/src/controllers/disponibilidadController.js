const pool = require('../models/db');

const verificarDisponibilidad = async (req, res, next) => {
  try {
    const { espacio_id, fecha_inicio, fecha_fin } = req.query;

    if (!espacio_id || !fecha_inicio || !fecha_fin) {
      return res.status(400).json({ error: 'espacio_id, fecha_inicio y fecha_fin son requeridos' });
    }

    const espacio = await pool.query('SELECT * FROM espacios WHERE id = $1', [espacio_id]);

    if (espacio.rows.length === 0) {
      return res.status(404).json({ error: 'Espacio no encontrado' });
    }

    if (espacio.rows[0].estado !== 'disponible') {
      return res.json({ disponible: false, razon: 'El espacio no está disponible' });
    }

    const reservaciones = await pool.query(`
      SELECT id, fecha_inicio, fecha_fin FROM reservaciones
      WHERE espacio_id = $1
        AND estado NOT IN ('cancelada')
        AND (fecha_inicio, fecha_fin) OVERLAPS ($2::timestamp, $3::timestamp)
    `, [espacio_id, fecha_inicio, fecha_fin]);

    const bloqueados = await pool.query(`
      SELECT id, fecha_inicio, fecha_fin, razon FROM horarios_bloqueados
      WHERE espacio_id = $1
        AND (fecha_inicio, fecha_fin) OVERLAPS ($2::timestamp, $3::timestamp)
    `, [espacio_id, fecha_inicio, fecha_fin]);

    if (reservaciones.rows.length > 0 || bloqueados.rows.length > 0) {
      return res.json({
        disponible: false,
        conflictos: {
          reservaciones: reservaciones.rows,
          bloqueados: bloqueados.rows,
        },
      });
    }

    res.json({ disponible: true });
  } catch (err) {
    next(err);
  }
};

const disponibilidadEspacios = async (req, res, next) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;

    if (!fecha_inicio || !fecha_fin) {
      return res.status(400).json({ error: 'fecha_inicio y fecha_fin son requeridos' });
    }

    const result = await pool.query(`
      SELECT e.id, e.nombre, e.capacidad, e.ubicacion,
        CASE
          WHEN e.estado != 'disponible' THEN false
          WHEN EXISTS (
            SELECT 1 FROM reservaciones r
            WHERE r.espacio_id = e.id
              AND r.estado NOT IN ('cancelada')
              AND (r.fecha_inicio, r.fecha_fin) OVERLAPS ($1::timestamp, $2::timestamp)
          ) THEN false
          WHEN EXISTS (
            SELECT 1 FROM horarios_bloqueados hb
            WHERE hb.espacio_id = e.id
              AND (hb.fecha_inicio, hb.fecha_fin) OVERLAPS ($1::timestamp, $2::timestamp)
          ) THEN false
          ELSE true
        END AS disponible
      FROM espacios e
      ORDER BY e.nombre
    `, [fecha_inicio, fecha_fin]);

    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

module.exports = { verificarDisponibilidad, disponibilidadEspacios };
