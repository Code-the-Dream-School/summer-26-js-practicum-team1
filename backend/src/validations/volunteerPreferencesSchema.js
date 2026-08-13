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
}).custom((slot, helpers) => {
  if (slot.endTime <= slot.startTime) {
    return helpers.message('endTime must be after startTime');
  }
  return slot;
});

const slotsDoNotOverlap = (slots, helpers) => {
  const byDay = {};

  for (const slot of slots) {
    const list = byDay[slot.dayOfWeek] || [];
    for (const other of list) {
      const overlaps =
        slot.startTime < other.endTime && other.startTime < slot.endTime;
      if (overlaps) {
        return helpers.message('availability slots cannot overlap on the same day');
      }
    }
    list.push(slot);
    byDay[slot.dayOfWeek] = list;
  }

  return slots;
};

const updatePreferencesSchema = Joi.object({
  serviceArea: Joi.string().trim().max(255).allow('', null),
  availability: Joi.object({
    frequency: Joi.string().valid('WEEKLY').required(),
    slots: Joi.array()
      .items(slotSchema)
      .max(14)
      .required()
      .custom(slotsDoNotOverlap),
  }).allow(null),
  interestIds: Joi.array().items(Joi.number().integer().positive()).required(),
})
  .min(1)
  .messages({
    'object.min': 'No attributes to change were specified.',
  });

module.exports = { updatePreferencesSchema };
