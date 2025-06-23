import React, { useState, Fragment, useRef, useEffect } from 'react';
import useSWR from "swr";
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import {getAccessToken, kyFetcher} from "@/api/http"; // Ton instance Ky
import Loading from "@/components/elements/Loading";
import { Dialog, Transition } from '@headlessui/react';
import { PlusIcon, CameraIcon } from '@heroicons/react/24/solid';
import ky from "ky";
import {useWebSocket} from "@/providers/WebSocketProvider";
import {Link} from "@tanstack/react-router";
import {useDebug} from "@/providers/DebugProvider";

// ✅ 1. Définir le schéma de validation avec Zod
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];

const createServerSchema = z.object({
    name: z.string().min(1, { message: "Le nom du serveur est requis." }).max(100),
    // L'icône est optionnelle
    icon: z
        .instanceof(FileList)
        .optional()
        .refine(
            (files) => !files || files.length === 0 || files[0].size <= MAX_FILE_SIZE,
            `La taille de l'image ne doit pas dépasser 5MB.`
        )
        .refine(
            (files) => !files || files.length === 0 || ACCEPTED_IMAGE_TYPES.includes(files[0].type),
            "Formats acceptés : .jpg, .jpeg, .png, .webp et .gif"
        ),
});

// Inférer le type TypeScript depuis le schéma Zod
type CreateServerInput = z.infer<typeof createServerSchema>;


export default function Sidebar() {
    // --- Hooks ---
    const { data: servers, error, mutate, isLoading } = useSWR('servers', kyFetcher);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { setCurrentServerId, currentServerId } = useWebSocket();
    const { isDebugEnabled } = useDebug();

    // ✅ 2. Initialiser react-hook-form avec le resolver Zod
    const {
        register,
        handleSubmit,
        watch,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<CreateServerInput>({
        resolver: zodResolver(createServerSchema),
    });

    // --- Logique de l'aperçu d'image ---
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const watchedIcon = watch("icon");

    useEffect(() => {
        const file = watchedIcon?.[0];
        if (file) {
            const newUrl = URL.createObjectURL(file);
            setPreviewUrl(newUrl);

            // Cleanup function pour l'ancienne URL
            return () => URL.revokeObjectURL(newUrl);
        }
        // Si aucun fichier n'est sélectionné, on nettoie l'aperçu
        setPreviewUrl(null);
    }, [watchedIcon]);

    // --- Handlers ---
    const closeModal = () => {
        setIsModalOpen(false);
        // On attend la fin de l'animation pour un reset plus doux
        setTimeout(() => {
            reset();
            setPreviewUrl(null);
        }, 200);
    }

    // ✅ 3. Logique de soumission gérée par react-hook-form
    const onSubmit = async (data: CreateServerInput) => {
        const formData = new FormData();
        formData.append('name', data.name);
        if (data.icon && data.icon.length > 0) {
            formData.append('icon', data.icon[0]);
        }
        console.log(formData)
        console.log(data)
        const token = getAccessToken();

        try {
            await ky.post(`${import.meta.env.VITE_API_BASE_URL}/servers`, { body: formData, headers: {'Authorization': `Bearer ${token}`}});
            mutate(); // Rafraîchit les données SWR
            closeModal();
        } catch (err) {
            console.error("Erreur lors de la création du serveur:", err);
            // Ici, tu peux afficher une notification d'erreur à l'utilisateur
        }
    };

    // --- Rendu conditionnel ---
    if (isLoading) {
        return (
            <aside className="w-20 bg-[#1e1e1e] py-4 flex flex-col items-center">
                <Loading />
            </aside>
        );
    }
    if (error) {
        return <div className="w-20 bg-red-900" title="Erreur de chargement des serveurs"></div>
    }

    // --- Rendu JSX ---
    return (
        <aside className={`w-20  py-3 flex-shrink-0 flex flex-col items-center gap-2 border-r ${isDebugEnabled ? "bg-red-700 border-red-900" : "border-[#2d2d2d] bg-[#1e1e1e]"}`}>
            <div className="mb-2 group relative">
                {/* Icône de la marque ici */}
            </div>
            <hr className="w-10 border-t border-[#363636] mb-2"/>

            <div className="flex flex-col items-center gap-2 overflow-y-auto flex-grow w-full no-scrollbar">
                {servers?.map((server) => (
                    <Link to="/chat/$serverId" params={{ serverId: server.server_id }} key={server.server_id} className="group relative cursor-pointer">
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 h-2 w-1 bg-white rounded-r-full scale-y-0 group-hover:scale-y-100 transition-transform duration-200 ease-in-out"/>
                        <div className="w-12 h-12 rounded-full bg-[#313338] overflow-hidden shadow-lg transition-all duration-200 ease-in-out group-hover:rounded-2xl">
                            <img
                                src={server.avatar?.trim() ? server.avatar : `https://ui-avatars.com/api/?name=${encodeURIComponent(server.name)}&background=313338&color=ffffff&size=128`}
                                alt={server.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <span className="absolute left-full ml-4 top-1/2 -translate-y-1/2 bg-[#111214] text-white font-semibold text-sm px-3 py-1.5 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap">
                            {server.name}
                        </span>
                    </Link>
                ))}
            </div>

            <button
                className="w-12 h-12 flex-shrink-0 mt-2 rounded-full bg-[#313338] text-[#00C896] hover:bg-[#00C896] hover:text-white hover:rounded-2xl transition-all duration-200 ease-in-out flex items-center justify-center"
                onClick={() => setIsModalOpen(true)}
            >
                <PlusIcon className="w-6 h-6" />

            </button>

            <Transition appear show={isModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={closeModal}>
                    <Transition.Child as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
                    </Transition.Child>
                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                                {/* ✅ On utilise la balise `form` et le handler `handleSubmit` */}
                                <Dialog.Panel as="form" onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md transform overflow-hidden rounded-xl bg-[#1e1e1e] p-6 text-left align-middle shadow-xl transition-all border border-[#2c2c2c]">
                                    <Dialog.Title as="h3" className="text-xl font-bold text-center text-white mb-2">
                                        Crée ton serveur
                                    </Dialog.Title>
                                    <p className="text-center text-gray-400 text-sm mb-6">Personnalise ton serveur avec un nom et une icône.</p>

                                    <div className="flex justify-center mb-6">
                                        {/* On utilise le `register` de react-hook-form pour l'input de fichier */}
                                        <label htmlFor="server-icon" className="w-24 h-24 rounded-full bg-[#2c2c2c] border-2 border-dashed border-gray-500 flex items-center justify-center text-gray-400 hover:border-[#00C896] hover:text-white transition-all group relative overflow-hidden cursor-pointer">
                                            <input
                                                id="server-icon"
                                                type="file"
                                                accept="image/png, image/jpeg, image/webp, image/gif"
                                                className="hidden"
                                                {...register("icon")}
                                            />
                                            {previewUrl ? (
                                                <img src={previewUrl} alt="Aperçu" className="w-full h-full object-cover" />
                                            ) : (
                                                <CameraIcon className="w-10 h-10" />
                                            )}
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className="text-white text-xs font-bold">Changer</span>
                                            </div>
                                        </label>
                                    </div>
                                    {errors.icon && <p className="text-red-500 text-xs text-center -mt-2 mb-4">{errors.icon.message}</p>}

                                    <label htmlFor="server-name" className="text-xs font-bold text-gray-400 uppercase tracking-wide">Nom du serveur</label>
                                    <input
                                        id="server-name"
                                        type="text"
                                        placeholder="Le QG de l'équipage"
                                        className={`w-full mt-2 bg-[#292929] text-white p-3 rounded-lg outline-none placeholder-[#606060] text-sm focus:ring-2 transition-all ${errors.name ? 'ring-2 ring-red-500' : 'focus:ring-[#00C896]'}`}
                                        {...register("name")}
                                    />
                                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}

                                    <div className="mt-8 flex justify-between items-center bg-[#161616] p-4 rounded-lg">
                                        <button type="button" className="text-gray-300 hover:underline" onClick={closeModal}>
                                            Annuler
                                        </button>
                                        <button type="submit" className="px-6 py-2 bg-[#00C896] text-black font-bold rounded-lg hover:bg-[#00b584] transition-all disabled:bg-gray-500 disabled:cursor-not-allowed" disabled={isSubmitting}>
                                            {isSubmitting ? 'Création...' : 'Créer'}
                                        </button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </aside>
    );
}
