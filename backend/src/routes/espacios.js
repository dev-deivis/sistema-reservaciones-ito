const express = require('express');
const router = express.Router();
const { auth, authAdmin } = require('../middleware/auth');
const {
  listarEspacios, obtenerEspacio, crearEspacio, actualizarEspacio, eliminarEspacio
} = require('../controllers/espaciosController');

//router.get('/', auth, listarEspacios);//
router.get('/', listarEspacios);
router.get('/:id', auth, obtenerEspacio);
router.post('/', authAdmin, crearEspacio);
router.put('/:id', authAdmin, actualizarEspacio);
router.delete('/:id', authAdmin, eliminarEspacio);

module.exports = router;
