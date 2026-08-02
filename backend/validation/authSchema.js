const Joi = require('joi');

const authSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().trim().required().max(72),
});

module.exports = { authSchema };
