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

const { Category, Urgency, RequestStatus } = require('@prisma/client');
const CATEGORY_VALUES = Object.values(Category);
const URGENCY_VALUES = Object.values(Urgency);
const STATUS_VALUES = Object.values(RequestStatus);
const SORTABLE_FIELDS = ['createdAt', 'scheduledAt', 'urgency', 'distance'];

const commaList = (allowedValues, label) =>
  Joi.string()
    .custom((value, helpers) => {
      const parts = value.split(',').map((v) => v.trim().toUpperCase());
      const invalid = parts.filter((v) => !allowedValues.includes(v));
      if (invalid.length) {
        return helpers.message(`Invalid ${label}: ${invalid.join(', ')}`);
      }
      return parts.join(',');
    })
    .messages({ 'string.empty': `${label} cannot be empty` });

const browseHelpRequestQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  pageSize: Joi.number().integer().min(1).max(25).default(5),

  category: commaList(CATEGORY_VALUES, 'category'),
  urgency: commaList(URGENCY_VALUES, 'urgency'),
  status: commaList(STATUS_VALUES, 'status'),

  scheduledAfter: Joi.date().iso(),
  scheduledBefore: Joi.date().iso(),
  createdAfter: Joi.date().iso(),
  createdBefore: Joi.date().iso(),

  lat: Joi.number().min(-90).max(90),
  lng: Joi.number().min(-180).max(180),
  radiusMi: Joi.number().positive(),

  q: Joi.string().trim().max(200),

  sort: Joi.string()
    .custom((value, helpers) => {
      const [field, dir] = value.split(':');
      if (!SORTABLE_FIELDS.includes(field)) {
        return helpers.message(`Invalid sort field: ${field}`);
      }
      if (dir && !['asc', 'desc'].includes(dir)) {
        return helpers.message(`Invalid sort direction: ${dir}`);
      }
      return value;
    })
    .messages({ 'string.empty': 'sort cannot be empty' }),
})
  .and('lat', 'lng', 'radiusMi')
  .unknown(true);

module.exports = {
  createHelpRequestSchema,
  browseHelpRequestQuerySchema,
};
