const Joi = require('joi');

const authSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().max(255).required(),
  password: Joi.string().trim().required().max(72, 'utf8'),
});

const googleAuthSchema = Joi.object({
  idToken: Joi.string().trim().required().messages({
    'any.required': 'Google ID token is required',
    'string.empty': 'Google ID token is required',
  }),
}).unknown(false);

module.exports = { authSchema, googleAuthSchema };
