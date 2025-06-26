import { lazyRouteComponent, createRoute, redirect } from '@tanstack/react-router';
import { kyFetcher } from '@/api/http';
import App from '@/App';
import { createRootRoute } from '@tanstack/react-router';

// --- Types pour les données de l'API ---
interface Server {
    server_id: string;
}
interface Channel {
    channel_id: string;
}
interface Category {
    channels: Channel[];
}

// --- Définition des Routes ---

// 1. Route Racine
export const rootRoute = createRootRoute({
    component: App,
});

// 2. Routes principales
export const homeRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: lazyRouteComponent(() => import('@/routes/home')),
});

export const loginRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/auth/login',
    component: lazyRouteComponent(() => import('@/routes/auth/LoginContainer')),
})

// 3. Route "Layout" pour la section de chat
export const chatRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: 'chat',
    component: lazyRouteComponent(() => import('@/routes/chat/ChatLayout')),
});

// 4. ROUTE PARENTE pour un serveur spécifique
export const serverRoute = createRoute({
    getParentRoute: () => chatRoute,
    path: '$serverId',
    component: lazyRouteComponent(() => import('@/routes/chat/ServerLayout')),
});


// 5. Route d'index pour un serveur (gère la redirection vers le premier salon)
export const serverIndexRoute = createRoute({
    getParentRoute: () => serverRoute, // Le parent est bien `serverRoute`
    path: '/', // Le chemin est maintenant unique car il est relatif à son parent
    loader: async ({ params }) => {
        try {
            const categories = await kyFetcher(`servers/${params.serverId}/channels`) as Category[];
            const firstChannel = categories?.[0]?.channels?.[0];

            if (firstChannel) {
                throw redirect({
                    to: '/chat/$serverId/$channelId',
                    params: {
                        serverId: params.serverId,
                        channelId: firstChannel.channel_id,
                    },
                    replace: true,
                });
            }
        } catch (error) {
            console.error("Impossible de fetch les salons pour la redirection :", error);
        }
        return {};
    },
    component: lazyRouteComponent(() => import('@/routes/chat/NoChannels')),
})

// 6. Route pour un salon spécifique
export const channelRoute = createRoute({
    getParentRoute: () => serverRoute, // Le parent est bien `serverRoute`
    path: '$channelId', // Le chemin est relatif à son parent
    component: lazyRouteComponent(() => import('@/routes/chat/ChannelMessagesContainer')),
});
