const validateHelloQuery = (req, res, next) => {
  const { name } = req.query;

  if (name !== undefined && typeof name !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Name must be a string',
    });
  }

  next();
};

module.exports = { validateHelloQuery };
