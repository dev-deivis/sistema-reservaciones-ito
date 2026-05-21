const pool = require('../models/db');

const completarReservacionesPasadas = async () => {
  try {
    // Completar reservaciones cuya fecha ya pasó
    const completadas = await pool.query(`
      UPDATE reservaciones
      SET estado = 'completada'
      WHERE fecha_fin < NOW()
        AND estado IN ('confirmada', 'pendiente')
      RETURNING id
    `);
    if (completadas.rowCount > 0) {
      console.log(`[job] ${completadas.rowCount} reservación(es) marcadas como completadas`);
    }
  } catch (err) {
    console.error('[job] Error en job de reservaciones:', err.message);
  }
};

module.exports = completarReservacionesPasadas;
