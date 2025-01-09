import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import { styled } from '@mui/material/styles';

const MessagePaper = styled(Paper, {
    shouldForwardProp: (prop) => prop !== 'isSentByMe'
})(({ theme, isSentByMe }) => ({
    padding: theme.spacing(1.5),
    maxWidth: '70%',
    backgroundColor: isSentByMe ? theme.palette.primary.main : theme.palette.grey[100],
    color: isSentByMe ? theme.palette.primary.contrastText : theme.palette.text.primary,
    alignSelf: isSentByMe ? 'flex-end' : 'flex-start',
}));

const ChatMessage = ({ message, isSentByMe }) => {
    return (
        <MessagePaper isSentByMe={isSentByMe} elevation={1}>
            <Typography variant="body2" sx={{
                fontWeight: 'bold',
                color: isSentByMe ? 'inherit' : 'text.secondary'
            }}>
                {message.userNickname}
            </Typography>
            <Typography variant="body1">
                {message.content}
            </Typography>
        </MessagePaper>
    );
};

export default ChatMessage;