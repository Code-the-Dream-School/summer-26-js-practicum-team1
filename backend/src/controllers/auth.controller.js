const asyncHandler = require('../utils/asyncHandler');
const { registerSchema } = require('../validations/registerSchema');
const { createRequester } = require('../services/auth.service');

const register = asyncHandler(async (req, res) => {
  const { error, value } = registerSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      details: error.details.map((d) => ({
        field: d.path[0],
        message: d.message,
      })),
    });
  }

  const user = await createRequester(value);

  return res.status(201).json({
    success: true,
    data: {
      id: user.id,
      name: user.name,
      role: user.role.toLowerCase(),
    },
  });
});

module.exports = { register };
