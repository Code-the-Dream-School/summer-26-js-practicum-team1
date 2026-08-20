const chatService = require('../services/chat.service');
const asyncHandler = require('../utils/asyncHandler');

const getMessages = asyncHandler(async (req, res) => {
  const messages = await chatService.getMessages(
    Number(req.params.requestId),
    req.user.id
  );

  return res.status(200).json({
    data: messages,
  });
});

const sendMessage = asyncHandler(async (req, res) => {
  const message = await chatService.sendMessage(
    Number(req.params.requestId),
    req.user.id,
    req.body.content
  );

  return res.status(201).json({
    data: message,
  });
});

const markMessagesRead = asyncHandler(async (req, res) => {
  const result = await chatService.markMessagesRead(
    Number(req.params.requestId),
    req.user.id
  );

  return res.status(200).json({
    data: result,
  });
});

module.exports = {
  getMessages,
  sendMessage,
  markMessagesRead,
};
