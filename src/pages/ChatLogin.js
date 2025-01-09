import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Paper,
    TextField,
    Button,
    Typography,
    Box,
    Stack,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(4),
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
}));

const ChatLogin = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        articleId: '1',
        chatRoomId: '1',
        nickname: 'User1',
        userId: '',
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleConnection = (type) => {
        sessionStorage.setItem('chatData', JSON.stringify({
            ...formData,
            connectionType: type,
        }));
        navigate('/chat');
    };

    return (
        <Container component="main" maxWidth="sm">
            <StyledPaper elevation={3}>
                <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ChatBubbleOutlineIcon color="primary" sx={{ fontSize: 40 }} />
                    <Typography component="h1" variant="h4">
                        채팅 시험용 클라이언트
                    </Typography>
                </Box>

                <Stack spacing={3} sx={{ width: '100%' }}>
                    <TextField
                        fullWidth
                        label="게시글 ID"
                        name="articleId"
                        value={formData.articleId}
                        onChange={handleChange}
                        variant="outlined"
                    />
                    <TextField
                        fullWidth
                        label="채팅방 ID"
                        name="chatRoomId"
                        value={formData.chatRoomId}
                        onChange={handleChange}
                        variant="outlined"
                    />
                    <TextField
                        fullWidth
                        label="사용자 닉네임"
                        name="nickname"
                        value={formData.nickname}
                        onChange={handleChange}
                        variant="outlined"
                    />
                    <TextField
                        fullWidth
                        label="백엔드 사용자 ID(PK, 정수)"
                        name="userId"
                        value={formData.userId}
                        onChange={handleChange}
                        variant="outlined"
                    />

                    <Stack direction="row" spacing={2}>
                        <Button
                            fullWidth
                            variant="contained"
                            color="primary"
                            size="large"
                            onClick={() => handleConnection('stomp')}
                        >
                            Connect with STOMP
                        </Button>
                        <Button
                            fullWidth
                            variant="contained"
                            color="secondary"
                            size="large"
                            onClick={() => handleConnection('socketio')}
                        >
                            Connect with Socket.IO
                        </Button>
                    </Stack>
                </Stack>
            </StyledPaper>
        </Container>
    );
};

export default ChatLogin;