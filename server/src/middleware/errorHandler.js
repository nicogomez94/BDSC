export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      error: 'La imagen supera el tamaño máximo permitido (5MB).',
    });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Error de validación',
      details: err.message,
    });
  }

  if (err.code === 'P2002') {
    return res.status(409).json({
      error: 'Ya existe un registro con estos datos',
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      error: 'Registro no encontrado',
    });
  }

  res.status(err.status || 500).json({
    error: err.message || 'Error interno del servidor',
  });
};
