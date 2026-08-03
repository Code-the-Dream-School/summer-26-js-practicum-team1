function notFound(req, res) {
  return res.status(404).json({
    success: false,
    message: 'Route not found',
  });
}

function errorHandler(err, req, res, _next) {
  console.error(err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
}

module.exports = { notFound, errorHandler };
