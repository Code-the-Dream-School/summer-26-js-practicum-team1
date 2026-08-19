const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');

const getAuthorizedConversation = async (
  requestId,
  userId,
  canSend = false
) => {
  const request = await prisma.helpRequest.findUnique({
    where: { id: requestId },
    select: {
      id: true,
      requesterId: true,
      volunteerId: true,
      status: true,
    },
  });

  if (!request) {
    throw new ApiError(404, 'Help request not found');
  }

  const isParticipant =
    request.requesterId === userId || request.volunteerId === userId;

  if (!isParticipant) {
    throw new ApiError(403, 'You are not a participant in this request');
  }

  if (canSend && request.status !== 'ACCEPTED') {
    throw new ApiError(403, 'Messages can only be sent for accepted requests');
  }

  if (
    !canSend &&
    request.status !== 'ACCEPTED' &&
    request.status !== 'COMPLETED'
  ) {
    throw new ApiError(403, 'Chat is not available for this request');
  }

  let conversation = await prisma.conversation.findUnique({
    where: { requestId },
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: { requestId },
    });
  }

  return conversation;
};

const getMessages = async (requestId, userId) => {
  const conversation = await getAuthorizedConversation(requestId, userId);

  return prisma.message.findMany({
    where: {
      conversationId: conversation.id,
    },
    orderBy: {
      createdAt: 'asc',
    },
  });
};

const sendMessage = async (requestId, userId, content) => {
  const conversation = await getAuthorizedConversation(requestId, userId, true);

  return prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderId: userId,
      content,
    },
  });
};

const markMessagesRead = async (requestId, userId) => {
  const conversation = await getAuthorizedConversation(requestId, userId);

  return prisma.message.updateMany({
    where: {
      conversationId: conversation.id,
      senderId: {
        not: userId,
      },
      readAt: null,
    },
    data: {
      readAt: new Date(),
    },
  });
};

module.exports = {
  getMessages,
  sendMessage,
  markMessagesRead,
};
