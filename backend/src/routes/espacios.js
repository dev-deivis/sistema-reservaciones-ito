const express = require('express');
const router = express.Router();
const { auth, authAdmin } = require('../middleware/auth');
const {
  listarEspacios, obtenerEspacio, crearEspacio, actualizarEspacio, eliminarEspacio,
  obtenerRecursosDeEspacio, getTiposEspacio
} = require('../controllers/espaciosController');

router.get('/', auth, listarEspacios);
router.get('/tipos', auth, getTiposEspacio);
router.get('/:id', auth, obtenerEspacio);
router.get('/:id/recursos', auth, obtenerRecursosDeEspacio);
//router.get('/:id/recursos', auth, obtenerRecursosDeEspacio);

router.post('/', authAdmin, crearEspacio);
router.put('/:id', authAdmin, actualizarEspacio);
router.delete('/:id', authAdmin, eliminarEspacio);

module.exports = router;
