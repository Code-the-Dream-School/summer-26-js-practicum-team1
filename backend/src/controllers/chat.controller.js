const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const chatService = require('../services/chat.service');

const getRequestId = (req) => {
  const requestId = Number(req.params.requestId);

  if (!Number.isInteger(requestId) || requestId <= 0) {
    throw new ApiError(400, 'Invalid request ID');
  }

  return requestId;
};

const getMessages = asyncHandler(async (req, res) => {
  const requestId = getRequestId(req);

  const messages = await chatService.getMessages(requestId, req.user.id);

  return res.status(200).json({
    data: messages,
  });
});

const sendMessage = asyncHandler(async (req, res) => {
  const requestId = getRequestId(req);

  const message = await chatService.sendMessage(
    requestId,
    req.user.id,
    req.body.content
  );

  return res.status(201).json({
    data: message,
  });
});

const markMessagesRead = asyncHandler(async (req, res) => {
  const requestId = getRequestId(req);

  const result = await chatService.markMessagesRead(requestId, req.user.id);

  return res.status(200).json({
    data: result,
  });
});

module.exports = {
  getMessages,
  sendMessage,
  markMessagesRead,
};
