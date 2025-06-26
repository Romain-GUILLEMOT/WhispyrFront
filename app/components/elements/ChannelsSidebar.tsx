// Fichier: src/components/elements/ChannelsSidebar.tsx (CORRIGÉ)

import React, { useEffect } from 'react';
import useSWR from 'swr';
import { kyFetcher } from '@/api/http';
import { Link, useNavigate, useRouterState } from '@tanstack/react-router';
import Loading from './Loading';
import { useServer } from '@/providers/ServerProvider';
import { useChannel, type Channel } from '@/providers/ChannelProvider';
import { Cog6ToothIcon, HashtagIcon } from '@heroicons/react/24/outline';
// Assurez-vous que useWebSocket est importé
import { useWebSocket } from "@/providers/WebSocketProvider";

interface Category {
    category_id: string;
    name: string;
    channels: Channel[];
}

export default function ChannelsSidebar() {
    const navigate = useNavigate();
    const { currentServer } = useServer();
    const { currentChannel, setCurrentChannel } = useChannel();

    // --- MODIFICATION 1 : Récupérer 'isConnected' depuis le WebSocketProvider ---
    const { setCurrentServerId, currentServer: wsServer, isConnected } = useWebSocket();

    const location = useRouterState({ select: (s) => s.location });
    const activeChannelId = (() => {
        const match = location.pathname.match(/^\/chat\/[^/]+\/([^/]+)$/);
        return match?.[1];
    })();

    const { data: categories, error, isLoading } = useSWR<Category[]>(
        currentServer ? `servers/${currentServer.server_id}/channels` : null,
        kyFetcher
    );

    useEffect(() => {
        if (activeChannelId && categories && categories.length > 0) {
            for (const category of categories) {
                const channel = category.channels.find(c => c.channel_id === activeChannelId);
                if (channel) {
                    setCurrentChannel(channel);
                    break;
                }
            }
        }
    }, [activeChannelId, categories, setCurrentChannel]);

    // --- MODIFICATION 2 : Le useEffect qui rejoint le serveur est maintenant conscient de l'état de la connexion ---
    useEffect(() => {
        // On vérifie que le serveur de l'URL existe,
        // ET que la connexion WebSocket est active,
        // ET que ce n'est pas déjà le serveur auquel on est connecté.
        if (currentServer && isConnected && currentServer.server_id !== wsServer?.id) {
            setCurrentServerId(currentServer.server_id);
        }
        // 'isConnected' est ajouté au tableau des dépendances
    }, [currentServer, wsServer, isConnected, setCurrentServerId]);

    useEffect(() => {
        if (currentServer && categories?.length) {
            const firstChannel = categories[0]?.channels?.[0];
            if (firstChannel && !activeChannelId) {
                setCurrentChannel(firstChannel);
                navigate({
                    to: '/chat/$serverId/$channelId',
                    params: { serverId: currentServer.server_id, channelId: firstChannel.channel_id },
                    replace: true,
                });
            }
        }
    }, [categories, currentServer, navigate, activeChannelId, setCurrentChannel]);

    if (!currentServer) {
        return <aside className="w-60 flex-shrink-0 bg-glass-medium/80 backdrop-blur-xl border-r border-glass-border rounded-l-2xl"></aside>;
    }

    return (
        <aside className="w-60 flex-shrink-0 bg-glass-medium/80 backdrop-blur-xl border-r border-glass-border rounded-l-2xl flex flex-col">
            <header className="p-4 h-[57px] flex items-center justify-between border-b border-glass-border shadow-md shrink-0">
                <h1 className="font-bold text-lg text-white truncate">{currentServer.name}</h1>
                <button className="text-gray-400 hover:text-white transition-colors">
                    <Cog6ToothIcon className="w-5 h-5"/>
                </button>
            </header>

            <nav className="flex-1 overflow-y-auto p-2 space-y-4 no-scrollbar">
                {isLoading && <div className="p-2"><Loading/></div>}
                {error && <div className="p-2 text-red-400">Erreur de chargement.</div>}
                {categories?.map((category) => (
                    <div key={category.category_id}>
                        <h3 className="px-2 mb-1 text-xs font-bold uppercase text-whisper-300 tracking-wider">{category.name}</h3>
                        <ul className="space-y-1">
                            {category.channels.map((channel) => (
                                <li key={channel.channel_id} onClick={() => setCurrentChannel(channel)}>
                                    <Link
                                        to="/chat/$serverId/$channelId"
                                        params={{ serverId: currentServer.server_id, channelId: channel.channel_id }}
                                        className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-base font-medium transition-all duration-150 group ${activeChannelId === channel.channel_id
                                            ? 'bg-whisper-500/20 text-white'
                                            : 'text-gray-400 hover:bg-white/10 hover:text-gray-200'}`}
                                    >
                                        <HashtagIcon className="w-5 h-5 text-gray-500" />
                                        <span className="truncate">{channel.name}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </nav>
        </aside>
    );
}
