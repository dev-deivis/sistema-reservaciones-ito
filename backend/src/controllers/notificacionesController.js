const axios = require('axios');

const NOTIF_URL = process.env.NOTIF_SERVICE_URL || 'http://localhost:3001';

// GET /api/notificaciones
const listarNotificaciones = async (req, res, next) => {
  try {
    const { data } = await axios.get(`${NOTIF_URL}/api/notificaciones`, {
      params: { usuario_id: req.usuario.id },
    });
    res.json(data);
  } catch (err) {
    next(err);
  }
};

// GET /api/notificaciones/no-leidas
const noLeidas = async (req, res, next) => {
  try {
    const { data } = await axios.get(`${NOTIF_URL}/api/notificaciones/no-leidas`, {
      params: { usuario_id: req.usuario.id },
    });
    res.json(data);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/notificaciones/:id/leer
const marcarLeida = async (req, res, next) => {
  try {
    const { data } = await axios.patch(
      `${NOTIF_URL}/api/notificaciones/${req.params.id}/leer`,
      { usuario_id: req.usuario.id }
    );
    res.json(data);
  } catch (err) {
    if (err.response) {
      return res.status(err.response.status).json(err.response.data);
    }
    next(err);
  }
};

// PATCH /api/notificaciones/leer-todas
const marcarTodasLeidas = async (req, res, next) => {
  try {
    const { data } = await axios.patch(`${NOTIF_URL}/api/notificaciones/leer-todas`, null, {
      params: { usuario_id: req.usuario.id },
    });
    res.json(data);
  } catch (err) {
    next(err);
  }
};

module.exports = { listarNotificaciones, marcarLeida, marcarTodasLeidas, noLeidas };
