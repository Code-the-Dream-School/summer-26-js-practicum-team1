const Joi = require('joi');

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

const toMinutes = (time) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const availabilitySlotSchema = Joi.object({
  dayOfWeek: Joi.string()
    .valid(...DAYS)
    .required()
    .messages({ 'any.only': 'dayOfWeek must be MON through SUN' }),
  startTime: Joi.string()
    .pattern(TIME_PATTERN)
    .required()
    .messages({ 'string.pattern.base': 'startTime must be HH:mm' }),
  endTime: Joi.string()
    .pattern(TIME_PATTERN)
    .required()
    .messages({ 'string.pattern.base': 'endTime must be HH:mm' }),
});

const volunteerPreferencesSchema = Joi.object({
  serviceArea: Joi.string()
    .trim()
    .max(255)
    .allow(null)
    .messages({ 'string.max': 'serviceArea must be at most 255 characters' }),
  availability: Joi.object({
    frequency: Joi.string().valid('WEEKLY').required(),
    slots: Joi.array()
      .items(availabilitySlotSchema)
      .max(14)
      .required()
      .custom((slots, helpers) => {
        for (const slot of slots) {
          if (toMinutes(slot.endTime) <= toMinutes(slot.startTime)) {
            return helpers.message('endTime must be after startTime');
          }
        }

        const byDay = {};
        for (const slot of slots) {
          if (!byDay[slot.dayOfWeek]) {
            byDay[slot.dayOfWeek] = [];
          }
          byDay[slot.dayOfWeek].push(slot);
        }

        for (const daySlots of Object.values(byDay)) {
          const sorted = [...daySlots].sort(
            (a, b) => toMinutes(a.startTime) - toMinutes(b.startTime)
          );
          for (let i = 1; i < sorted.length; i += 1) {
            if (toMinutes(sorted[i].startTime) < toMinutes(sorted[i - 1].endTime)) {
              return helpers.message('availability slots cannot overlap on the same day');
            }
          }
        }

        return slots;
      }),
  })
    .allow(null)
    .messages({ 'object.base': 'availability must be an object or null' }),
  interestIds: Joi.array()
    .items(Joi.number().integer().positive())
    .unique()
    .required()
    .messages({
      'array.unique': 'interestIds must not contain duplicates',
      'any.required': 'interestIds is required',
    }),
}).unknown(false);

module.exports = { volunteerPreferencesSchema, DAYS };
