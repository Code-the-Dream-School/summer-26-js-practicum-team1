const Joi = require('joi');

const updateRequesterProfileSchema = Joi.object({
  phone: Joi.string().trim().max(20).allow('', null),

  address: Joi.string().trim().max(255).allow('', null),

  city: Joi.string().trim().max(100).allow('', null),

  bio: Joi.string().trim().max(500).allow('', null),

  emergencyContact: Joi.string().trim().max(255).allow('', null),
})
  .min(1)
  .messages({
    'object.min': 'No attributes to change were specified.',
  });

module.exports = {
  updateRequesterProfileSchema,
};
