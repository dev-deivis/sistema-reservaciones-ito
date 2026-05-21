const pool = require('../models/db');

const completarReservacionesPasadas = async () => {
  try {
    // Confirmar reservaciones futuras que quedaron en pendiente
    const confirmadas = await pool.query(`
      UPDATE reservaciones
      SET estado = 'confirmada'
      WHERE fecha_fin >= NOW()
        AND estado = 'pendiente'
      RETURNING id
    `);
    if (confirmadas.rowCount > 0) {
      console.log(`[job] ${confirmadas.rowCount} reservación(es) pendientes confirmadas automáticamente`);
    }

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
