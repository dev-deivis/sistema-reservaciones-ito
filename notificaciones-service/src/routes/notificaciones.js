const express = require('express');
const router = express.Router();
const {
  listarNotificaciones,
  noLeidas,
  crearNotificacion,
  marcarLeida,
  marcarTodasLeidas,
} = require('../controllers/notificacionesController');

const validarClaveInterna = (req, res, next) => {
  const clave = req.headers['x-internal-key'];
  if (!clave || clave !== (process.env.INTERNAL_API_KEY || 'secret_key_interna')) {
    return res.status(401).json({ error: 'No autorizado' });
  }
  next();
};

// Rutas estáticas primero para que Express no las interprete como parámetros
router.get('/no-leidas', noLeidas);
router.patch('/leer-todas', marcarTodasLeidas);

router.get('/', listarNotificaciones);
router.post('/', validarClaveInterna, crearNotificacion);
router.patch('/:id/leer', marcarLeida);

module.exports = router;
