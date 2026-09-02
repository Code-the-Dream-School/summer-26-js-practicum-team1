import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
import CloseIcon from '@mui/icons-material/Close';

import {
  useChatMessages,
  useSendMessage,
  useMarkMessagesRead,
} from '../../hooks/useChat';
import { getParticipantImage } from '../../utils/getParticipantImage';

import { useAuth } from '../../hooks/useAuth';

const Chat = ({ requestId, participant }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  const {
    data: messages = [],
    isLoading,
    isError,
  } = useChatMessages(requestId);

  const profileImageSrc = getParticipantImage(
    participant?.profileImage,
    participant?.profileImageType
  );

  const sendMessage = useSendMessage(requestId);

  const { mutate: markMessagesRead } = useMarkMessagesRead(requestId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
        borderRadius: { xs: 2, sm: 3, lg: 2 },
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
          bgcolor: '#1E5631',
        }}
      >
        <Avatar
          src={profileImageSrc}
          sx={{
            width: 48,
            height: 48,
            mr: 1.5,
            bgcolor: '#D9D9D6',
            color: '#1E5631',
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {participant?.name?.charAt(0)}
        </Avatar>

        <Box>
          <Typography variant="h6" fontWeight={600} sx={{ color: '#F6F6F4' }}>
            {participant?.name || 'Chat'}
          </Typography>
        </Box>
        <Button
          onClick={() => navigate(-1)}

          sx={{
            minWidth: 'auto',
            ml: 'auto',
            transition: '0.3s',
            color: 'white',
            flexShrink: 0,
            '&:hover': {
              boxShadow: 5,
              transform: 'translateY(-2px)',
            },
          }}
        >
          <CloseIcon />
        </Button>
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
              <Typography variant="h6"> Start a conversation</Typography>

              <Typography color="text.secondary">
                Send a message to get started.
              </Typography>
            </Box>
          </Box>
        ) : (
          messages.map((message, index) => {
            const isOwnMessage = message.senderId === user?.id;

            const showDay =
              index === 0 ||
              new Date(message.createdAt).toDateString() !==
                new Date(messages[index - 1].createdAt).toDateString();

            return (
              <Box key={message.id}>
                {showDay && (
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      mb: 2,
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        px: 2,
                        py: 0.5,
                        borderRadius: 2,
                        bgcolor: 'grey.200',
                        color: 'text.secondary',
                        fontWeight: 600,
                      }}
                    >
                      {new Date(message.createdAt).toLocaleDateString([], {
                        weekday: 'long',
                      })}
                    </Typography>
                  </Box>
                )}

                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
                    mb: 2,
                  }}
                >
                  <Box
                    sx={{
                      maxWidth: '70%',
                      px: 1.75,
                      py: 1,
                      borderRadius: 2.5,
                      bgcolor: isOwnMessage ? '#1E5631' : '#F0F2EF',
                      color: isOwnMessage ? '#F6F6F4' : 'text.primary',
                    }}
                  >
                    {!isOwnMessage && (
                      <Typography
                        variant="caption"
                        fontWeight={600}
                        display="block"
                        sx={{ mb: 0.5, color: 'grey' }}
                      >
                        {message.sender?.name}
                      </Typography>
                    )}

                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'flex-end',
                        gap: 1,
                      }}
                    >
                      <Typography>{message.content}</Typography>

                      <Typography
                        variant="caption"
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.25,
                          whiteSpace: 'nowrap',
                          opacity: 0.75,
                        }}
                      >
                        {new Date(message.createdAt).toLocaleTimeString([], {
                          hour: 'numeric',
                          minute: '2-digit',
                        })}

                        {isOwnMessage &&
                          (message.readAt ? (
                            <DoneAllIcon fontSize="small" />
                          ) : (
                            <DoneIcon fontSize="small" />
                          ))}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            );
          })
        )}
        <div ref={messagesEndRef} />
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
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 5,
            },
          }}
        />

        <Button
          type="submit"
          variant="contained"
          disabled={!content.trim() || sendMessage.isPending}
          sx={{
            minWidth: 44,
            width: 44,
            height: 44,
            borderRadius: '50%',
            bgcolor: '#1E5631',
            '&:hover': {
              bgcolor: '#164525',
            },
          }}
        >
          {sendMessage.isPending ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            <SendIcon />
          )}
        </Button>
      </Box>
    </Box>
  );
};

export default Chat;
