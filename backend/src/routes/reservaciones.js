const express = require('express');
const router = express.Router();
const { auth, authAdmin } = require('../middleware/auth');
const {
  crearReservacion, listarTodasReservaciones, listarMisReservaciones, obtenerReservacion,
  cancelarReservacion, modificarReservacion
} = require('../controllers/reservacionesController');

router.get('/', authAdmin, listarTodasReservaciones);
router.get('/mis-reservaciones', auth, listarMisReservaciones);
router.get('/:id', auth, obtenerReservacion);
router.post('/', auth, crearReservacion);
router.put('/:id', auth, modificarReservacion);
router.patch('/:id/cancelar', auth, cancelarReservacion);

module.exports = router;
