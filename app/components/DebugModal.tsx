import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { getAccessToken } from "@/api/http";
import createNotification from "@/components/Notification"; // Assure-toi que ce chemin est correct

const DebugOverlay: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    // Active le mode debug uniquement si VITE_APP_DEBUG est à "true"
    const isDebugMode = import.meta.env.VITE_APP_DEBUG === "true";
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

    const closeModal = useCallback(() => {
        setIsOpen(false);
    }, []);

    const openModal = useCallback(() => {
        setIsOpen(true);
    }, []);

    // Fonction pour copier le texte et afficher une notification
    const copyToClipboardAndNotify = useCallback(async (text: string, label: string) => {
        try {
            await navigator.clipboard.writeText(text);
            createNotification({ type: "success", message: `${label} copié ! ✅` });
        } catch (err) {
            console.error('Failed to copy: ', err);
            createNotification({ type: "error", message: `Échec de la copie de ${label}. ❌` });
        }
    }, []);

    // Gère le raccourci clavier Ctrl+D / Cmd+D
    useEffect(() => {
        if (!isDebugMode) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if ((event.ctrlKey || event.metaKey) && event.key === 'd') {
                event.preventDefault();
                isOpen ? closeModal() : openModal();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, openModal, closeModal, isDebugMode]);

    if (!isDebugMode) {
        return null;
    }

    return (
        <>
            <Transition appear show={isOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={closeModal}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black bg-opacity-40" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-gray-800">
                                    <Dialog.Title
                                        as="h3"
                                        className="text-lg font-medium leading-6 text-gray-900 dark:text-white"
                                    >
                                        🚀 Debug Infos
                                    </Dialog.Title>
                                    <div className="mt-2">
                                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                            <thead className="bg-gray-50 dark:bg-gray-700">
                                            <tr>
                                                <th
                                                    scope="col"
                                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300"
                                                >
                                                    Clé
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300"
                                                >
                                                    Valeur
                                                </th>
                                            </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                                            <tr className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => copyToClipboardAndNotify(getAccessToken(), 'Access Token')}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                    Access Token
                                                </td>
                                                <td className="px-6 py-4 break-all text-sm text-gray-500 dark:text-gray-300">
                                                    {getAccessToken()}
                                                </td>
                                            </tr>
                                            <tr className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => copyToClipboardAndNotify(apiBaseUrl, 'URL de l\'API')}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                    API Base URL
                                                </td>
                                                <td className="px-6 py-4 break-all text-sm text-gray-500 dark:text-gray-300">
                                                    {apiBaseUrl}
                                                </td>
                                            </tr>
                                            <tr className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => copyToClipboardAndNotify(import.meta.env.MODE, 'Environnement')}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                    Environment
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                                    {import.meta.env.MODE}
                                                </td>
                                            </tr>
                                            <tr className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => copyToClipboardAndNotify(isDebugMode ? 'true' : 'false', 'Mode Debug')}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                    Debug Mode
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                                    {isDebugMode ? 'Enabled ✅' : 'Disabled ❌'}
                                                </td>
                                            </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="mt-4 text-right">
                                        <button
                                            type="button"
                                            className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:bg-blue-700 dark:text-blue-100 dark:hover:bg-blue-800"
                                            onClick={closeModal}
                                        >
                                            Fermer
                                        </button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </>
    );
};

export default DebugOverlay;
