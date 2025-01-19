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

const TimeStamp = styled(Typography)(({ theme }) => ({
    fontSize: '0.75rem',
    color: theme.palette.text.secondary,
    marginTop: theme.spacing(0.5),
}));

const ChatMessage = ({ message, isSentByMe }) => {
    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: isSentByMe ? 'flex-end' : 'flex-start' }}>
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
            <TimeStamp>
                {formatTime(message.timestamp)}
            </TimeStamp>
        </Box>
    );
};

export default ChatMessage;