import React from 'react';
import { PlusIcon } from '@heroicons/react/24/solid';

export default function NoServers() {
    return (
        <div className="flex flex-col items-center justify-center h-full w-full text-center text-gray-400">
            <h2 className="text-xl font-bold text-white">Bienvenue sur Whispyr !</h2>
            <p className="mt-2">Il semble que vous ne soyez encore sur aucun serveur.</p>
            <p className="mt-1">Créez-en un pour commencer à discuter avec vos amis !</p>
            <button className="mt-6 flex items-center gap-2 px-4 py-2 bg-[#00C896] text-black font-semibold rounded-lg hover:bg-[#00b584] transition-all">
                <PlusIcon className="w-5 h-5" />
                Créer un serveur
            </button>
        </div>
    );
}
