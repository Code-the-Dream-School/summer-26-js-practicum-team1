const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const notificationService = require('../services/notification.service');

const getNotificationId = (req) => {
  const notificationId = Number(req.params.id);

  if (!Number.isInteger(notificationId) || notificationId <= 0) {
    throw new ApiError(400, 'Invalid notification id');
  }

  return notificationId;
};

const listNotifications = asyncHandler(async (req, res) => {
  const unreadOnly =
    req.query.unreadOnly === true || req.query.unreadOnly === 'true';

  const { data, meta } = await notificationService.listNotifications({
    recipientId: req.user.id,
    page: req.query.page,
    pageSize: req.query.pageSize,
    unreadOnly,
  });

  return res.status(200).json({ success: true, data, meta });
});

const markNotificationRead = asyncHandler(async (req, res) => {
  const notificationId = getNotificationId(req);

  const notification = await notificationService.markNotificationRead({
    notificationId,
    recipientId: req.user.id,
  });

  return res.status(200).json({ success: true, data: notification });
});

module.exports = {
  listNotifications,
  markNotificationRead,
};
