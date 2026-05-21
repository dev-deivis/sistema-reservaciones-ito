const jwt = require('jsonwebtoken');
const pool = require('../models/db');

const auth = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de acceso requerido' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const result = await pool.query('SELECT activo FROM usuarios WHERE id = $1', [decoded.id]);
    if (result.rows.length === 0 || result.rows[0].activo === false) {
      return res.status(401).json({ error: 'Cuenta deshabilitada' });
    }

    req.usuario = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Token inválido o expirado' });
  }
};

const authAdmin = (req, res, next) => {
  auth(req, res, () => {
    if (req.usuario.rol !== 'admin') {
      return res.status(403).json({ error: 'Acceso restringido a administradores' });
    }
    next();
  });
};

module.exports = { auth, authAdmin };
