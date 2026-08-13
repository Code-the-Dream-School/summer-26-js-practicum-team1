const Joi = require('joi');

const dayOfWeek = Joi.string().valid(
  'MON',
  'TUE',
  'WED',
  'THU',
  'FRI',
  'SAT',
  'SUN'
);

const slotSchema = Joi.object({
  dayOfWeek: dayOfWeek.required(),
  startTime: Joi.string()
    .pattern(/^\d{2}:\d{2}$/)
    .required(),
  endTime: Joi.string()
    .pattern(/^\d{2}:\d{2}$/)
    .required(),
});

const updatePreferencesSchema = Joi.object({
  serviceArea: Joi.string().trim().max(255).allow('', null),
  availability: Joi.object({
    frequency: Joi.string().valid('WEEKLY').required(),
    slots: Joi.array().items(slotSchema).max(14).required(),
  }).allow(null),
  interestIds: Joi.array().items(Joi.number().integer().positive()).required(),
})
  .min(1)
  .messages({
    'object.min': 'No attributes to change were specified.',
  });

module.exports = { updatePreferencesSchema };
