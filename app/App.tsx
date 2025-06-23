import { Outlet } from '@tanstack/react-router';
import Header from '@/components/elements/Header';
import Sidebar from '@/components/elements/Sidebar';
import { PhoneIcon } from '@heroicons/react/24/solid';
import { XMarkIcon } from '@heroicons/react/20/solid';
import {useEffect, useState} from 'react';
import {useUser} from "@/providers/UserProvider";
import LoadingFull from "@/components/elements/LoadingFull";
import {WebSocketProvider} from "@/providers/WebSocketProvider";
import DebugOverlay from "@/components/DebugModal";

export default function App() {
    const [isContactOpen, setContactOpen] = useState(false);
    const [isContactIcon, setContactIcon] = useState(true);
    const {user, isLoading: userLoading} = useUser();

    useEffect(() => {
        if (!userLoading && user && !user.authentificated && !window.location.pathname.startsWith('/auth')) {
            console.log("Redirection vers la page de connexion, user non authentifié:", user);
            window.location.href = '/auth/login';
        }
    }, [user, userLoading]);

    if (userLoading || user === null) {
        return <LoadingFull/>;
    }

    const currentUserId = user.id ?? '';
    const currentUserUsername = user.username ?? '';
    const currentUserAvatar = user.avatar ?? '';

    // Condition pour déterminer si le WebSocketProvider doit être monté.
    // Il doit rester stable après la première authentification.
    const shouldMountWebSocketProvider = user.authentificated && currentUserId !== '' && currentUserUsername !== '';

    return (
        <>
            {/* Le WebSocketProvider est rendu de manière conditionnelle, mais la condition doit être stable */}
            {shouldMountWebSocketProvider ? (
                <WebSocketProvider
                    currentUserId={currentUserId}
                    currentUserUsername={currentUserUsername}
                    currentUserAvatar={currentUserAvatar}
                >
                    <div className="flex h-screen w-full bg-[#121212] text-[#F4F4F4]">
                        <Sidebar />
                        <div className="flex-1 flex flex-col">
                            <Header />
                            <main className="flex-1 overflow-y-auto p-4 flex">
                                <Outlet />
                            </main>
                        </div>
                    </div>
                    <DebugOverlay />
                </WebSocketProvider>
            ) : (
                // Si non authentifié ou données manquantes, affichez seulement l'Outlet
                // (pour les routes d'authentification ou pages publiques)
                <>
                    <Outlet />
                    <DebugOverlay /></>
            )}

            {!isContactIcon && (
                <div
                    className="fixed bottom-5 right-5 w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-xl border-ozlaloc-600 border-2 cursor-pointer"
                    onClick={() => setContactOpen(!isContactOpen)}
                    title="Contactez-nous"
                >
                    <PhoneIcon className="h-6 w-6 text-ozlaloc-600" />
                    <div
                        className="absolute -top-1 -right-1 w-5 h-5 text-white bg-ozlaloc-600 opacity-50 text-xs flex items-center justify-center rounded-full cursor-pointer"
                        onClick={(e) => {
                            e.stopPropagation();
                            setContactIcon(false);
                        }}
                        title="Fermer"
                    >
                        <XMarkIcon className="h-full w-full text-white" />
                    </div>
                </div>
            )}
        </>
    );
}
