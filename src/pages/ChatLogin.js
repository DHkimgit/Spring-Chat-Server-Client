import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Container,
    Paper,
    TextField,
    Button,
    Typography,
    Box,
    Stack,
    Switch,
    FormControlLabel,
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
    const [isFromMessageList, setIsFromMessageList] = useState(false);
    const [formData, setFormData] = useState({
        articleId: '',
        chatRoomId: '',
        jwtToken: '',
    });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSwitchChange = (e) => {
        setIsFromMessageList(e.target.checked);
        // 쪽지함에서 진입하는 경우가 아니면 chatRoomId 초기화
        if (!e.target.checked) {
            setFormData(prev => ({ ...prev, chatRoomId: '' }));
        }
    };

    const fetchStudentData = async (token) => {
        try {
            const response = await axios.get('http://localhost:8080/user/student/me', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Failed to fetch student data:', error);
            throw new Error('Failed to fetch student data');
        }
    };

    const handleConnection = async (type) => {
        try {
            const studentData = await fetchStudentData(formData.jwtToken);

            sessionStorage.setItem('chatData', JSON.stringify({
                ...formData,
                nickname: studentData.nickname,
                userId: studentData.studentNumber,
                connectionType: type,
                isFromMessageList
            }));

            navigate('/chat');
        } catch (error) {
            setError('Failed to connect: Invalid token or network error');
        }
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
                    <FormControlLabel
                        control={
                            <Switch
                                checked={isFromMessageList}
                                onChange={handleSwitchChange}
                                name="isFromMessageList"
                            />
                        }
                        label="쪽지함에서 진입"
                    />

                    <TextField
                        fullWidth
                        label="게시글 ID"
                        name="articleId"
                        value={formData.articleId}
                        onChange={handleChange}
                        variant="outlined"
                    />

                    {isFromMessageList && (
                        <TextField
                            fullWidth
                            label="채팅방 ID"
                            name="chatRoomId"
                            value={formData.chatRoomId}
                            onChange={handleChange}
                            variant="outlined"
                        />
                    )}

                    <TextField
                        fullWidth
                        label="JWT Token"
                        name="jwtToken"
                        value={formData.jwtToken}
                        onChange={handleChange}
                        variant="outlined"
                        multiline
                        rows={3}
                    />

                    {error && (
                        <Typography color="error" variant="body2">
                            {error}
                        </Typography>
                    )}

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
                            onClick={() => {
                                sessionStorage.setItem('jwtToken', formData.jwtToken);
                                navigate('/chat-list');
                            }}
                        >
                            채팅방 목록
                        </Button>
                    </Stack>
                </Stack>
            </StyledPaper>
        </Container>
    );
};

export default ChatLogin;