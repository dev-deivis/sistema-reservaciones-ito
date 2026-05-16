require('dotenv').config();
const express = require('express');
const cors = require('cors');
const notificacionesRoutes = require('./src/routes/notificaciones');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/notificaciones', notificacionesRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'OK', servicio: 'notificaciones', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`[notificaciones-service] corriendo en http://localhost:${PORT}`);
});
