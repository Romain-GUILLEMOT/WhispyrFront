import { createRouter } from '@tanstack/react-router'
import {
    rootRoute,
    homeRoute,
    loginRoute,
    chatRoute,
    serverRoute,      // <-- On importe la route parente
    serverIndexRoute, // <-- On importe la route d'index
    channelRoute
} from './routeConfig'

// On assemble l'arbre de routes en respectant la hiérarchie
const routeTree = rootRoute.addChildren([
    homeRoute,
    loginRoute,
    chatRoute.addChildren([
        // `serverRoute` est le parent qui contient les deux autres routes
        serverRoute.addChildren([
            serverIndexRoute, // Gère la redirection pour /chat/:serverId/
            channelRoute      // Gère l'affichage pour /chat/:serverId/:channelId
        ])
    ])
]);

// On crée et exporte le routeur
export const router = createRouter({ routeTree })

// Déclaration des types pour TanStack Router
declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router;
    }
}
