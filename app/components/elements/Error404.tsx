import React, {useEffect} from 'react';

export default function Error404() {


    return (
        <main className="grid min-h-full place-items-center px-6 py-24 sm:py-32 lg:px-8">
            <div className="text-center">
                <p className="text-base font-semibold text-indigo-600">404</p>
                <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">Page non trouvée</h1>
                <p className="mt-6 text-base leading-7 text-gray-600">Désolé, mais nous n'avons pas trouvé cette page.</p>
                <div className="mt-10 flex items-center justify-center gap-x-6">
                    <a
                        href={'/'}
                        className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-black shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                        Retourner sur la page principale
                    </a>
                </div>
            </div>
        </main>
    )
}
