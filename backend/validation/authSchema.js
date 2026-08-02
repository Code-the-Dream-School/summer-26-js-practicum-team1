const Joi = require('joi');

const authSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().trim().required(),
});

module.exports = { authSchema };
