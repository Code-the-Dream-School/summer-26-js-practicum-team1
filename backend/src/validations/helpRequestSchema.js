const Joi = require('joi');

const createHelpRequestSchema = Joi.object({
  title: Joi.string().trim().min(1).max(100).required().messages({
    'string.empty': 'Title is required',
    'string.max': 'Title must not exceed 100 characters',
    'any.required': 'Title is required',
  }),

  category: Joi.string()
    .valid(
      'GROCERY',
      'TRANSPORTATION',
      'HOUSEHOLD_CHORES',
      'YARD_WORK',
      'PET_CARE',
      'TECH_SUPPORT',
      'COMPANIONSHIP',
      'MEAL_PREP',
      'MEDICAL_ERRAND',
      'OTHER'
    )
    .required()
    .messages({
      'any.only': 'Invalid category',
      'any.required': 'Category is required',
    }),

  urgency: Joi.string().valid('LOW', 'MEDIUM', 'HIGH').required().messages({
    'any.only': 'Invalid urgency',
    'any.required': 'Urgency is required',
  }),

  scheduledAt: Joi.date().iso().required().messages({
    'date.format': 'scheduledAt must be a valid ISO date',
    'any.required': 'scheduledAt is required',
  }),

  address: Joi.string().trim().min(1).required().messages({
    'string.empty': 'Address is required',
    'any.required': 'Address is required',
  }),

  latitude: Joi.number().min(-90).max(90).required().messages({
    'number.min': 'Latitude must be between -90 and 90',
    'number.max': 'Latitude must be between -90 and 90',
    'any.required': 'Latitude is required',
  }),

  longitude: Joi.number().min(-180).max(180).required().messages({
    'number.min': 'Longitude must be between -180 and 180',
    'number.max': 'Longitude must be between -180 and 180',
    'any.required': 'Longitude is required',
  }),

  description: Joi.string().trim().allow('').optional(),
}).unknown(false);

module.exports = {
  createHelpRequestSchema,
};
