import { useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';

import { Box, CircularProgress, Typography } from '@mui/material';

import Chat from '../components/chat/Chat';
import ConversationList from '../components/chat/ConversationList';

import { useGetConversation } from '../hooks/useChat';

const ChatPage = () => {
  const { requestId } = useParams();
  const location = useLocation();

  const { data: conversations = [], isLoading, isError } = useGetConversation();

  const [selectedConversation, setSelectedConversation] = useState(null);

  const participantId = location.state?.participantId;

  const conversationFromRequest = participantId
    ? conversations.find(
        (conversation) => conversation.participant.id === Number(participantId)
      )
    : null;

  const activeConversation = selectedConversation || conversationFromRequest;

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
        selectedConversationId={activeConversation?.conversationId}
        onSelect={setSelectedConversation}
      />

      <Box sx={{ flex: 1 }}>
        {activeConversation ? (
          <Chat
            requestId={activeConversation?.requestId ?? requestId}
            participant={activeConversation?.participant}
          />
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
