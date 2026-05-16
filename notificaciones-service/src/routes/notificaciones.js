const express = require('express');
const router = express.Router();
const {
  listarNotificaciones,
  noLeidas,
  crearNotificacion,
  marcarLeida,
  marcarTodasLeidas,
} = require('../controllers/notificacionesController');

// Rutas estáticas primero para que Express no las interprete como parámetros
router.get('/no-leidas', noLeidas);
router.patch('/leer-todas', marcarTodasLeidas);

router.get('/', listarNotificaciones);
router.post('/', crearNotificacion);
router.patch('/:id/leer', marcarLeida);

module.exports = router;
