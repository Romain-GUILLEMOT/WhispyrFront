// Fichier : src/routes/chat/ChatLayout.tsx (ou le nom correspondant à votre route /chat/$serverId)

import React, { useEffect } from 'react';
import { Outlet, useParams } from '@tanstack/react-router';
import useSWR from "swr";
import { type Server, useServer } from "@/providers/ServerProvider";
import { kyFetcher } from "@/api/http";
import ChannelsSidebar from "@/components/elements/ChannelsSidebar";
import Header from "@/components/elements/Header";
// AJOUT : Importer le hook WebSocket
import { useWebSocket } from "@/providers/WebSocketProvider";

export default function ChatLayout() {

    return (
        <div className="flex-1 flex min-w-0 p-2 gap-2">
            {/* ChannelsSidebar n'a plus besoin de logique de connexion, juste d'affichage */}
            <div className="flex-1 flex flex-col min-w-0 bg-glass-medium/80 backdrop-blur-xl border border-glass-border rounded-r-2xl">
                <Header/>
                <main className="flex-1 flex overflow-y-hidden">
                    <Outlet/>
                </main>
            </div>
        </div>
    );
}
