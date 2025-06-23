import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import './app.css'
import { router } from './router'
import { UserProvider } from './providers/UserProvider'
import CookieConsent from 'react-cookie-consent'
import {DebugProvider} from "@/providers/DebugProvider";

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <DebugProvider>
        <UserProvider>

            <RouterProvider router={router} />
            <CookieConsent
                buttonText="J'accepte"
                enableDeclineButton
                declineButtonText="Je refuse"
            >
                Ce site utilise des cookies pour améliorer l'expérience utilisateur.
            </CookieConsent>
        </UserProvider>
        </DebugProvider>
    </React.StrictMode>
)
