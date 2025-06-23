import { lazyRouteComponent } from '@tanstack/react-router'
import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './router'

export const chatRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: 'chat', // Chemin de base pour le chat
});

export const serverChatRoute = createRoute({
    getParentRoute: () => chatRoute, // Fait partie de la route chat
    path: '$serverId', // Chemin dynamique pour l'ID du serveur
    // Le composant qui sera rendu lorsque cette route est active
    component: lazyRouteComponent(() => import('./routes/chat/ServerChatContainer')),
});

export const homeRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: lazyRouteComponent(() => import('./routes/home')),
})


export const loginRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/auth/login',
    component: lazyRouteComponent(() => import('./routes/auth/LoginContainer')),
})
