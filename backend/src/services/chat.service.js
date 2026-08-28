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

  const conversation = await prisma.conversation.findUnique({
    where: { requestId },
  });

  return conversation;
};

const getMessages = async (requestId, userId) => {
  const conversation = await getAuthorizedConversation(requestId, userId);

  if (!conversation) {
    return [];
  }

  return prisma.message.findMany({
    where: {
      conversationId: conversation.id,
    },
    orderBy: {
      createdAt: 'asc',
    },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
};

const sendMessage = async (requestId, userId, content) => {
  let conversation = await getAuthorizedConversation(requestId, userId, true);

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        requestId,
      },
    });
  }

  return prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderId: userId,
      content,
    },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
};

const markMessagesRead = async (requestId, userId) => {
  const conversation = await getAuthorizedConversation(requestId, userId);

  if (!conversation) {
    return { count: 0 };
  }

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
