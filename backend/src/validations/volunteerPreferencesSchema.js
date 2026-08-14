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
        return helpers.message(
          'availability slots cannot overlap on the same day'
        );
      }
    }
    list.push(slot);
    byDay[slot.dayOfWeek] = list;
  }

  return slots;
};

const updatePreferencesSchema = Joi.object({
  serviceArea: Joi.string().trim().max(255).allow('', null),
  serviceLatitude: Joi.number().min(-90).max(90).allow(null),
  serviceLongitude: Joi.number().min(-180).max(180).allow(null),
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
  .custom((value, helpers) => {
    const hasLabel = value.serviceArea != null && value.serviceArea !== '';
    const hasLat = value.serviceLatitude != null;
    const hasLng = value.serviceLongitude != null;
    const clearing =
      value.serviceArea === null &&
      value.serviceLatitude === null &&
      value.serviceLongitude === null;

    if (clearing) {
      return value;
    }

    const anyLocationField =
      value.serviceArea !== undefined ||
      value.serviceLatitude !== undefined ||
      value.serviceLongitude !== undefined;

    if (!anyLocationField) {
      return value;
    }

    if (hasLabel && hasLat && hasLng) {
      return value;
    }

    return helpers.message(
      'serviceArea, serviceLatitude, and serviceLongitude must be set together'
    );
  })
  .messages({
    'object.min': 'No attributes to change were specified.',
  });

module.exports = { updatePreferencesSchema };
