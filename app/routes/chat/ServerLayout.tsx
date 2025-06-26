import React from 'react';
import { Outlet } from '@tanstack/react-router';

export default function ServerLayout() {
    // On récupère le serverId depuis les paramètres de sa propre route parente

    return (
        <div className="flex h-full w-full">
            <div className="flex-1 h-full">
                {/* L'Outlet rendra soit NoChannels, soit ChannelMessagesContainer */}
                <Outlet />
            </div>
        </div>
    );
}
