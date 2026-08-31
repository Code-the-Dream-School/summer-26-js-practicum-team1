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
        width: { xs: '100%', sm: 320 },
        maxWidth: '100%',
        height: 'calc(100vh - 120px)',
        border: '1px solid',
        borderColor: 'divider',
        overflowY: 'auto',
        boxShadow: 3,
        borderRadius: { xs: 2, sm: 3, lg: 2 },
      }}
    >
      <List sx={{ px: 1, pt: 0, mt: 3 }}>
        {conversations.map((conversation) => {
          const name = conversation.participant.name;
          const lastMessage = conversation.lastMessage;
          const isSelected =
            conversation.conversationId === selectedConversationId;

          return (
            <ListItemButton
              key={conversation.conversationId}
              selected={isSelected}
              onClick={() => onSelect(conversation)}
              sx={{
                borderRadius: 2.5,
                mb: 0.5,
                px: 1.5,
                py: 1.25,
                alignItems: 'center',

                '&:hover': { bgcolor: 'rgba(30, 86, 49, 0.06)' },
                '&.Mui-selected': { bgcolor: 'rgba(30, 86, 49, 0.10)' },
                '&.Mui-selected:hover': { bgcolor: 'rgba(30, 86, 49, 0.14)' },
              }}
            >
              <Avatar
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
                {name.charAt(0).toUpperCase()}
              </Avatar>

              <ListItemText
                sx={{ minWidth: 0 }}
                primary={
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    <Typography variant="body1" fontWeight={600} noWrap>
                      {name}
                    </Typography>

                    {lastMessage && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ flexShrink: 0 }}
                      >
                        {new Date(lastMessage.createdAt).toLocaleTimeString(
                          [],
                          {
                            hour: 'numeric',
                            minute: '2-digit',
                          }
                        )}
                      </Typography>
                    )}
                  </Box>
                }
                secondary={
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    noWrap
                    sx={{
                      mt: 0.25,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {lastMessage?.content || 'Start a conversation'}
                  </Typography>
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
