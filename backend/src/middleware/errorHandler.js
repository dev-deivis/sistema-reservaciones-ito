const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${new Date().toISOString()} - ${err.message}`);

  if (err.code === '23505') {
    return res.status(409).json({ error: 'Registro duplicado', detalle: err.detail });
  }

  if (err.code === '23503') {
    return res.status(400).json({ error: 'Referencia inválida', detalle: err.detail });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: err.message || 'Error interno del servidor',
  });
};

module.exports = errorHandler;
