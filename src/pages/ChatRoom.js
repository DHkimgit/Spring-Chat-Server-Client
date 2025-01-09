import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Paper,
    Typography,
    Box,
    AppBar,
    Toolbar,
    IconButton,
    Divider,
} from '@mui/material';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { styled } from '@mui/material/styles';
import { createStompConnection } from '../api/socket';
import ChatMessage from '../components/ChatMessage';
import ChatInput from '../components/ChatInput';
import useChatStore from '../store/chatStore';

const ChatContainer = styled(Paper)(({ theme }) => ({
    height: 'calc(100vh - 100px)',
    display: 'flex',
    flexDirection: 'column',
    margin: theme.spacing(2),
}));

const MessagesContainer = styled(Box)(({ theme }) => ({
    flexGrow: 1,
    overflowY: 'auto',
    padding: theme.spacing(2),
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
}));

const ChatRoom = () => {
    const navigate = useNavigate();
    const [chatData, setChatData] = useState(null);
    const [message, setMessage] = useState('');

    const {
        connection,
        messages,
        setConnection,
        setMessages,
        addMessage
    } = useChatStore();

    useEffect(() => {
        const storedData = sessionStorage.getItem('chatData');
        if (!storedData) {
            navigate('/');
            return;
        }

        const parsedData = JSON.parse(storedData);
        setChatData(parsedData);

        if (parsedData.connectionType === 'stomp') {
            connectStomp(parsedData);
        }

        return () => {
            if (connection.client) {
                connection.client.deactivate();
            }
        };
    }, []);

    const connectStomp = (data) => {
        const client = createStompConnection({
            onConnect: () => {
                console.log('Connected!');
                setConnection({ isConnected: true, client });

                // Subscribe to the chat room
                client.subscribe(`/topic/chat/${data.articleId}/${data.chatRoomId}`, (message) => {
                    const receivedMessage = JSON.parse(message.body);
                    // 자신이 보낸 메시지는 처리하지 않음
                    console.log('전달받은 메시지의 userId: ' + receivedMessage.userId);
                    console.log('클라이언트 로그인 사용자의 userId: ' + data.userId);
                    if (String(receivedMessage.userId) !== String(data.userId)) {
                        showMessage(receivedMessage, data.userId);
                    }
                });
            },
            onDisconnect: () => {
                console.log('Disconnected!');
                setConnection({ isConnected: false, client: null });
            },
            onStompError: (frame) => {
                console.error('Broker reported error: ' + frame.headers['message']);
                console.error('Additional details: ' + frame.body);
            },
        });

        client.activate();
    };

    const showMessage = (newMessage, sessionUserId) => {
        if (newMessage.type === "UPDATE" && sessionUserId !== newMessage.userId) {
            useChatStore.getState().updateMessage(newMessage.messageId, newMessage.content);
        } else {
            const isSentByMe = newMessage.userId === sessionUserId;
            addMessage({...newMessage, isSentByMe});
        }
    };

    const sendMessage = () => {
        if (connection.client && connection.client.active && message.trim() !== "") {
            const newMessage = {
                userNickname: chatData.nickname,
                userId: chatData.userId,
                content: message,
                timestamp: new Date().toISOString(),
                isSentByMe: true
            };

            connection.client.publish({
                destination: `/app/chat/${chatData.articleId}/${chatData.chatRoomId}`,
                body: JSON.stringify(newMessage)
            });

            setMessage('');
            addMessage({...newMessage});
        }
    };

    const handleExit = () => {
        if (connection.client) {
            connection.client.deactivate();
        }
        sessionStorage.removeItem('chatData');
        setMessages([]); // 메시지 초기화
        navigate('/');
    };

    return (
        <Box>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Chat Room: {chatData?.chatRoomId}
                    </Typography>
                    <IconButton color="inherit" onClick={handleExit}>
                        <ExitToAppIcon />
                    </IconButton>
                </Toolbar>
            </AppBar>

            <Container>
                <ChatContainer elevation={3}>
                    <Box sx={{ p: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                            Article ID: {chatData?.articleId} | Nickname: {chatData?.nickname}
                        </Typography>
                    </Box>
                    <Divider />

                    <MessagesContainer>
                        {messages.map((msg, index) => (
                            <ChatMessage
                                key={index}
                                message={msg}
                                isSentByMe={msg.isSentByMe}
                            />
                        ))}
                    </MessagesContainer>

                    <Divider />
                    <ChatInput
                        message={message}
                        setMessage={setMessage}
                        sendMessage={sendMessage}
                        isConnected={connection.isConnected}
                    />
                </ChatContainer>
            </Container>
        </Box>
    );
};

export default ChatRoom;