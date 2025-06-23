import React, { createContext, useContext, useState, useEffect, useRef, useCallback, type ReactNode } from 'react';
import Cookies from "js-cookie";

// Définition des types pour les messages front-end
export type Message = {
    type: "chat" | "presence" | "join_server" | "heartbeat";
    serverId?: string; // Optionnel pour les messages de chat et join_server
    userId?: string;   // Optionnel pour les messages de présence
    username: string;
    avatar?: string;   // Optionnel
    content: string;
    timestamp?: number; // Optionnel, ajouté par le backend
    status?: "online" | "offline"; // Optionnel pour la présence
};

export type ChatMessage = Omit<Message, 'type' | 'status'> & {
    type: "chat";
    serverId: string;
    userId: string;
    username: string;
    timestamp: number;
};

export type PresenceMessage = Omit<Message, 'type' | 'content'> & {
    type: "presence";
    userId: string;
    username: string;
    status: "online" | "offline";
};

// Interface pour le contexte WebSocket
interface WebSocketContextType {
    sendMessage: (message: Omit<Message, 'username' | 'avatar' | 'userId' | 'timestamp'>) => void;
    currentServerId: string | null;
    setCurrentServerId: (serverId: string) => void;
    messages: { [serverId: string]: ChatMessage[] }; // Messages par ID de serveur
    onlineUsers: { [userId: string]: { username: string; avatar?: string; status: "online" | "offline" } };
    isConnected: boolean;
    error: Event | null;
}

// Création du contexte
const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

// Props pour le fournisseur
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
    const [messages, setMessages] = useState<{ [serverId: string]: ChatMessage[] }>({});
    const [onlineUsers, setOnlineUsers] = useState<{ [userId: string]: { username: string; avatar?: string; status: "online" | "offline" } }>({});
    const [currentServerId, _setCurrentServerId] = useState<string | null>(null);

    // Ajout d'un ref pour suivre si le WebSocket a déjà été initialisé
    const wsInitialized = useRef(false);

    const sendMessage = useCallback((message: Omit<Message, 'username' | 'avatar' | 'userId' | 'timestamp'>) => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            const fullMessage: Message = {
                ...message,
                userId: currentUserId,
                username: currentUserUsername,
                avatar: currentUserAvatar,
            };
            ws.current.send(JSON.stringify(fullMessage));
        } else {
            console.warn('WebSocket is not open. Message not sent:', message);
        }
    }, [currentUserId, currentUserUsername, currentUserAvatar]);

    const setCurrentServerId = useCallback((serverId: string) => {
        _setCurrentServerId(serverId);

        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            sendMessage({
                type: 'join_server',
                serverId: serverId,
                content: `joined server ${serverId}`,
            });
        }
    }, [sendMessage]);

    useEffect(() => {
        // Cette condition empêche la double initialisation en mode StrictMode
        if (wsInitialized.current) {
            return;
        }
        wsInitialized.current = true; // Marque le WebSocket comme initialisé

        const token = Cookies.get("access_token");
        if (!token) {
            console.error('No JWT token found for WebSocket connection. Skipping connection attempt.');
            return;
        }

        const wsUrl = `${import.meta.env.VITE_API_BASE_URL.replace('http', 'ws')}/ws?token=${token}`;
        console.log('DEBUG: WebSocketProvider - Attempting connection to:', wsUrl);

        ws.current = new WebSocket(wsUrl);

        ws.current.onopen = () => {
            setIsConnected(true);
            setError(null);
            console.log('🔗 WebSocket CONNECTED! (onopen triggered)');

            const heartbeatInterval = setInterval(() => {
                if (ws.current && ws.current.readyState === WebSocket.OPEN) {
                    sendMessage({ type: 'heartbeat', content: 'ping' });
                }
            }, 25000);

            return () => clearInterval(heartbeatInterval);
        };

        ws.current.onmessage = (event) => {
            console.log('DEBUG: WebSocket onmessage received:', event.data);
            try {
                const msg: Message = JSON.parse(event.data);
                switch (msg.type) {
                    case 'chat':
                        setMessages((prevMessages) => ({
                            ...prevMessages,
                            [msg.serverId!]: [...(prevMessages[msg.serverId!] || []), msg as ChatMessage],
                        }));
                        break;
                    case 'presence':
                        setOnlineUsers((prevOnlineUsers) => ({
                            ...prevOnlineUsers,
                            [msg.userId!]: {
                                username: msg.username,
                                avatar: msg.avatar,
                                status: msg.status!,
                            },
                        }));
                        break;
                    default:
                        console.warn('DEBUG: Unknown message type received:', msg.type, msg);
                }
            } catch (err) {
                console.error('❌ DEBUG: Error parsing or processing WebSocket message:', err, event.data);
                setError(new Event('ParsingError'));
            }
        };

        ws.current.onclose = (e) => {
            setIsConnected(false);
            console.log('🔌 WebSocket DISCONNECTED! (onclose triggered):', e.code, e.reason);
            // Empêchez les tentatives de reconnexion en chaîne si le composant est en train de se démonter pour de bon
            if (!wsInitialized.current) { // Si wsInitialized.current est false, cela signifie un réel démontage
                return;
            }
            setTimeout(() => {
                console.log('DEBUG: Attempting WebSocket reconnect...');
                if (Cookies.get("access_token")) {
                    ws.current = new WebSocket(wsUrl);
                    wsInitialized.current = false; // Réinitialise pour permettre une nouvelle initialisation après reconnexion
                }
            }, 3000);
        };

        ws.current.onerror = (e) => {
            console.error('❌ WebSocket ERROR! (onerror triggered):', e);
            setError(e);
            ws.current?.close();
        };

        return () => {
            // Le cleanup est toujours appelé, mais on ne ferme la connexion
            // que si elle a été initialisée et n'est pas en cours de reconnexion temporaire
            if (ws.current && ws.current.readyState === WebSocket.OPEN) {
                console.log('DEBUG: WebSocket cleanup function called. Closing active connection.');
                ws.current.close();
            }
            ws.current = null;
            wsInitialized.current = false; // Réinitialise le flag lors du démontage réel
        };
    }, [sendMessage, currentServerId, currentUserId, currentUserUsername, currentUserAvatar]);

    const contextValue = {
        sendMessage,
        currentServerId,
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

// Hook personnalisé pour utiliser le contexte WebSocket
export const useWebSocket = () => {
    const context = useContext(WebSocketContext);
    if (context === undefined) {
        throw new Error('useWebSocket must be used within a WebSocketProvider');
    }
    return context;
};
