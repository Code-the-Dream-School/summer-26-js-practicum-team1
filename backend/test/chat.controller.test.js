const chatService = require('../src/services/chat.service');

jest.mock('../src/services/chat.service');

const {
  getMessages,
  sendMessage,
  markMessagesRead,
} = require('../src/controllers/chat.controller');

describe('Chat Controller', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      user: {
        id: 10,
      },
      params: {
        requestId: '25',
      },
      body: {
        content: 'Hello volunteer',
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    next = jest.fn();
  });

  describe('getMessages', () => {
    it('should return messages for the authenticated user and request', async () => {
      const messages = [
        {
          id: 1,
          conversationId: 5,
          senderId: 10,
          content: 'Hello volunteer',
          createdAt: new Date(),
          readAt: null,
        },
      ];

      chatService.getMessages.mockResolvedValue(messages);

      await getMessages(req, res, next);

      expect(chatService.getMessages).toHaveBeenCalledWith(25, 10);

      expect(res.status).toHaveBeenCalledWith(200);

      expect(res.json).toHaveBeenCalledWith({
        data: messages,
      });

      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('sendMessage', () => {
    it('should send a message for the authenticated user', async () => {
      const message = {
        id: 1,
        conversationId: 5,
        senderId: 10,
        content: 'Hello volunteer',
        createdAt: new Date(),
        readAt: null,
      };

      chatService.sendMessage.mockResolvedValue(message);

      await sendMessage(req, res, next);

      expect(chatService.sendMessage).toHaveBeenCalledWith(
        25,
        10,
        'Hello volunteer'
      );

      expect(res.status).toHaveBeenCalledWith(201);

      expect(res.json).toHaveBeenCalledWith({
        data: message,
      });

      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('markMessagesRead', () => {
    it('should mark messages as read for the authenticated user', async () => {
      const result = {
        count: 2,
      };

      chatService.markMessagesRead.mockResolvedValue(result);

      await markMessagesRead(req, res, next);

      expect(chatService.markMessagesRead).toHaveBeenCalledWith(25, 10);

      expect(res.status).toHaveBeenCalledWith(200);

      expect(res.json).toHaveBeenCalledWith({
        data: result,
      });

      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should pass getMessages service errors to next', async () => {
      const error = new Error('Failed to retrieve messages');

      chatService.getMessages.mockRejectedValue(error);

      await getMessages(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });

    it('should pass sendMessage service errors to next', async () => {
      const error = new Error('Failed to send message');

      chatService.sendMessage.mockRejectedValue(error);

      await sendMessage(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });

    it('should pass markMessagesRead service errors to next', async () => {
      const error = new Error('Failed to mark messages as read');

      chatService.markMessagesRead.mockRejectedValue(error);

      await markMessagesRead(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
