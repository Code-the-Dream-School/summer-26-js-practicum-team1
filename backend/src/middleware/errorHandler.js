const errorHandler = (err, req, res, _next) => {
  console.error(err.stack);

  const status = err.status || 500;
  const message = status === 500 ? 'Something went wrong' : err.message;

  res.status(status).json({
    success: false,
    message,
  });
};

module.exports = errorHandler;
