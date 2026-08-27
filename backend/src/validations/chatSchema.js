const Joi = require('joi');

const createMessageSchema = Joi.object({
  content: Joi.string().trim().min(1).max(1000).required(),
});

module.exports = {
  createMessageSchema,
};
