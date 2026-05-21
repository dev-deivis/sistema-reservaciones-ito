const express = require('express');
const router = express.Router();
const { auth, authAdmin } = require('../middleware/auth');
const {
  getUsuarios,
  getUsuarioById,
  crearUsuario,
  actualizarUsuario,
  toggleActivo,
  eliminarUsuario,
  cambiarPassword,
} = require('../controllers/usuariosController');

router.get('/', authAdmin, getUsuarios);
router.get('/:id', authAdmin, getUsuarioById);
router.post('/', authAdmin, crearUsuario);
router.put('/:id', authAdmin, actualizarUsuario);
router.patch('/:id/activo', authAdmin, toggleActivo);
router.patch('/:id/password', auth, cambiarPassword);
router.delete('/:id', authAdmin, eliminarUsuario);

module.exports = router;
