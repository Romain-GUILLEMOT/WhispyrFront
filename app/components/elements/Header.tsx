import React from 'react';
import { useUser } from '@/providers/UserProvider';
import { useChannel } from '@/providers/ChannelProvider';
import { BellIcon, UserGroupIcon } from '@heroicons/react/24/solid';
import { HashtagIcon } from '@heroicons/react/20/solid';
import {useWebSocket} from "@/providers/WebSocketProvider";

export default function Header() {
    const { user } = useUser();
    const { currentServer } = useWebSocket();

    if (!user) return null;



    return (
        <header className="h-[57px] flex-shrink-0 flex items-center justify-between px-6 border-b border-glass-border rounded-tr-2xl">
            <div className="flex items-center gap-2 text-white">
                <h1 className="font-bold text-lg">
                    {currentServer?.name || ""}
                </h1>
            </div>

            <div className="flex items-center gap-5">
                <button className="text-gray-400 hover:text-white transition-colors" title="Notifications">
                    <BellIcon className="w-5 h-5"/>
                </button>
                <button className="text-gray-400 hover:text-white transition-colors" title="Liste des membres">
                    <UserGroupIcon className="w-5 h-5"/>
                </button>
                <div className="w-px h-6 bg-glass-border"></div>
                <div className="flex items-center gap-3">
                    <span className="font-semibold text-sm text-gray-200">{user.username}</span>
                    <img
                        src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=373049&color=D9C9FF&bold=true&size=128`}
                        alt="Avatar de l'utilisateur"
                        className="w-8 h-8 rounded-full object-cover"
                    />
                </div>
            </div>
        </header>
    );
}
