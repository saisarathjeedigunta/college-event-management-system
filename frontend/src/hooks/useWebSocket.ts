import { useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import toast from 'react-hot-toast';

interface NotificationMessage {
    content: string;
    timestamp: string;
}

export const useWebSocket = () => {
    const [notifications, setNotifications] = useState<NotificationMessage[]>([]);
    const clientRef = useRef<Client | null>(null);

    useEffect(() => {
        const socket = new SockJS('http://localhost:8080/ws');
        const client = new Client({
            webSocketFactory: () => socket,
            debug: (str) => {
                console.log('STOMP: ' + str);
            },
            onConnect: () => {
                console.log('✅ Connected to WebSocket');
                client.subscribe('/topic/events', (message) => {
                    if (message.body) {
                        const newNotification = {
                            content: message.body,
                            timestamp: new Date().toLocaleTimeString(),
                        };
                        setNotifications((prev) => [newNotification, ...prev]);

                        // Trigger toast notification
                        toast.success(message.body, {
                            duration: 5000,
                            position: 'top-right',
                            style: {
                                background: '#10B981',
                                color: '#fff',
                            },
                        });
                    }
                });
            },
            onStompError: (frame) => {
                console.error('broker reported error: ' + frame.headers['message']);
                console.error('Additional details: ' + frame.body);
            },
        });

        client.activate();
        clientRef.current = client;

        // Request Notification permission on mount
        if (Notification.permission !== 'granted') {
            Notification.requestPermission();
        }

        return () => {
            if (clientRef.current) {
                clientRef.current.deactivate();
            }
        };
    }, []);

    return { notifications };
};
