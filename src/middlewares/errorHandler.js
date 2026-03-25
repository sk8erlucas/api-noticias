function errorHandler(err, req, res, next) {
  console.error('[Error]', err.message || err);

  const status = err.status || err.statusCode || 500;
  const message = status < 500 ? err.message : 'Error interno del servidor';

  const body = { error: message };
  if (process.env.NODE_ENV === 'development') {
    body.stack = err.stack;
  }

  res.status(status).json(body);
}

module.exports = errorHandler;
