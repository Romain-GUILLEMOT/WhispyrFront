import {Outlet} from '@tanstack/react-router';
import Header from '@/components/elements/Header';
import Sidebar from '@/components/elements/Sidebar';
import {useEffect} from 'react';
import {useUser} from "@/providers/UserProvider";
import LoadingFull from "@/components/elements/LoadingFull";
import {WebSocketProvider} from "@/providers/WebSocketProvider";
import DebugOverlay from "@/components/DebugModal";
import {ChannelProvider} from "@/providers/ChannelProvider";
import {ServerProvider} from "@/providers/ServerProvider";

export default function App() {
    const {user, isLoading: userLoading} = useUser();

    useEffect(() => {
        if (!userLoading && user && !user.authentificated && !window.location.pathname.startsWith('/auth')) {
            window.location.href = '/auth/login';
        }
    }, [user, userLoading]);

    if (userLoading || user === null) {
        return <LoadingFull/>;
    }

    const { id, username, avatar } = user;
    const shouldMountWebSocketProvider = user.authentificated && id && username;

    return (
        <>
            {shouldMountWebSocketProvider ? (
                <WebSocketProvider
                    currentUserId={id}
                    currentUserUsername={username}
                    currentUserAvatar={avatar}
                >
                    <ServerProvider>
                        <ChannelProvider>
                            <div className="flex h-screen w-full bg-glass-dark text-gray-200">
                                <Sidebar/>
                                {/* Le layout du chat (avec la 2ème sidebar) sera rendu par l'Outlet */}
                                <Outlet/>
                            </div>
                            <DebugOverlay/>
                        </ChannelProvider>
                    </ServerProvider>
                </WebSocketProvider>
            ) : (
                <Outlet/>
            )}
        </>
    );
}
