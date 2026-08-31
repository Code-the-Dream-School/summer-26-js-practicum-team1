import {
  Avatar,
  Box,
  List,
  ListItemButton,
  ListItemText,
  Typography,
} from '@mui/material';

const ConversationList = ({
  conversations,
  selectedConversationId,
  onSelect,
}) => {
  return (
    <Box
      sx={{
        width: 300,
        borderRight: '1px solid',
        borderColor: 'divider',
        height: 'calc(100vh - 120px)',
        overflowY: 'auto',
        boxShadow: 3,
        borderRadius: { xs: 2, sm: 3 },
      }}
    >
      <Typography variant="h6" sx={{ px: 2, py: 2 }}>
        Chats
      </Typography>

      <List disablePadding>
        {conversations.map((conversation) => {
          const name = conversation.participant.name;

          return (
            <ListItemButton
              key={conversation.conversationId}
              selected={conversation.conversationId === selectedConversationId}
              onClick={() => onSelect(conversation)}
            >
              <Avatar sx={{ mr: 1.5 }}>{name.charAt(0).toUpperCase()}</Avatar>

              <ListItemText
                primary={name}
                secondary={
                  conversation.lastMessage?.content ||
                  `Request #${conversation.requestId}`
                }
              />
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );
};

export default ConversationList;
