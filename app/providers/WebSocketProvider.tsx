import React, { createContext, useContext, useState, useEffect, useRef, useCallback, type ReactNode } from 'react';
import Cookies from "js-cookie";

// Le type pour l'objet serveur que nous allons utiliser
export type ServerInfo = {
    id: string;
    name: string;
};

// --- MODIFIÉ : Ajout de `channelId` aux types de messages ---
export type Message = {
    type: "chat" | "presence" | "join_server" | "heartbeat" | "join_server_success";
    serverId?: string;
    channelId?: string; // AJOUTÉ
    serverName?: string;
    userId?: string;
    username: string;
    avatar?: string;
    content: string;
    timestamp?: number;
    status?: "online" | "offline";
};

export type ChatMessage = Omit<Message, 'type' | 'status'> & {
    type: "chat";
    serverId: string;
    channelId: string; // AJOUTÉ
    userId: string;
    username: string;
    timestamp: number;
};

// --- MODIFIÉ : La structure de `messages` est maintenant basée sur `channelId` ---
interface WebSocketContextType {
    sendMessage: (message: Omit<Message, 'username' | 'avatar' | 'userId' | 'timestamp'>) => void;
    currentServer: ServerInfo | null;
    setCurrentServerId: (serverId: string) => void;
    messages: { [channelId: string]: ChatMessage[] }; // La clé est `channelId`
    onlineUsers: { [userId: string]: { username: string; avatar?: string; status: "online" | "offline" } };
    isConnected: boolean;
    error: Event | null;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

interface WebSocketProviderProps {
    children: ReactNode;
    currentUserId: string;
    currentUserUsername: string;
    currentUserAvatar?: string;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children, currentUserId, currentUserUsername, currentUserAvatar }) => {
    const ws = useRef<WebSocket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<Event | null>(null);

    // --- MODIFIÉ : L'état des messages est maintenant un dictionnaire clé/valeur avec `channelId` comme clé ---
    const [messages, setMessages] = useState<{ [channelId: string]: ChatMessage[] }>({});

    const [onlineUsers, setOnlineUsers] = useState<{ [userId: string]: { username: string; avatar?: string; status: "online" | "offline" } }>({});
    const reconnectTimeoutId = useRef<number | null>(null);
    const [currentServer, setCurrentServer] = useState<ServerInfo | null>(null);

    const sendMessage = useCallback((message: Omit<Message, 'username' | 'avatar' | 'userId' | 'timestamp'>) => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            const fullMessage: Partial<Message> = { ...message, userId: currentUserId, username: currentUserUsername, avatar: currentUserAvatar };
            ws.current.send(JSON.stringify(fullMessage));
        }
    }, [currentUserId, currentUserUsername, currentUserAvatar]);

    const setCurrentServerId = useCallback((serverId: string) => {
        setCurrentServer(null);
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            sendMessage({
                type: 'join_server',
                serverId: serverId,
                content: '',
            });
        }
    }, [sendMessage]);

    useEffect(() => {
        const connect = () => {
            const token = Cookies.get("access_token");
            if (!token) return;

            const wsUrl = `${import.meta.env.VITE_API_BASE_URL.replace('http', 'ws')}/ws?token=${token}`;
            const newWs = new WebSocket(wsUrl);
            ws.current = newWs;
            let heartbeatInterval: number;

            newWs.onopen = () => {
                setIsConnected(true);
                console.log('🔗 WebSocket CONNECTED!');
            };

            newWs.onmessage = (event) => {
                try {
                    const msg: Message = JSON.parse(event.data);
                    switch (msg.type) {
                        // --- MODIFIÉ : On stocke les messages en utilisant leur `channelId` ---
                        case 'chat':
                            if (msg.channelId) {
                                setMessages((prev) => ({
                                    ...prev,
                                    [msg.channelId!]: [...(prev[msg.channelId!] || []), msg as ChatMessage],
                                }));
                            }
                            break;
                        case 'presence':
                            setOnlineUsers((prev) => ({ ...prev, [msg.userId!]: { username: msg.username, avatar: msg.avatar, status: msg.status! } }));
                            break;
                        case 'join_server_success':
                            setCurrentServer({ id: msg.serverId!, name: msg.serverName! });
                            break;
                        default:
                            break;
                    }
                } catch (err) {
                    console.error('❌ Error processing message:', err);
                }
            };

            newWs.onerror = (e) => {
                console.error('❌ WebSocket ERROR!', e);
                setError(e);
            };

            newWs.onclose = (e) => {
                setIsConnected(false);
                clearInterval(heartbeatInterval);
                reconnectTimeoutId.current = window.setTimeout(connect, 3000);
            };
        };

        connect();

        return () => {
            if (reconnectTimeoutId.current) clearTimeout(reconnectTimeoutId.current);
            if (ws.current) {
                ws.current.onclose = null;
                ws.current.close();
            }
        };
    }, [sendMessage]);

    const contextValue = {
        sendMessage,
        currentServer,
        setCurrentServerId,
        messages,
        onlineUsers,
        isConnected,
        error,
    };

    return (
        <WebSocketContext.Provider value={contextValue}>
            {children}
        </WebSocketContext.Provider>
    );
};

export const useWebSocket = () => {
    const context = useContext(WebSocketContext);
    if (context === undefined) {
        throw new Error('useWebSocket must be used within a WebSocketProvider');
    }
    return context;
};
