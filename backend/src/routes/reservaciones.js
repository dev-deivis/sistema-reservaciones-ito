const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  crearReservacion, listarReservaciones, obtenerReservacion,
  cancelarReservacion, modificarReservacion
} = require('../controllers/reservacionesController');

router.get('/', auth, listarReservaciones);
router.get('/:id', auth, obtenerReservacion);
router.post('/', auth, crearReservacion);
router.put('/:id', auth, modificarReservacion);
router.patch('/:id/cancelar', auth, cancelarReservacion);

module.exports = router;
