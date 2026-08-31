import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Box, CircularProgress, Typography } from '@mui/material';

import Chat from '../components/chat/Chat';
import ConversationList from '../components/chat/ConversationList';

import { useGetConversation } from '../hooks/useChat';

const ChatPage = () => {
  const navigate = useNavigate();
  const { requestId } = useParams();

  const { data: conversations = [], isLoading, isError } = useGetConversation();

  const [selectedConversationId, setSelectedConversationId] = useState(null);

  const urlConversation = requestId
    ? conversations.find(
        (conversation) => conversation.requestId === Number(requestId)
      )
    : null;

  const selectedConversation =
    selectedConversationId !== null
      ? conversations.find(
          (conversation) =>
            conversation.conversationId === selectedConversationId
        )
      : urlConversation;

  useEffect(() => {
    if (!isLoading && requestId && !urlConversation) {
      navigate('/chat', { replace: true });
    }
  }, [isLoading, requestId, urlConversation, navigate]);

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          p: 4,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">Unable to load conversations.</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        height: 'calc(100vh - 64px)',
      }}
    >
      <ConversationList
        conversations={conversations}
        selectedConversationId={selectedConversation?.conversationId}
        onSelect={(conversation) =>
          setSelectedConversationId(conversation.conversationId)
        }
      />

      <Box sx={{ flex: 1 }}>
        {selectedConversation ? (
          <Chat requestId={selectedConversation.requestId} />
        ) : (
          <Box
            sx={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography color="text.secondary">
              Select a conversation to start chatting
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ChatPage;
