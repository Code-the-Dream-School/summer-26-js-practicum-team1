import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  TextField,
  Typography,
  Avatar,
} from '@mui/material';

import DoneIcon from '@mui/icons-material/Done';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import SendIcon from '@mui/icons-material/Send';
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
  const otherParticipant = messages.find(
    (message) => message.senderId !== user?.id
  )?.sender;

  if (isLoading) {
    return <CircularProgress />;
  }

  if (isError) {
    return <Alert severity="error">Unable to load messages.</Alert>;
  }

  return (
    <Box
      sx={{
        maxWidth: 800,
        mx: 'auto',
        height: 'calc(100vh - 120px)',
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden',
        borderRadius: { xs: 2, sm: 3 },
        boxShadow: 3,
      }}
    >
      <Box
        sx={{
          px: 3,
          py: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Avatar
          src={otherParticipant?.profileImage}
          alt={otherParticipant?.name || 'User'}
          sx={{
            width: 70,
            height: 70,
            fontSize: '2.75rem',
            boxShadow: 3,
          }}
        >
          {otherParticipant?.name?.charAt(0)}
        </Avatar>

        <Box>
          <Typography variant="h3" fontWeight={700}>
            {otherParticipant?.name || 'Chat'}
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 3,
        }}
      >
        {messages.length === 0 ? (
          <Box
            sx={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
            }}
          >
            <Box>
              <Typography variant="h6">No messages yet</Typography>

              <Typography color="text.secondary">
                Start the conversation below.
              </Typography>
            </Box>
          </Box>
        ) : (
          messages.map((message) => {
            const isOwnMessage = message.senderId === user?.id;

            return (
              <Box
                key={message.id}
                sx={{
                  display: 'flex',
                  justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
                  mb: 2,
                }}
              >
                <Box
                  sx={{
                    maxWidth: '70%',
                    px: 2,
                    py: 1.25,
                    borderRadius: 3,
                    boxShadow: 3,
                    bgcolor: isOwnMessage ? 'primary.main' : 'grey.100',
                    color: isOwnMessage
                      ? 'primary.contrastText'
                      : 'text.primary',
                  }}
                >
                  {!isOwnMessage && (
                    <Typography
                      variant="caption"
                      fontWeight={600}
                      display="block"
                      sx={{ mb: 0.5 }}
                    >
                      {message.sender?.name}
                    </Typography>
                  )}

                  <Typography>{message.content}</Typography>

                  <Typography
                    variant="caption"
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      gap: 0.5,
                      mt: 0.5,
                    }}
                  >
                    {new Date(message.createdAt).toLocaleTimeString([], {
                      hour: 'numeric',
                      minute: '2-digit',
                    })}

                    {isOwnMessage &&
                      (message.readAt ? (
                        <DoneAllIcon
                          fontSize="small"
                          sx={{ color: '#2196F3 !important' }}
                        />
                      ) : (
                        <DoneIcon
                          fontSize="small"
                          sx={{ color: '#2196F3 !important' }}
                        />
                      ))}
                  </Typography>
                </Box>
              </Box>
            );
          })
        )}
      </Box>

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          p: 2,
          borderTop: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          gap: 1,
        }}
      >
        <TextField
          fullWidth
          size="small"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Type a message..."
          sx={{ boxShadow: 3 }}
        />

        <Button
          type="submit"
          variant="contained"
          disabled={!content.trim() || sendMessage.isPending}
          sx={{
            boxShadow: 2,
            transition: '0.3s',
            flexShrink: 0,
            '&:hover': {
              boxShadow: 5,
              transform: 'translateY(-2px)',
            },
          }}
        >
          <SendIcon />
        </Button>
      </Box>
    </Box>
  );
};

export default Chat;
