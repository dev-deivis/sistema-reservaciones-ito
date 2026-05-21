const bcrypt = require('bcryptjs');
const pool = require('../models/db');

const getUsuarios = async (req, res, next) => {
  try {
    const { buscar, rol, activo } = req.query;

    let query = 'SELECT id, nombre, email, rol, activo, created_at FROM usuarios WHERE 1=1';
    const params = [];

    if (buscar) {
      params.push(`%${buscar}%`);
      query += ` AND (nombre ILIKE $${params.length} OR email ILIKE $${params.length})`;
    }

    if (rol) {
      params.push(rol);
      query += ` AND rol = $${params.length}`;
    }

    if (activo !== undefined) {
      params.push(activo === 'true');
      query += ` AND activo = $${params.length}`;
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

const getUsuarioById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const usuarioResult = await pool.query(
      'SELECT id, nombre, email, rol, activo, created_at FROM usuarios WHERE id = $1',
      [id]
    );

    if (usuarioResult.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const reservacionesResult = await pool.query(
      `SELECT r.id, r.fecha_inicio, r.fecha_fin, r.estado, r.motivo, e.nombre AS espacio_nombre
       FROM reservaciones r
       JOIN espacios e ON r.espacio_id = e.id
       WHERE r.usuario_id = $1 AND r.estado != 'cancelada'
       ORDER BY r.fecha_inicio DESC`,
      [id]
    );

    res.json({
      ...usuarioResult.rows[0],
      reservaciones_activas: reservacionesResult.rows,
    });
  } catch (err) {
    next(err);
  }
};

const crearUsuario = async (req, res, next) => {
  try {
    const { nombre, email, password, rol } = req.body;

    if (!nombre || !email || !password || !rol) {
      return res.status(400).json({ error: 'nombre, email, password y rol son requeridos' });
    }

    if (!['usuario', 'admin'].includes(rol)) {
      return res.status(400).json({ error: 'rol debe ser "usuario" o "admin"' });
    }

    const duplicado = await pool.query('SELECT id FROM usuarios WHERE email = $1', [email]);
    if (duplicado.rows.length > 0) {
      return res.status(409).json({ error: 'Ya existe una cuenta con ese correo' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const result = await pool.query(
      'INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES ($1, $2, $3, $4) RETURNING id, nombre, email, rol, activo, created_at',
      [nombre, email, password_hash, rol]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

const actualizarUsuario = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nombre, email, rol } = req.body;

    const existe = await pool.query('SELECT id FROM usuarios WHERE id = $1', [id]);
    if (existe.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    if (email) {
      const duplicado = await pool.query('SELECT id FROM usuarios WHERE email = $1 AND id != $2', [email, id]);
      if (duplicado.rows.length > 0) {
        return res.status(409).json({ error: 'Ya existe una cuenta con ese correo' });
      }
    }

    if (rol && !['usuario', 'admin'].includes(rol)) {
      return res.status(400).json({ error: 'rol debe ser "usuario" o "admin"' });
    }

    const result = await pool.query(
      `UPDATE usuarios SET
        nombre = COALESCE($1, nombre),
        email  = COALESCE($2, email),
        rol    = COALESCE($3, rol)
       WHERE id = $4
       RETURNING id, nombre, email, rol, activo, created_at`,
      [nombre || null, email || null, rol || null, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

const toggleActivo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const adminId = req.usuario.id;

    if (String(adminId) === String(id)) {
      return res.status(400).json({ error: 'No puedes desactivar tu propia cuenta' });
    }

    const existe = await pool.query('SELECT id, activo FROM usuarios WHERE id = $1', [id]);
    if (existe.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const nuevoEstado = !existe.rows[0].activo;

    const result = await pool.query(
      'UPDATE usuarios SET activo = $1 WHERE id = $2 RETURNING id, nombre, email, rol, activo',
      [nuevoEstado, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

const eliminarUsuario = async (req, res, next) => {
  try {
    const { id } = req.params;
    const adminId = req.usuario.id;

    if (String(adminId) === String(id)) {
      return res.status(400).json({ error: 'No puedes eliminarte a ti mismo' });
    }

    const existe = await pool.query('SELECT id FROM usuarios WHERE id = $1', [id]);
    if (existe.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const reservacionesActivas = await pool.query(
      "SELECT id FROM reservaciones WHERE usuario_id = $1 AND estado IN ('pendiente', 'confirmada')",
      [id]
    );

    if (reservacionesActivas.rows.length > 0) {
      return res.status(409).json({
        error: `El usuario tiene ${reservacionesActivas.rows.length} reservación(es) activa(s). Cancélalas antes de eliminar el usuario.`,
      });
    }

    await pool.query('DELETE FROM usuarios WHERE id = $1', [id]);
    res.json({ mensaje: 'Usuario eliminado correctamente' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getUsuarios, getUsuarioById, crearUsuario, actualizarUsuario, toggleActivo, eliminarUsuario };
