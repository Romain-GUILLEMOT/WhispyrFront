import React, { useEffect } from 'react';
import { useParams } from '@tanstack/react-router';
import { useWebSocket } from '@/providers/WebSocketProvider';
import ChatServer from '@/components/ChatServer'; // Votre composant existant

export default function ChannelMessagesContainer() {
    const { serverId, channelId } = useParams({ from: '/chat/$serverId/$channelId' });
    const { setCurrentServerId } = useWebSocket();

    // On notifie le WebSocketProvider qu'on est sur un serveur,
    // mais la logique de "join" d'un salon spécifique se fait maintenant via le chat
    useEffect(() => {
        if (serverId) {
            setCurrentServerId(serverId);
        }
    }, [serverId, setCurrentServerId]);

    // Maintenant, on charge l'historique des messages pour le *salon*
    /*const { data: historyResponse, isLoading } = useSWR(
        channelId ? `channels/${channelId}/messages` : null,
        kyFetcher
    );
*/
    if (!channelId) {
        return <div className="p-4 text-center text-gray-400">Sélectionnez un salon pour commencer.</div>;
    }

    /*if (isLoading) {
        return <div className="p-4 text-center text-gray-400">Chargement des messages...</div>
    }
*/
    return (
        <ChatServer
            initialMessages={/*historyResponse?.data || */[]}
        />
    );
}
