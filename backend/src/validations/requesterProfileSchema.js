const Joi = require('joi');

const updateRequesterProfileSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100),

  phone: Joi.string().trim().max(20).allow('', null),

  dob: Joi.date().iso(),

  gender: Joi.string().valid('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'),

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
