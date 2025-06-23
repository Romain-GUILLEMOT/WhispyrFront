import React from 'react'

export default function Loading() {
    return (
        <div className="w-full h-screen flex items-center justify-center bg-black/90 text-white">
            <div className="flex flex-col items-center gap-4">
                {/* Logo animé */}
                <img
                    src="https://assets.romain-guillemot.dev/whispyr/whispyr.webp"
                    alt="Loading"
                    className="w-12 h-12 animate-pulse"
                />

                {/* Texte animé */}
                <p className="text-sm text-gray-400 animate-pulse">Chargement en cours...</p>
            </div>
        </div>
    )
}
