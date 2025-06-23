// Header.tsx
import React from 'react'
import { BellIcon, Cog6ToothIcon } from '@heroicons/react/16/solid'
import { useUser } from '@/providers/UserProvider'
// getAccessToken n'est pas directement utilisé ici, mais on le garde pour le contexte si besoin
import {useDebug} from "@/providers/DebugProvider";

export default function Header() {
    const { user } = useUser()
    if (user === null) return null
    const { isDebugEnabled } = useDebug();

    // Détermine les classes CSS du header en fonction de l'état de debug
    const headerClasses = `
        h-14
        flex
        items-center
        justify-between
        px-4
        relative // Ajouté pour positionner le texte DEBUG
        transition-colors duration-300
        ${isDebugEnabled
        ? 'bg-red-700 border-red-900' // Fond rouge vif et bordure plus foncée en mode debug
        : 'bg-[#1F1F1F] border-[#2C2C2C]' // Couleurs normales en dehors du mode debug
    }
    `;

    // Détermine les classes CSS du texte principal pour la lisibilité sur fond rouge
    const mainTextClasses = `
        ${isDebugEnabled
        ? 'text-white' // Texte blanc sur fond rouge
        : 'text-[#F4F4F4]' // Texte normal
    }
    `;

    return (
        <header className={headerClasses}>
            {/* Indicateur visuel puissant pour le mode DEBUG */}
            {isDebugEnabled && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-3xl font-black text-red-300 opacity-70 animate-pulse-slow tracking-widest">
                        DEBUG MODE
                    </span>
                </div>
            )}

            <div className="flex items-center gap-2 z-10"> {/* z-10 pour être au-dessus du texte DEBUG */}
                <h1 className={`text-lg font-semibold ${mainTextClasses}`}>Whispyr Dev</h1>
                <span className={`text-sm bg-[#2C2C2C] px-2 py-0.5 rounded ${isDebugEnabled ? 'text-gray-200' : 'text-[#A0A0A0]'}`}>
                    #général
                </span>
            </div>

            <div className="flex items-center gap-4 z-10"> {/* z-10 pour être au-dessus du texte DEBUG */}
                <button className={`hover:text-white transition ${isDebugEnabled ? 'text-red-200' : 'text-[#5EB9FF]'}`}>
                    <BellIcon className="w-5 h-5" />
                </button>
                <button className={`hover:text-white transition ${isDebugEnabled ? 'text-red-200' : 'text-[#FFC857]'}`}>
                    <Cog6ToothIcon className="w-5 h-5" />
                </button>
                <img
                    src={user.avatar || '/default-avatar.png'}
                    className={`w-8 h-8 rounded-full object-cover border ${isDebugEnabled ? 'border-red-900' : 'border-[#2C2C2C]'}`}
                    alt="Avatar"
                />
            </div>
        </header>
    )
}
