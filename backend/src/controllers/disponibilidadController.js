const pool = require('../models/db');

// GET /api/disponibilidad/:espacioId?fecha=YYYY-MM-DD
// Devuelve todos los bloques ocupados (reservaciones + horarios bloqueados) de un espacio en una fecha
const horariosPorFecha = async (req, res, next) => {
  try {
    const { espacioId } = req.params;
    const { fecha } = req.query;

    if (!fecha) {
      return res.status(400).json({ error: 'El parámetro fecha es requerido (formato YYYY-MM-DD)' });
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      return res.status(400).json({ error: 'Formato de fecha inválido, usa YYYY-MM-DD' });
    }

    const espacio = await pool.query(
      'SELECT id, nombre, estado FROM espacios WHERE id = $1',
      [espacioId]
    );

    if (espacio.rows.length === 0) {
      return res.status(404).json({ error: 'Espacio no encontrado' });
    }

    // Rango completo del día solicitado
    const inicioDia = `${fecha} 00:00:00`;
    const finDia = `${fecha} 23:59:59`;

    const reservaciones = await pool.query(`
      SELECT
        r.id,
        r.fecha_inicio,
        r.fecha_fin,
        r.estado,
        r.motivo,
        u.nombre AS reservado_por
      FROM reservaciones r
      JOIN usuarios u ON r.usuario_id = u.id
      WHERE r.espacio_id = $1
        AND r.estado NOT IN ('cancelada')
        AND (r.fecha_inicio, r.fecha_fin) OVERLAPS ($2::timestamp, $3::timestamp)
      ORDER BY r.fecha_inicio
    `, [espacioId, inicioDia, finDia]);

    const bloqueados = await pool.query(`
      SELECT
        id,
        fecha_inicio,
        fecha_fin,
        razon
      FROM horarios_bloqueados
      WHERE espacio_id = $1
        AND (fecha_inicio, fecha_fin) OVERLAPS ($2::timestamp, $3::timestamp)
      ORDER BY fecha_inicio
    `, [espacioId, inicioDia, finDia]);

    res.json({
      espacio: espacio.rows[0],
      fecha,
      ocupado: reservaciones.rows.length > 0 || bloqueados.rows.length > 0,
      reservaciones: reservaciones.rows,
      bloqueados: bloqueados.rows,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/disponibilidad/verificar
// Body: { espacioId, fecha_inicio, fecha_fin }
// Verifica si hay conflicto en el rango exacto solicitado
const verificar = async (req, res, next) => {
  try {
    const { espacioId, fecha_inicio, fecha_fin } = req.body;

    if (!espacioId || !fecha_inicio || !fecha_fin) {
      return res.status(400).json({ error: 'espacioId, fecha_inicio y fecha_fin son requeridos' });
    }

    if (new Date(fecha_inicio) >= new Date(fecha_fin)) {
      return res.status(400).json({ error: 'fecha_inicio debe ser anterior a fecha_fin' });
    }

    if (new Date(fecha_inicio) <= new Date()) {
      return res.status(400).json({ error: 'No se puede verificar disponibilidad en una fecha u hora que ya pasó' });
    }

    const espacio = await pool.query(
      'SELECT id, nombre, estado FROM espacios WHERE id = $1',
      [espacioId]
    );

    if (espacio.rows.length === 0) {
      return res.status(404).json({ error: 'Espacio no encontrado' });
    }

    if (espacio.rows[0].estado !== 'disponible') {
      return res.json({
        disponible: false,
        razon: `El espacio está en estado "${espacio.rows[0].estado}"`,
      });
    }

    const reservaciones = await pool.query(`
      SELECT
        r.id,
        r.fecha_inicio,
        r.fecha_fin,
        r.estado,
        u.nombre AS reservado_por
      FROM reservaciones r
      JOIN usuarios u ON r.usuario_id = u.id
      WHERE r.espacio_id = $1
        AND r.estado NOT IN ('cancelada')
        AND (r.fecha_inicio, r.fecha_fin) OVERLAPS ($2::timestamp, $3::timestamp)
      ORDER BY r.fecha_inicio
    `, [espacioId, fecha_inicio, fecha_fin]);

    const bloqueados = await pool.query(`
      SELECT
        id,
        fecha_inicio,
        fecha_fin,
        razon
      FROM horarios_bloqueados
      WHERE espacio_id = $1
        AND (fecha_inicio, fecha_fin) OVERLAPS ($2::timestamp, $3::timestamp)
      ORDER BY fecha_inicio
    `, [espacioId, fecha_inicio, fecha_fin]);

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

// GET /api/disponibilidad/espacios?fecha_inicio=&fecha_fin=
// Devuelve todos los espacios con su estado de disponibilidad en un rango
const disponibilidadEspacios = async (req, res, next) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;

    if (!fecha_inicio || !fecha_fin) {
      return res.status(400).json({ error: 'fecha_inicio y fecha_fin son requeridos' });
    }

    if (new Date(fecha_inicio) >= new Date(fecha_fin)) {
      return res.status(400).json({ error: 'fecha_inicio debe ser anterior a fecha_fin' });
    }

    const result = await pool.query(`
      SELECT
        e.id,
        e.nombre,
        e.capacidad,
        e.ubicacion,
        e.estado,
        te.nombre AS tipo,
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
      LEFT JOIN tipo_espacio te ON e.tipo_espacio_id = te.id
      ORDER BY e.nombre
    `, [fecha_inicio, fecha_fin]);

    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

module.exports = { horariosPorFecha, verificar, disponibilidadEspacios };
