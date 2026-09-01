const Joi = require('joi');

const registerSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .pattern(/^[\p{L}\s'-]+$/u)
    .required()
    .messages({
      'string.min': 'Name must be at least 2 characters',
      'string.max': 'Name must be at most 100 characters',
      'string.pattern.base': 'Name contains invalid characters',
      'any.required': 'Name is required',
    }),
  email: Joi.string().trim().lowercase().email().max(255).required().messages({
    'string.email': 'Enter a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string()
    .min(8)
    .max(72)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters',
      'string.max': 'Password must be at most 72 characters',
      'string.pattern.base':
        'Password must include uppercase, lowercase, and a number',
      'any.required': 'Password is required',
    }),
  dob: Joi.date()
    .iso()
    .max('now')
    .required()
    .custom((value, helpers) => {
      const today = new Date();
      const birth = new Date(value);
      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age -= 1;
      }
      if (age < 18) {
        return helpers.message('You must be at least 18 years old');
      }
      if (age > 120) {
        return helpers.message('Enter a valid date of birth');
      }
      return value;
    })
    .messages({
      'date.format': 'Date of birth must be YYYY-MM-DD',
      'date.max': 'Date of birth cannot be in the future',
      'any.required': 'Date of birth is required',
    }),
  gender: Joi.string()
    .valid('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY')
    .required()
    .messages({
      'any.only': 'Please select a valid gender',
      'any.required': 'Gender is required',
    }),
  phone: Joi.string()
    .trim()
    .max(20)
    .pattern(/^[\d\s()+-]+$/)
    .allow('', null)
    .messages({
      'string.max': 'Phone must be at most 20 characters',
      'string.pattern.base': 'Enter a valid phone number',
    }),
  accountType: Joi.string()
    .valid('requester', 'volunteer')
    .default('requester')
    .messages({
      'any.only': 'Please select a valid account type',
    }),
}).unknown(false);

module.exports = { registerSchema };
