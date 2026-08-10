const Joi = require('joi');

const updateRequesterProfileSchema = Joi.object({
  phone: Joi.string()
    .trim()
    .max(20)
    .pattern(/^[\d\s()+-]+$/)
    .allow('', null)
    .messages({
      'string.max': 'Phone must be at most 20 characters',
      'string.pattern.base': 'Enter a valid phone number',
    }),

  address: Joi.string().trim().min(3).max(255).allow('', null).messages({
    'string.min': 'Address must be at least 3 characters',
    'string.max': 'Address must be at most 255 characters',
  }),

  city: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .pattern(/^[A-Za-z\s.'-]+$/)
    .allow('', null)
    .messages({
      'string.min': 'City must be at least 2 characters',
      'string.max': 'City must be at most 100 characters',
      'string.pattern.base': 'Enter a valid city name',
    }),

  bio: Joi.string().trim().max(500).allow('', null),

  emergencyContact: Joi.string()
    .trim()
    .max(20)
    .pattern(/^[\d\s()+-]+$/)
    .allow('', null)
    .messages({
      'string.max': 'Phone must be at most 20 characters',
      'string.pattern.base': 'Enter a valid phone number',
    }),
})
  .min(1)
  .messages({
    'object.min': 'No attributes to change were specified.',
  });

module.exports = {
  updateRequesterProfileSchema,
};
