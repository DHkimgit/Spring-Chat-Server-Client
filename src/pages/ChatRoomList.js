import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Container,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    Typography,
    Box,
    AppBar,
    Toolbar,
    IconButton,
    Badge,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const StyledListItem = styled(ListItem)(({ theme }) => ({
    padding: theme.spacing(2),
    '&:hover': {
        backgroundColor: theme.palette.action.hover,
        cursor: 'pointer',
    },
}));

const UnreadBadge = styled(Badge)(({ theme }) => ({
    '& .MuiBadge-badge': {
        backgroundColor: '#FF4B4B',
        color: 'white',
        fontSize: '0.75rem',
        minWidth: '20px',
        height: '20px',
        borderRadius: '10px',
    },
}));

const TimeStamp = styled(Typography)(({ theme }) => ({
    fontSize: '0.75rem',
    color: theme.palette.text.secondary,
    marginLeft: 'auto',
    marginRight: theme.spacing(1),
}));

const RecentMessage = styled(Typography)(({ theme }) => ({
    color: theme.palette.text.secondary,
    fontSize: '0.875rem',
    maxWidth: '70%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
}));

const ChatRoomList = () => {
    const navigate = useNavigate();
    const [chatRooms, setChatRooms] = useState([]);
    const [deviceToken, setDeviceToken] = useState('');

    useEffect(() => {
        const fetchChatRooms = async () => {
            const token = sessionStorage.getItem('jwtToken');
            const storedDeviceToken = sessionStorage.getItem('deviceToken');
            if (!token) {
                navigate('/');
                return;
            }
            setDeviceToken(storedDeviceToken || '');

            try {
                const response = await axios.get('http://localhost:8080/chatroom/lost-item', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const convertedData = response.data.map(room => ({
                    articleId: room.article_id,
                    chatRoomId: room.chat_room_id,
                    lastMessageAt: room.last_message_at,
                    lostItemImageUrl: room.lost_item_image_url,
                    recentMessageContent: room.recent_message_content,
                    title: room.article_title,
                    unreadMessageCount: room.unread_message_count
                }));
                setChatRooms(convertedData);
            } catch (error) {
                console.error('Failed to fetch chat rooms:', error);
                navigate('/');
            }
        };

        fetchChatRooms();
    }, [navigate]);

    const formatTime = (timestamp) => {
        const messageDate = new Date(timestamp);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (messageDate.toDateString() === today.toDateString()) {
            return messageDate.toLocaleTimeString('ko-KR', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            });
        } else if (messageDate.toDateString() === yesterday.toDateString()) {
            return '어제';
        } else {
            return `${messageDate.getMonth() + 1}월 ${messageDate.getDate()}일`;
        }
    };

    const handleRoomClick = async (room) => {
        const token = sessionStorage.getItem('jwtToken');
        if (!token) {
            navigate('/');
            return;
        }

        try {
            const studentResponse = await axios.get('http://localhost:8080/user/student/me', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const chatData = {
                articleId: room.articleId,
                chatRoomId: room.chatRoomId,
                jwtToken: token,
                deviceToken: deviceToken,
                nickname: studentResponse.data.nickname,
                userId: studentResponse.data.studentNumber,
                connectionType: 'stomp',
                isFromMessageList: true
            };

            sessionStorage.setItem('chatData', JSON.stringify(chatData));
            navigate('/chat');
        } catch (error) {
            console.error('Failed to prepare chat room:', error);
        }
    };

    return (
        <Box sx={{ pb: 7 }}>
            <AppBar position="static">
                <Toolbar>
                    <IconButton
                        edge="start"
                        color="inherit"
                        onClick={() => navigate('/')}
                    >
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        채팅방 목록
                    </Typography>
                </Toolbar>
            </AppBar>
            <Container>
                <List>
                    {chatRooms.map((room, index) => (
                        <StyledListItem
                            key={index}
                            onClick={() => handleRoomClick(room)}
                            divider
                        >
                            <Box sx={{ display: 'flex', width: '100%', alignItems: 'center' }}>
                                <ListItemAvatar>
                                    <Avatar
                                        src={room.lostItemImageUrl}
                                        alt={room.title}
                                        sx={{ width: 56, height: 56 }}
                                    />
                                </ListItemAvatar>
                                <Box sx={{ flexGrow: 1, ml: 2 }}>
                                    <Typography variant="subtitle1" component="div">
                                        {room.title}
                                    </Typography>
                                    <RecentMessage>
                                        {room.recentMessageContent}
                                    </RecentMessage>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                                    <TimeStamp>
                                        {formatTime(room.lastMessageAt)}
                                    </TimeStamp>
                                    {room.unreadMessageCount > 0 && (
                                        <UnreadBadge
                                            badgeContent={room.unreadMessageCount}
                                            max={99}
                                        />
                                    )}
                                </Box>
                            </Box>
                        </StyledListItem>
                    ))}
                </List>
            </Container>
        </Box>
    );
};

export default ChatRoomList;
// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import {
//     Container,
//     List,
//     ListItem,
//     ListItemText,
//     ListItemAvatar,
//     Avatar,
//     Typography,
//     Box,
//     AppBar,
//     Toolbar,
//     IconButton,
//     Badge,
// } from '@mui/material';
// import { styled } from '@mui/material/styles';
// import ArrowBackIcon from '@mui/icons-material/ArrowBack';
//
// const StyledListItem = styled(ListItem)(({ theme }) => ({
//     padding: theme.spacing(2),
//     '&:hover': {
//         backgroundColor: theme.palette.action.hover,
//         cursor: 'pointer',
//     },
// }));
//
// const UnreadBadge = styled(Badge)(({ theme }) => ({
//     '& .MuiBadge-badge': {
//         backgroundColor: '#FF4B4B',
//         color: 'white',
//         fontSize: '0.75rem',
//         minWidth: '20px',
//         height: '20px',
//         borderRadius: '10px',
//     },
// }));
//
// const TimeStamp = styled(Typography)(({ theme }) => ({
//     fontSize: '0.75rem',
//     color: theme.palette.text.secondary,
//     marginLeft: 'auto',
//     marginRight: theme.spacing(1),
// }));
//
// const RecentMessage = styled(Typography)(({ theme }) => ({
//     color: theme.palette.text.secondary,
//     fontSize: '0.875rem',
//     maxWidth: '70%',
//     overflow: 'hidden',
//     textOverflow: 'ellipsis',
//     whiteSpace: 'nowrap',
// }));
//
// const ChatRoomList = () => {
//     const navigate = useNavigate();
//     const [chatRooms, setChatRooms] = useState([]);
//
//     useEffect(() => {
//         const fetchChatRooms = async () => {
//             const token = sessionStorage.getItem('jwtToken');
//             if (!token) {
//                 navigate('/');
//                 return;
//             }
//
//             try {
//                 const response = await axios.get('http://localhost:8080/chatroom/lost-item/', {
//                     headers: { 'Authorization': `Bearer ${token}` }
//                 });
//                 setChatRooms(response.data);
//             } catch (error) {
//                 console.error('Failed to fetch chat rooms:', error);
//                 navigate('/');
//             }
//         };
//
//         fetchChatRooms();
//     }, [navigate]);
//
//     const formatTime = (timestamp) => {
//         const messageDate = new Date(timestamp);
//         const today = new Date();
//         const yesterday = new Date(today);
//         yesterday.setDate(yesterday.getDate() - 1);
//
//         if (messageDate.toDateString() === today.toDateString()) {
//             return messageDate.toLocaleTimeString('ko-KR', {
//                 hour: '2-digit',
//                 minute: '2-digit',
//                 hour12: false
//             });
//         } else if (messageDate.toDateString() === yesterday.toDateString()) {
//             return '어제';
//         } else {
//             return `${messageDate.getMonth() + 1}월 ${messageDate.getDate()}일`;
//         }
//     };
//
//     const handleRoomClick = (title) => {
//         // TODO: Implement chat room navigation
//         console.log('Clicked room:', title);
//     };
//
//     return (
//         <Box sx={{ pb: 7 }}>
//             <AppBar position="static">
//                 <Toolbar>
//                     <IconButton
//                         edge="start"
//                         color="inherit"
//                         onClick={() => navigate('/')}
//                     >
//                         <ArrowBackIcon />
//                     </IconButton>
//                     <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
//                         채팅방 목록
//                     </Typography>
//                 </Toolbar>
//             </AppBar>
//             <Container>
//                 <List>
//                     {chatRooms.map((room, index) => (
//                         <StyledListItem
//                             key={index}
//                             onClick={() => handleRoomClick(room.title)}
//                             divider
//                         >
//                             <Box sx={{ display: 'flex', width: '100%', alignItems: 'center' }}>
//                                 <ListItemAvatar>
//                                     <Avatar
//                                         src={room.lostItemImageUrl}
//                                         alt={room.title}
//                                         sx={{ width: 56, height: 56 }}
//                                     />
//                                 </ListItemAvatar>
//                                 <Box sx={{ flexGrow: 1, ml: 2 }}>
//                                     <Typography variant="subtitle1" component="div">
//                                         {room.title}
//                                     </Typography>
//                                     <RecentMessage>
//                                         {room.recentMessageContent}
//                                     </RecentMessage>
//                                 </Box>
//                                 <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
//                                     <TimeStamp>
//                                         {formatTime(room.lastMessageAt)}
//                                     </TimeStamp>
//                                     {room.unreadMessageCount > 0 && (
//                                         <UnreadBadge
//                                             badgeContent={room.unreadMessageCount}
//                                             max={99}
//                                         />
//                                     )}
//                                 </Box>
//                             </Box>
//                         </StyledListItem>
//                     ))}
//                 </List>
//             </Container>
//         </Box>
//     );
// };
//
// export default ChatRoomList;