import React from 'react';
import { Outlet, useParams } from '@tanstack/react-router';
import ChannelsSidebar from '@/components/elements/ChannelsSidebar';

export default function ServerLayout() {
    // On récupère le serverId depuis les paramètres de sa propre route parente
    const { serverId } = useParams({ from: '/chat/$serverId' });

    return (
        <div className="flex h-full w-full">
            <div className="flex-1 h-full">
                {/* L'Outlet rendra soit NoChannels, soit ChannelMessagesContainer */}
                <Outlet />
            </div>
        </div>
    );
}
