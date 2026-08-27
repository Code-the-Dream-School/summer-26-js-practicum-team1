import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  TextField,
  Typography,
} from '@mui/material';

import {
  useChatMessages,
  useSendMessage,
  useMarkMessagesRead,
} from '../../hooks/useChat';

import { useAuth } from '../../hooks/useAuth';

const Chat = ({ requestId }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');

  const {
    data: messages = [],
    isLoading,
    isError,
  } = useChatMessages(requestId);

  const sendMessage = useSendMessage(requestId);
  const { mutate: markMessagesRead } = useMarkMessagesRead(requestId);

  useEffect(() => {
    const hasUnreadMessages = messages.some(
      (message) => message.senderId !== user?.id && !message.readAt
    );

    if (hasUnreadMessages) {
      markMessagesRead();
    }
  }, [messages, user?.id, markMessagesRead]);

  const handleSubmit = (event) => {
    event.preventDefault();

    const trimmedContent = content.trim();

    if (!trimmedContent || sendMessage.isPending) {
      return;
    }

    sendMessage.mutate(trimmedContent, {
      onSuccess: () => {
        setContent('');
      },
    });
  };

  if (isLoading) {
    return <CircularProgress />;
  }

  if (isError) {
    return <Alert severity="error">Unable to load messages.</Alert>;
  }

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        {messages.map((message) => {
          const isOwnMessage = message.senderId === user?.id;

          return (
            <Box
              key={message.id}
              sx={{
                mb: 2,
                textAlign: isOwnMessage ? 'right' : 'left',
              }}
            >
              <Typography variant="caption">{message.sender?.name}</Typography>

              <Typography>{message.content}</Typography>

              <Typography variant="caption">
                {new Date(message.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
                {isOwnMessage && <> · {message.readAt ? 'Read' : 'Sent'}</>}
              </Typography>
            </Box>
          );
        })}
      </Box>

      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          fullWidth
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Type a message..."
        />

        <Button
          type="submit"
          variant="contained"
          disabled={!content.trim() || sendMessage.isPending}
          sx={{ mt: 1 }}
        >
          Send
        </Button>
      </Box>
    </Box>
  );
};

export default Chat;
