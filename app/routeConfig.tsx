import { lazyRouteComponent } from '@tanstack/react-router'
import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './router'

export const chatRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/chat',
    component: lazyRouteComponent(() => import('./routes/chat/ChatContainer')),
})

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
