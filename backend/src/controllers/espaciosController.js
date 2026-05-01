const pool = require('../models/db');

const listarEspacios = async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT e.*, te.nombre AS tipo_nombre
      FROM espacios e
      LEFT JOIN tipo_espacio te ON e.tipo_espacio_id = te.id
      ORDER BY e.nombre
    `);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

const obtenerEspacio = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT e.*, te.nombre AS tipo_nombre,
        json_agg(json_build_object('id', r.id, 'nombre', r.nombre, 'descripcion', r.descripcion)) AS recursos
      FROM espacios e
      LEFT JOIN tipo_espacio te ON e.tipo_espacio_id = te.id
      LEFT JOIN recursos r ON r.espacio_id = e.id
      WHERE e.id = $1
      GROUP BY e.id, te.nombre
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Espacio no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

const crearEspacio = async (req, res, next) => {
  try {
    const { nombre, capacidad, ubicacion, estado, tipo_espacio_id } = req.body;

    if (!nombre || !capacidad || !tipo_espacio_id) {
      return res.status(400).json({ error: 'Nombre, capacidad y tipo_espacio_id son requeridos' });
    }

    const result = await pool.query(
      'INSERT INTO espacios (nombre, capacidad, ubicacion, estado, tipo_espacio_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [nombre, capacidad, ubicacion, estado || 'disponible', tipo_espacio_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

const actualizarEspacio = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nombre, capacidad, ubicacion, estado, tipo_espacio_id } = req.body;

    const result = await pool.query(
      `UPDATE espacios SET
        nombre = COALESCE($1, nombre),
        capacidad = COALESCE($2, capacidad),
        ubicacion = COALESCE($3, ubicacion),
        estado = COALESCE($4, estado),
        tipo_espacio_id = COALESCE($5, tipo_espacio_id)
      WHERE id = $6 RETURNING *`,
      [nombre, capacidad, ubicacion, estado, tipo_espacio_id, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Espacio no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

const eliminarEspacio = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM espacios WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Espacio no encontrado' });
    }

    res.json({ mensaje: 'Espacio eliminado correctamente' });
  } catch (err) {
    next(err);
  }
};

module.exports = { listarEspacios, obtenerEspacio, crearEspacio, actualizarEspacio, eliminarEspacio };
