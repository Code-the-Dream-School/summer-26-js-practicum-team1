const validate =
  (schema, source = 'body') =>
  (req, res, next) => {
    const { error, value } = schema.validate(req[source], { abortEarly: false });

    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map((detail) => ({
          field: detail.path[0],
          message: detail.message,
        })),
      });
    }

    req[source] = value;
    next();
  };

module.exports = validate;
