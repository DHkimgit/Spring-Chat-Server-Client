import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import io from 'socket.io-client';

const SOCKET_URL = 'http://localhost:8080';

export const createStompConnection = (options, authtoken) => {
    const client = new Client({
        brokerURL: `${SOCKET_URL}/ws-stomp`,
        connectHeaders: {
            Authorization: authtoken
        },
        debug: function (str) {
            console.log(str);
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        webSocketFactory: () => new SockJS(`${SOCKET_URL}/ws-stomp`),
        ...options,
    });

    return client;
};

export const createSocketIOConnection = () => {
    return io(SOCKET_URL);
};