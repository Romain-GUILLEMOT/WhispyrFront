import { lazyRouteComponent, createRoute, redirect } from '@tanstack/react-router';
import { kyFetcher } from '@/api/http';
import App from '@/App';
import { createRootRoute } from '@tanstack/react-router';
import {useWebSocket} from "@/providers/WebSocketProvider";
import type {ChannelsAPI} from "@/types/channelsList";



// --- Définition des Routes ---

// 1. Route Racine
export const rootRoute = createRootRoute({
    component: App,
});

// 2. Routes principales
export const homeRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    beforeLoad: async ({ location }) => {
        console.log(`Tentative d'accès a: ${location.pathname}`);
    },
    component: lazyRouteComponent(() => import('@/routes/home')),
});

export const loginRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/auth/login',
    beforeLoad: async ({ location }) => {
        console.log(`Tentative d'accès a: ${location.pathname}`);
    },
    component: lazyRouteComponent(() => import('@/routes/auth/LoginContainer')),
})

// 3. Route "Layout" pour la section de chat
export const chatRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: 'chat',
    beforeLoad: async ({ location }) => {
        console.log(`Tentative d'accès a: ${location.pathname}`);
    },
    component: lazyRouteComponent(() => import('@/routes/chat/ChatLayout')),
});

// 4. ROUTE PARENTE pour un serveur spécifique
export const serverRoute = createRoute({
    getParentRoute: () => chatRoute,
    path: '$serverId',
    beforeLoad: async ({ location }) => {
        console.log(`Tentative d'accès a: ${location.pathname}`);
    },
    component: lazyRouteComponent(() => import('@/routes/chat/ServerLayout')),
});


// 5. Route d'index pour un serveur (gère la redirection vers le premier salon)
export const serverIndexRoute = createRoute({
    getParentRoute: () => serverRoute, // Le parent est bien `serverRoute`
    path: '/',
    beforeLoad: async ({ location }) => {
        console.log(`Tentative d'accès: ${location.pathname}`);
    }, // Le chemin est maintenant unique car il est relatif à son parent
    loader: async ({ params }) => {
        let categories: ChannelsAPI;
        try {
            categories = await kyFetcher(`server/${params.serverId}/channels`) as ChannelsAPI;
        } catch (error) {
            console.error("Impossible de fetch les salons :", error);
            // En cas d'échec du fetch, on retourne un objet vide pour rendre le composant NoChannels
            return {};
        }

        const firstChannel = categories?.categories[0]?.channels?.[0];
        // Si on trouve un salon, on lance la redirection en dehors du bloc try...catch
        if (firstChannel && firstChannel.channel_id) {
            throw redirect({
                to: '/chat/$serverId/$channelId',
                params: {
                    serverId: params.serverId,
                    channelId: firstChannel.channel_id,
                },
                replace: true,
            });
        }

        // S'il n'y a pas de salons, on retourne un objet vide pour rendre le composant NoChannels
        return {};
    },
    component: lazyRouteComponent(() => import('@/routes/chat/NoChannels')),
})

// 6. Route pour un salon spécifique
export const channelRoute = createRoute({
    getParentRoute: () => serverRoute, // Le parent est bien `serverRoute`
    path: '$channelId', // Le chemin est relatif à son parent
    beforeLoad: async ({ location }) => {
        console.log(`Tentative d'accès a: ${location.pathname}`);
    },
    component: lazyRouteComponent(() => import('@/routes/chat/ChannelMessagesContainer')),
});
