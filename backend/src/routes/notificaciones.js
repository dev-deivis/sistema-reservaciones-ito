const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { listarNotificaciones, marcarLeida, marcarTodasLeidas, noLeidas } = require('../controllers/notificacionesController');

router.get('/', auth, listarNotificaciones);
router.get('/no-leidas', auth, noLeidas);          // <-- ruta nueva
router.patch('/:id/leer', auth, marcarLeida);
router.patch('/leer-todas', auth, marcarTodasLeidas);

module.exports = router;