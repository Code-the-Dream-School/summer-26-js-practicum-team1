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

  if (
    canSend &&
    request.status !== 'ACCEPTED' &&
    request.status !== 'COMPLETED'
  ) {
    throw new ApiError(
      403,
      'Messages can only be sent for accepted or completed requests'
    );
  }
  if (
    !canSend &&
    request.status !== 'ACCEPTED' &&
    request.status !== 'COMPLETED'
  ) {
    throw new ApiError(403, 'Chat is not available for this request');
  }

  const conversation = await prisma.conversation.findFirst({
    where: {
      request: {
        requesterId: request.requesterId,
        volunteerId: request.volunteerId,
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
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

const getUnreadMessageCount = async (userId) => {
  const messages = await prisma.message.findMany({
    where: {
      readAt: null,
      senderId: {
        not: userId,
      },
      conversation: {
        request: {
          OR: [{ requesterId: userId }, { volunteerId: userId }],
        },
      },
    },
    select: {
      conversationId: true,
    },
  });

  const unreadByConversation = {};

  messages.forEach((message) => {
    unreadByConversation[message.conversationId] =
      (unreadByConversation[message.conversationId] || 0) + 1;
  });

  const requests = await prisma.helpRequest.findMany({
    where: {
      OR: [{ requesterId: userId }, { volunteerId: userId }],
    },
    select: {
      id: true,
      requesterId: true,
      volunteerId: true,
    },
  });

  const conversations = await prisma.conversation.findMany({
    where: {
      request: {
        OR: [{ requesterId: userId }, { volunteerId: userId }],
      },
    },
    select: {
      id: true,
      request: {
        select: {
          requesterId: true,
          volunteerId: true,
        },
      },
    },
  });

  const byRequest = {};

  requests.forEach((request) => {
    const conversation = conversations.find(
      (conversation) =>
        conversation.request.requesterId === request.requesterId &&
        conversation.request.volunteerId === request.volunteerId
    );

    if (!conversation) {
      return;
    }

    const unreadCount = unreadByConversation[conversation.id] || 0;

    if (unreadCount > 0) {
      byRequest[request.id] = unreadCount;
    }
  });

  return {
    totalUnreadCount: messages.length,
    byRequest,
  };
};

const getConversations = async (userId) => {
  const conversations = await prisma.conversation.findMany({
    where: {
      request: {
        OR: [{ requesterId: userId }, { volunteerId: userId }],
      },
    },

    include: {
      request: {
        select: {
          id: true,
          requesterId: true,
          volunteerId: true,

          requester: {
            select: {
              id: true,
              name: true,
              profileImage: true,
              profileImageType: true,
            },
          },

          volunteer: {
            select: {
              user: {
                select: {
                  id: true,
                  name: true,
                  profileImage: true,
                  profileImageType: true,
                },
              },
            },
          },
        },
      },

      messages: {
        orderBy: {
          createdAt: 'desc',
        },
        take: 1,
        select: {
          content: true,
          createdAt: true,
          senderId: true,
        },
      },
    },

    orderBy: {
      updatedAt: 'desc',
    },
  });
  return conversations
    .map((conversation) => {
      const { requesterId, requester, volunteer } = conversation.request;

      const participant = requesterId === userId ? volunteer?.user : requester;

      if (!participant) {
        return null;
      }

      return {
        conversationId: conversation.id,
        requestId: conversation.request.id,

        participant: {
          id: participant.id,
          name: participant.name,
          profileImage: participant.profileImage,
          profileImageType: participant.profileImageType,
        },

        lastMessage: conversation.messages[0] || null,
      };
    })
    .filter(Boolean);
};

module.exports = {
  getMessages,
  sendMessage,
  markMessagesRead,
  getConversations,
  getUnreadMessageCount,
};
