// src/routes/chat/ServerChatContainer.tsx
import React, { useEffect } from 'react';
import { useParams } from '@tanstack/react-router'; // Pour récupérer les paramètres d'URL
import { useWebSocket } from '@/providers/WebSocketProvider'; // Votre hook WebSocket
import ChatServer from '@/components/ChatServer'; // Votre composant de chat

// Vous pouvez ajouter des imports pour useSWR et kyFetcher ici si vous voulez charger l'historique
import useSWR from "swr";
import { kyFetcher } from "@/api/http"; // Assurez-vous que kyFetcher est correctement importé

interface ServerChatParams {
    serverId: string;
}

export default function ServerChatContainer() {
    // Récupérer le serverId des paramètres d'URL

    const { serverId } = useParams({ strict: false }) as ServerChatParams;
    const { setCurrentServerId, messages, isConnected } = useWebSocket();

    // Déclenchez le changement de serveur dans le WebSocketProvider
    useEffect(() => {
        if (serverId) {
            setCurrentServerId(serverId);
            // Optionnel: Ici, vous pouvez charger l'historique des messages pour ce serveur
            // via une API REST.
        }
    }, [serverId, setCurrentServerId]);

    // Charger l'historique des messages via SWR
    // La clé SWR changera avec serverId, déclenchant une nouvelle requête si nécessaire
    /*const { data: historyMessages, error: historyError, isLoading: historyLoading } = useSWR(
        serverId ? `servers/${serverId}/messages` : null, // Ne charge que si serverId est présent
        kyFetcher
    );*/

    // Si vous voulez fusionner l'historique avec les messages temps réel,
    // vous devrez gérer cela dans l'état de `ChatServer` ou ici.
    // Pour l'instant, `ChatServer` utilise uniquement les messages du WebSocketProvider.

    if (!serverId) {
        return <div className="p-4 text-center text-gray-400">Sélectionnez un serveur pour commencer à discuter.</div>;
    }

    // Affichez un loader si l'historique charge
   /* if (historyLoading) {
        return <div className="p-4 text-center text-gray-400">Chargement de l'historique du chat...</div>;
    }

    if (historyError) {
        return <div className="p-4 text-center text-red-500">Erreur de chargement de l'historique du chat.</div>;
    }
*/
    // Le composant ChatServer est maintenant responsable d'afficher les messages du serveurId actif
    // et des utilisateurs en ligne. Il n'a plus besoin du serverId comme prop directe
    // car il le récupère via useWebSocket.
    return (
        <ChatServer
            // Si vous voulez passer l'historique initial au ChatServer:
            initialMessages={/*historyMessages?.data ||*/ []} // Supposons que votre API retourne { data: [...] }
        />
    );
}
