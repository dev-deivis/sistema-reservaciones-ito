require('dotenv').config();
const express = require('express');
const cors = require('cors');
const errorHandler = require('./src/middleware/errorHandler');
const completarReservaciones = require('./src/jobs/completarReservaciones');

const espaciosRoutes = require('./src/routes/espacios');
const reservacionesRoutes = require('./src/routes/reservaciones');
const disponibilidadRoutes = require('./src/routes/disponibilidad');
const notificacionesRoutes = require('./src/routes/notificaciones');
const authRoutes = require('./src/routes/auth');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/espacios', espaciosRoutes);
app.use('/api/reservaciones', reservacionesRoutes);
app.use('/api/disponibilidad', disponibilidadRoutes);
app.use('/api/notificaciones', notificacionesRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);

  // Ejecutar al arrancar para limpiar reservaciones pasadas desde antes
  completarReservaciones();
  // Repetir cada 5 minutos
  setInterval(completarReservaciones, 5 * 60 * 1000);
});
