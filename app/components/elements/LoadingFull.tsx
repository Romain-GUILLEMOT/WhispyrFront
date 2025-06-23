import React from 'react';

export default function LoadingFull() {
    return (
        <div className="fixed inset-0 items-center flex  justify-center bg-white bg-opacity-70 z-50">
            <div className={'my-auto'}>
                <div className="loader">
                    <img
                        src="https://assets.romain-guillemot.dev/whispyr/whispyr.webp"
                        className="h-44 w-44 mx-auto animate-pulse"
                        alt="Logo"
                    />
                </div>
                <p className="text-2xl text-center mt-4  animate-pulse">Chargement en cours...</p>
            </div>
        </div>

    );
}
