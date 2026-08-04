const Joi = require('joi');

const authSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().max(255).required(),
  password: Joi.string().trim().required().max(72, 'utf8'),
});

module.exports = { authSchema };
