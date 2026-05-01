const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { verificarDisponibilidad, disponibilidadEspacios } = require('../controllers/disponibilidadController');

router.get('/espacio', auth, verificarDisponibilidad);
router.get('/espacios', auth, disponibilidadEspacios);

module.exports = router;
