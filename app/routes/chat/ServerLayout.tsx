import React, {useEffect} from 'react';
import {Outlet, useLocation, useParams} from '@tanstack/react-router';
import {useWebSocket} from "@/providers/WebSocketProvider";
import ChannelsSidebar from "@/components/elements/ChannelsSidebar";
import Header from "@/components/elements/Header";
import {type Server, useServer} from "@/providers/ServerProvider";
import {kyFetcher} from "@/api/http";
import useSWR from "swr";

export default function ServerLayout() {
    // On récupère le serverId depuis les paramètres de sa propre route parente
    // Le `useParams` est correct, il récupère l'ID depuis l'URL
    const { serverId } = useParams({ from: '/chat/$serverId' });
    const { pathname } = useLocation();
    const basePath = `/chat/${serverId}`;
    const remainingPath = pathname.substring(basePath.length);
    const hasExtraSegments = remainingPath.length > 0 && remainingPath !== '/';
    // --- Récupération de tous les providers nécessaires ---
    const { setCurrentServer, currentServer: uiServer } = useServer();
    const { data: servers } = useSWR<Server[]>('servers', kyFetcher);
    const { setCurrentServerId, currentServer: wsServer, isConnected } = useWebSocket();

    // *** LE HOOK useEffect UNIFIÉ ET CORRIGÉ ***
    useEffect(() => {
        // On trouve les informations complètes du serveur à partir de la liste récupérée
        const serverFromUrl = servers?.find(s => s.server_id === serverId);

        if (serverFromUrl) {
            // Étape 1 : Mettre à jour l'état de l'UI (ServerProvider)
            // Cela garantit que les composants comme le Header affichent le bon nom.
            if (uiServer?.server_id !== serverFromUrl.server_id) {
                setCurrentServer(serverFromUrl);
            }


        }
        if(!hasExtraSegments && (!wsServer || wsServer.id !== serverId)) {
            setCurrentServerId(serverId)
        }
        // Le tableau de dépendances s'assure que cette logique s'exécute à chaque changement pertinent.
    }, [serverId, servers, uiServer, wsServer, isConnected, setCurrentServer, setCurrentServerId]);

    return (
        <>
            <ChannelsSidebar />

        <div className="flex h-full w-full">
            <div className="flex-1 h-full">
                {/* L'Outlet rendra soit NoChannels, soit ChannelMessagesContainer */}
                <Outlet />
            </div>
        </div>
        </>
    );
}
