const Joi = require('joi');

const listNotificationsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  pageSize: Joi.number().integer().min(1).max(50).default(20),
  unreadOnly: Joi.boolean().truthy('true').falsy('false').default(false),
});

module.exports = {
  listNotificationsQuerySchema,
};
