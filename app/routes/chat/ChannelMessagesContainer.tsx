import React, { useEffect } from 'react';
import { useParams } from '@tanstack/react-router';
import { useWebSocket } from '@/providers/WebSocketProvider';
import ChatServer from '@/components/ChatServer'; // Votre composant existant

export default function ChannelMessagesContainer() {
    const { setCurrentServerId, setCurrentChannelId, currentChannel, isConnected} = useWebSocket();

    // On notifie le WebSocketProvider qu'on est sur un serveur,
    // mais la logique de "join" d'un salon spécifique se fait maintenant via le chat
    const { serverId, channelId } = useParams({ from: '/chat/$serverId/$channelId' });

    useEffect(() => {
        setCurrentServerId(serverId)
        setCurrentChannelId(serverId, channelId)
        console.log('Connected to the channel: '+ channelId)
    }, [serverId, setCurrentServerId, channelId, isConnected]);
    // Maintenant, on charge l'historique des messages pour le *salon*
    /*const { data: historyResponse, isLoading } = useSWR(
        channelId ? `channels/${channelId}/messages` : null,
        kyFetcher
    );
*/
    if (!currentChannel) {
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
