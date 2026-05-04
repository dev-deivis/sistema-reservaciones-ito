const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { horariosPorFecha, verificar, disponibilidadEspacios } = require('../controllers/disponibilidadController');

// GET /api/disponibilidad/espacios?fecha_inicio=&fecha_fin=
// Debe ir antes de /:espacioId para que Express no lo interprete como un param
router.get('/espacios', auth, disponibilidadEspacios);

// POST /api/disponibilidad/verificar
router.post('/verificar', auth, verificar);

// GET /api/disponibilidad/:espacioId?fecha=YYYY-MM-DD
router.get('/:espacioId', auth, horariosPorFecha);

module.exports = router;
