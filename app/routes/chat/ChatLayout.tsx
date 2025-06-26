import React, {useEffect} from 'react';
import {Outlet, useParams} from '@tanstack/react-router';
import Header from '@/components/elements/Header';
import useSWR from "swr";
import {type Server, useServer} from "@/providers/ServerProvider";
import {kyFetcher} from "@/api/http";
import ChannelsSidebar from "@/components/elements/ChannelsSidebar";

export default function ChatLayout() {
    const { serverId } = useParams({ from: '/chat/$serverId' });
    const { setCurrentServer, currentServer } = useServer();
    const { data: servers } = useSWR<Server[]>('servers', kyFetcher);

    // *** CORRECTION DU BUG DE RECHARGEMENT ***
    useEffect(() => {
        // Si on a un serverId dans l'URL et que le provider n'est pas (encore) à jour
        if (serverId && servers && currentServer?.server_id !== serverId) {
            const serverFromUrl = servers.find(s => s.server_id === serverId);
            if (serverFromUrl) {
                setCurrentServer(serverFromUrl);
            }
        }
    }, [serverId, servers, currentServer, setCurrentServer]);

    return (
        <div className="flex-1 flex min-w-0 p-2 gap-2">
            <ChannelsSidebar />
            <div className="flex-1 flex flex-col min-w-0 bg-glass-medium/80 backdrop-blur-xl border border-glass-border rounded-r-2xl">
                <Header/>
                <main className="flex-1 flex overflow-y-hidden">
                    <Outlet/>
                </main>
            </div>
        </div>
    );
}
