import React, { createContext, useContext, useState, useEffect, useRef, useCallback, type ReactNode } from 'react';
import Cookies from "js-cookie";

// Le type pour l'objet serveur
export type ServerInfo = {
    id: string;
    name: string;
};

// Types de messages pour la communication WebSocket
export type Message = {
    type: "chat" | "presence" | "join_server" | "join_server_success" | "join_channel" | "join_channel_success" | "leave_server" | "leave_server_success" | "leave_channel" | "leave_channel_success" | "heartbeat";
    serverId?: string;
    channelId?: string;
    channelName?: string;
    serverName?: string;
    userId?: string;
    username?: string; // Peut être omis pour les messages envoyés depuis le client (auto-rempli par le backend)
    avatar?: string;   // Peut être omis pour les messages envoyés depuis le client
    content: string;
    timestamp?: number;
    status?: "online" | "offline" | "left_server"; // Ajout de "left_server" pour les états de présence
};

export type ChatMessage = Omit<Message, 'type' | 'status' | 'username' | 'avatar'> & {
    type: "chat";
    serverId: string;
    channelId: string;
    userId: string;
    username: string; // Doit être présent pour les messages de chat reçus
    avatar?: string;
    timestamp: number;
};

// Interface pour le contexte WebSocket
interface WebSocketContextType {
    sendMessage: (message: Omit<Message, 'username' | 'avatar' | 'userId' | 'timestamp'>) => void;
    currentServer: ServerInfo | null;
    currentChannel: ServerInfo | null;
    setCurrentServerId: (serverId: string) => void;
    setCurrentChannelId: (serverId: string, channelId: string) => void; // Nouvelle fonction pour rejoindre un canal
    leaveCurrentChannel: (serverId: string, channelId: string) => void; // Nouvelle fonction pour quitter un canal
    leaveCurrentServer: (serverId: string) => void; // Nouvelle fonction pour quitter un serveur
    messages: { [channelId: string]: ChatMessage[] };
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
    const [messages, setMessages] = useState<{ [channelId: string]: ChatMessage[] }>({});
    const [onlineUsers, setOnlineUsers] = useState<{ [userId: string]: { username: string; avatar?: string; status: "online" | "offline" } }>({});
    const reconnectTimeoutId = useRef<number | null>(null);
    const heartbeatIntervalId = useRef<number | null>(null); // Réf pour l'intervalle du heartbeat
    const [currentServer, setCurrentServer] = useState<ServerInfo | null>(null);
    const [currentChannel, setCurrentChannel]  = useState<ServerInfo | null>(null);
    // Fonction générique pour envoyer des messages via WebSocket
    const sendMessage = useCallback((message: Omit<Message, 'username' | 'avatar' | 'userId' | 'timestamp'>) => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            const fullMessage: Partial<Message> = {
                ...message,
                userId: currentUserId,
                username: currentUserUsername,
                avatar: currentUserAvatar,
            };
            ws.current.send(JSON.stringify(fullMessage));
        } else {
            console.warn('WebSocket non connecté ou non prêt. Message non envoyé:', message);
        }
    }, [currentUserId, currentUserUsername, currentUserAvatar]);

    // Fonction pour demander à rejoindre un serveur
    const setCurrentServerId = useCallback((serverId: string) => {
        // Optionnel: réinitialiser currentServer ici si vous voulez un affichage immédiat de "connexion au serveur..."
        // setCurrentServer(null);
        //console.log("Join BO")
        //console.log(ws)
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            console.log("Join Server")

            sendMessage({
                type: 'join_server',
                serverId: serverId,
                content: '',
            });
        }
    }, [sendMessage]);

    // Fonction pour demander à quitter un serveur
    const leaveCurrentServer = useCallback((serverId: string) => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            sendMessage({
                type: 'leave_server',
                serverId: serverId,
                content: '',
            });
        }
        setCurrentServer(null); // Réinitialise l'état local du serveur
    }, [sendMessage]);

    // Fonction pour demander à rejoindre un canal
    const setCurrentChannelId = useCallback((serverId: string, channelId: string) => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            sendMessage({
                type: 'join_channel',
                serverId: serverId,
                channelId: channelId,
                content: '',
            });
        }
    }, [sendMessage]);

    // Fonction pour demander à quitter un canal
    const leaveCurrentChannel = useCallback((serverId: string, channelId: string) => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            sendMessage({
                type: 'leave_channel',
                serverId: serverId,
                channelId: channelId,
                content: '',
            });
        }
        // Pas besoin de réinitialiser les messages du canal ici, ils restent en cache pour un retour rapide
    }, [sendMessage]);

    useEffect(() => {
        const connect = () => {
            const token = Cookies.get("access_token");
            if (!token) {
                console.error('❌ Aucun jeton d\'accès trouvé. Impossible de se connecter au WebSocket.');
                return;
            }

            const wsUrl = `${import.meta.env.VITE_API_BASE_URL.replace('http', 'ws')}/ws?token=${token}`;
            const newWs = new WebSocket(wsUrl);
            ws.current = newWs;

            newWs.onopen = () => {
                setIsConnected(true);
                setError(null); // Réinitialise l'erreur en cas de reconnexion réussie
                console.log('🔗 WebSocket CONNECTED!');

                // Démarrage de l'envoi de heartbeat
                if (heartbeatIntervalId.current) {
                    clearInterval(heartbeatIntervalId.current);
                }
                heartbeatIntervalId.current = window.setInterval(() => {
                    sendMessage({ type: 'heartbeat', content: 'ping' });
                }, 25000); // Envoie un heartbeat toutes les 25 secondes
            };

            newWs.onmessage = (event) => {
                try {
                    const msg: Message = JSON.parse(event.data);
                    switch (msg.type) {
                        case 'chat':
                            if (msg.channelId) {
                                setMessages((prev) => ({
                                    ...prev,
                                    [msg.channelId]: [...(prev[msg.channelId] || []), msg as ChatMessage],
                                }));
                            }
                            break;
                        case 'presence':
                            if (msg.userId && msg.status) { // S'assurer que userId et status sont présents
                                setOnlineUsers((prev) => ({ ...prev, [msg.userId]: { username: msg.username || 'Inconnu', avatar: msg.avatar, status: msg.status } }));
                            }
                            break;
                        case 'join_server_success':


                            if (msg.serverId && msg.serverName) {
                                setCurrentServer({ id: msg.serverId, name: msg.serverName });
                            }
                            break;
                        case 'leave_server_success':
                            // Traiter la confirmation de départ du serveur
                            setCurrentServer(null); // Ou afficher un message de succès
                            console.log(`Successfully left server: ${msg.serverId}`);
                            break;
                        case 'join_channel_success':
                            // Optionnel: Mettre à jour un état `currentChannel` si nécessaire pour l'UI
                            console.log(`Successfully joined channel: ${msg.channelName} in server: ${msg.serverId}`);
                            if (msg.channelId && msg.channelName) {
                                setCurrentChannel({ id: msg.channelId, name: msg.channelName });
                            }
                            break;
                        case 'leave_channel_success':
                            // Optionnel: Mettre à jour un état `currentChannel`
                            console.log(`Successfully left channel: ${msg.channelId} in server: ${msg.serverId}`);
                            break;
                        // Heartbeat n'a généralement pas besoin d'être traité côté client si c'est juste un ping/pong
                        case 'heartbeat':
                            // Console.log("Heartbeat reçu", msg); // Pour le debug
                            break;
                        default:
                            console.warn('Message de type inconnu reçu:', msg.type, msg);
                            break;
                    }
                } catch (err) {
                    console.error('❌ Erreur lors du traitement du message WebSocket:', err, event.data);
                }
            };

            newWs.onerror = (e) => {
                console.error('❌ WebSocket ERROR!', e);
                setError(e);
            };

            newWs.onclose = (e) => {
                setIsConnected(false);
                if (heartbeatIntervalId.current) {
                    clearInterval(heartbeatIntervalId.current); // Arrête le heartbeat
                    heartbeatIntervalId.current = null;
                }
                console.log('🔌 WebSocket DISCONNECTED:', e.code, e.reason);
                // Tente de se reconnecter après un délai
                reconnectTimeoutId.current = window.setTimeout(connect, 3000);
            };
        };

        connect();

        // Fonction de nettoyage à l'unmount du composant
        return () => {
            if (reconnectTimeoutId.current) {
                clearTimeout(reconnectTimeoutId.current);
            }
            if (heartbeatIntervalId.current) {
                clearInterval(heartbeatIntervalId.current);
            }
            if (ws.current) {
                ws.current.onclose = null; // Empêche la reconnexion automatique lors de la fermeture intentionnelle
                ws.current.close();
            }
        };
    }, [sendMessage]); // Dépendance à sendMessage pour que heartbeat utilise la dernière version

    const contextValue = {
        sendMessage,
        currentServer,
        currentChannel,
        setCurrentServerId,
        setCurrentChannelId, // Ajouté
        leaveCurrentChannel, // Ajouté
        leaveCurrentServer,  // Ajouté
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
