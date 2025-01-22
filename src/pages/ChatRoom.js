import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
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

const DateDivider = styled(Typography)(({ theme }) => ({
    textAlign: 'center',
    color: theme.palette.text.secondary,
    margin: theme.spacing(2, 0),
    fontSize: '0.875rem',
}));

const ChatRoom = () => {
    const navigate = useNavigate();
    const [chatData, setChatData] = useState(null);
    const [message, setMessage] = useState('');
    const [articleTitle, setArticleTitle] = useState('');

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
        initializeChatRoom(parsedData);

        return () => {
            if (connection.client) {
                connection.client.deactivate();
            }
        };
    }, []);

    const initializeChatRoom = async (data) => {
        try {
            // 채팅방 정보 가져오기
            let roomData;
            if (data.isFromMessageList) {
                // 쪽지함에서 진입한 경우 - GET 요청
                const response = await axios.get(
                    `http://localhost:8080/chatroom/lost-item/${data.articleId}/${data.chatRoomId}`,
                    {
                        headers: { 'Authorization': `Bearer ${data.jwtToken}` }
                    }
                );
                roomData = response.data;
            } else {
                // 게시글에서 진입한 경우 - POST 요청
                const response = await axios.post(
                    `http://localhost:8080/chatroom/lost-item/${data.articleId}`,
                    {},
                    {
                        headers: { 'Authorization': `Bearer ${data.jwtToken}` }
                    }
                );
                roomData = response.data;
            }

            setArticleTitle(roomData.article_title);

            const updatedChatData = {
                ...data,
                chatRoomId: roomData.chat_room_id,
                userId: roomData.user_id
            };
            setChatData(updatedChatData);
            sessionStorage.setItem('chatData', JSON.stringify(updatedChatData));

            // 웹소켓 연결
            if (updatedChatData.connectionType === 'stomp') {
                connectStomp(updatedChatData);
            }

            // 이전 메시지 로드
            const messagesResponse = await axios.get(
                `http://localhost:8080/chatroom/lost-item/${data.articleId}/${roomData.chat_room_id}/messages`,
                {
                    headers: { 'Authorization': `Bearer ${data.jwtToken}` }
                }
            );

            console.log('Messages response:', messagesResponse.data);

            const formattedMessages = messagesResponse.data.map(msg => ({
                ...msg,
                isSentByMe: String(msg.user_id) === String(roomData.user_id)
            }));
            setMessages(formattedMessages);

        } catch (error) {
            console.error('Failed to initialize chat room:', error);
            navigate('/');
        }
    };

    const connectStomp = (data) => {
        const client = createStompConnection({
            onConnect: () => {
                console.log('Connected!');
                setConnection({ isConnected: true, client });

                client.subscribe(`/topic/chat/${data.articleId}/${data.chatRoomId}`, (message) => {
                    const receivedMessage = JSON.parse(message.body);
                    console.log('receivedMessage:' + receivedMessage.user_id)
                    if (String(receivedMessage.user_id) !== String(data.userId)) {
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
        }, data.jwtToken);

        client.activate();
    };

    const showMessage = (newMessage, sessionUserId) => {
        if (newMessage.type === "UPDATE" && sessionUserId !== newMessage.user_id) {
            useChatStore.getState().updateMessage(newMessage.messageId, newMessage.content);
        } else {
            const isSentByMe = String(newMessage.user_id) === String(sessionUserId);
            addMessage({...newMessage, isSentByMe});
        }
    };

    const renderMessagesWithDateDividers = () => {
        let currentDate = null;
        const messageGroups = [];

        messages.forEach((msg, index) => {
            const messageDate = new Date(msg.timestamp);
            const dateStr = messageDate.toLocaleDateString();

            if (dateStr !== currentDate) {
                currentDate = dateStr;
                messageGroups.push(
                    <DateDivider key={`date-${dateStr}`}>
                        {dateStr}
                    </DateDivider>
                );
            }

            messageGroups.push(
                <ChatMessage
                    key={`msg-${index}`}
                    message={msg}
                    isSentByMe={msg.isSentByMe}
                />
            );
        });

        return messageGroups;
    };

    const sendMessage = () => {
        if (connection.client && connection.client.active && message.trim() !== "") {
            console.log('chatData:', chatData);
            const newMessage = {
                user_nickname: chatData.nickname,
                user_id: chatData.userId,
                content: message,
                timestamp: new Date().toISOString(),
                is_image: false,
                isSentByMe: true
            };

            console.log('newMessage:', newMessage);

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
        setMessages([]);
        navigate('/');
    };

    return (
        <Box>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        {articleTitle || `Chat Room: ${chatData?.chatRoomId}`}
                    </Typography>
                    <IconButton color="inherit" onClick={handleExit}>
                        <ExitToAppIcon />
                    </IconButton>
                </Toolbar>
            </AppBar>
            <Container>
                <ChatContainer elevation={3}>
                    <MessagesContainer>
                        {renderMessagesWithDateDividers()}
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