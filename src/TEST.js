import React, { useState, useEffect } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

function TEST() {
    const [articleId, setArticleId] = useState('1');
    const [chatRoomId, setChatRoomId] = useState('1');
    const [nickname, setNickname] = useState('User1');
    const [message, setMessage] = useState('');
    const [userId, setUserId] = useState('');
    const [messages, setMessages] = useState([]);
    const [stompClient, setStompClient] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    const SOCKET_URL = 'http://localhost:8080';

    useEffect(() => {
        if (stompClient && stompClient.active) {
            const subscription = stompClient.subscribe('/topic/chat/' + articleId + '/' + chatRoomId, (message) => {
                showMessage(JSON.parse(message.body));
            });

            return () => {
                subscription.unsubscribe();
            };
        }
    }, [stompClient, articleId, chatRoomId]);

    const connect = () => {
        const client = new Client({
            brokerURL: `${SOCKET_URL}/ws-stomp`,
            connectHeaders: {},
            debug: function (str) {
                console.log(str);
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            webSocketFactory: () => new SockJS(`${SOCKET_URL}/ws-stomp`),
            onConnect: () => {
                console.log('Connected!');
                setStompClient(client);
                setIsConnected(true);
            },
            onDisconnect: () => {
                console.log('Disconnected!');
                setIsConnected(false);
            },
            onStompError: (frame) => {
                console.error('Broker reported error: ' + frame.headers['message']);
                console.error('Additional details: ' + frame.body);
            },
        });

        client.activate();
    };

    const sendMessage = () => {
        if (stompClient && stompClient.active && message.trim() !== "") {
            const newMessage = {
                userNickname: nickname,
                userId: userId,
                content: message,
                timestamp: new Date().toISOString(),
                isSentByMe: true
            };

            stompClient.publish({
                destination: "/app/chat/" + articleId + "/" + chatRoomId,
                body: JSON.stringify(newMessage)
            });

            // // 내가 보낸 메시지도 바로 표시
            // showMessage(newMessage);
            setMessage('');
        }
    };

    const showMessage = (message) => {
        setMessages((prevMessages) => {
            if (message.type === "UPDATE") {
                return prevMessages.map(m =>
                    m.id === message.messageId ? {...m, content: message.content} : m
                );
            } else {
                // 메시지를 보낸 사람이 자신인지 확인
                const isSentByMe = message.userId === userId || message.isSentByMe;
                return [...prevMessages, {...message, isSentByMe}];
            }
        });
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-4">
            <div className="bg-white rounded-lg shadow p-4 mb-4">
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label htmlFor="articleId" className="block text-sm font-medium text-gray-700">게시글 ID:</label>
                        <input
                            type="text"
                            id="articleId"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
                            value={articleId}
                            onChange={(e) => setArticleId(e.target.value)}
                        />
                    </div>
                    <div>
                        <label htmlFor="chatRoomId" className="block text-sm font-medium text-gray-700">채팅방 ID:</label>
                        <input
                            type="text"
                            id="chatRoomId"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
                            value={chatRoomId}
                            onChange={(e) => setChatRoomId(e.target.value)}
                        />
                    </div>
                </div>
                <div className="mb-4">
                    <label htmlFor="nickname" className="block text-sm font-medium text-gray-700">닉네임:</label>
                    <input
                        type="text"
                        id="nickname"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="userId" className="block text-sm font-medium text-gray-700">유저 id(long):</label>
                    <input
                        type="text"
                        id="userId"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                    />
                </div>
                <button
                    onClick={connect}
                    className={`w-full rounded-md px-4 py-2 text-white font-medium ${
                        isConnected ? 'bg-green-500' : 'bg-blue-500 hover:bg-blue-600'
                    }`}
                >
                    {isConnected ? '연결됨' : '입장'}
                </button>
            </div>

            <div className="bg-gray-50 rounded-lg shadow">
                <div
                    id="chat-area"
                    className="h-96 overflow-y-auto p-4 space-y-4"
                >
                    {messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`flex ${msg.isSentByMe ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[70%] rounded-lg p-3 ${
                                    msg.isSentByMe
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-200 text-gray-800'
                                }`}
                            >
                                <div className="break-words">
                                    {msg.type === "UPDATE" ? `${msg.userNickname} : ${msg.content}` : `${msg.userNickname} : ${msg.content}`}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-4 border-t">
                    <div className="flex space-x-2">
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            disabled={!isConnected}
                            className="flex-1 rounded-md border-gray-300 shadow-sm p-2"
                            placeholder={isConnected ? "메시지를 입력하세요..." : "채팅방에 입장해주세요"}
                        />
                        <button
                            onClick={sendMessage}
                            disabled={!isConnected}
                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300"
                        >
                            전송
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TEST;