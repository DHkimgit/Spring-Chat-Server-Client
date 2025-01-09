import React from 'react';
import { TextField, Button, Box } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

const ChatInput = ({ message, setMessage, sendMessage, isConnected }) => {
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <Box sx={{ display: 'flex', gap: 1, p: 2 }}>
            <TextField
                fullWidth
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={!isConnected}
                placeholder={isConnected ? "Type a message..." : "Please connect first"}
                variant="outlined"
                size="small"
            />
            <Button
                variant="contained"
                color="primary"
                disabled={!isConnected}
                onClick={sendMessage}
                endIcon={<SendIcon />}
            >
                Send
            </Button>
        </Box>
    );
};

export default ChatInput;