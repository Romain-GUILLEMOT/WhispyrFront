// router.ts
import { createRouter, createRootRoute } from '@tanstack/react-router'
import App from './App'
import {homeRoute, chatRoute, loginRoute, serverChatRoute} from './routeConfig'

export const rootRoute = createRootRoute({ component: App })
const routeTree = rootRoute.addChildren([homeRoute, chatRoute, loginRoute, serverChatRoute])

export const router = createRouter({ routeTree })
