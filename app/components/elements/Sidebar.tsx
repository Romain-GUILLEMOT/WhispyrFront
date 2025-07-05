import React, { useState, Fragment, useEffect } from 'react';
import useSWR from "swr";
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { getAccessToken, kyFetcher } from "@/api/http";
import Loading from "@/components/elements/Loading";
import { Dialog, Transition } from '@headlessui/react';
import { PlusIcon, CameraIcon } from '@heroicons/react/24/solid';
import ky from "ky";
import { Link } from "@tanstack/react-router";
import { useServer, type Server } from '@/providers/ServerProvider';
import {SparklesIcon} from "@heroicons/react/16/solid";
import ButtonElement from "@/components/elements/ButtonElement"; // <-- Import du Provider

// --- Schéma de validation Zod (inchangé) ---
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
const createServerSchema = z.object({
    name: z.string().min(1, "Le nom du serveur est requis.").max(100),
    icon: z.instanceof(FileList).optional()
        .refine((files) => !files || files.length === 0 || files[0].size <= MAX_FILE_SIZE, `Taille max : 5MB.`)
        .refine((files) => !files || files.length === 0 || ACCEPTED_IMAGE_TYPES.includes(files[0].type), "Formats acceptés : JPG, PNG, WEBP, GIF"),
});
type CreateServerInput = z.infer<typeof createServerSchema>;


export default function Sidebar() {
    // --- Hooks ---
    const { data: servers, error, mutate, isLoading } = useSWR<Server[]>('servers', kyFetcher);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { currentServer, setCurrentServer } = useServer(); // <-- Utilisation du Provider

    const { register, handleSubmit, watch, reset, formState: { errors, isSubmitting } } = useForm<CreateServerInput>({
        resolver: zodResolver(createServerSchema),
    });

    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const watchedIcon = watch("icon");

    useEffect(() => {
        const file = watchedIcon?.[0];
        if (file) {
            const newUrl = URL.createObjectURL(file);
            setPreviewUrl(newUrl);
            return () => URL.revokeObjectURL(newUrl);
        }
        setPreviewUrl(null);
    }, [watchedIcon]);

    const closeModal = () => {
        setIsModalOpen(false);
        setTimeout(() => {
            reset();
            setPreviewUrl(null);
        }, 200);
    }

    const onSubmit = async (data: CreateServerInput) => {
        const formData = new FormData();
        formData.append('name', data.name);
        if (data.icon && data.icon.length > 0) {
            formData.append('icon', data.icon[0]);
        }
        const token = getAccessToken();
        try {
            await ky.post(`${import.meta.env.VITE_API_BASE_URL}/servers`, { body: formData, headers: {'Authorization': `Bearer ${token}`}});
            mutate();
            closeModal();
        } catch (err) {
            console.error("Erreur lors de la création du serveur:", err);
        }
    };

    if (isLoading) {
        return <aside className="w-[72px] bg-glass-dark py-3 flex-shrink-0 flex flex-col items-center"><Loading /></aside>;
    }
    if (error) {
        return <div className="w-[72px] bg-red-900" title="Erreur de chargement des serveurs"></div>
    }

    return (
        <aside className="w-[72px] bg-glass-dark py-3 flex-shrink-0 flex flex-col items-center gap-3">
            <Link to="/" className="mb-2 group relative outline-none" aria-label="Accueil">
                <div className="w-12 h-12 bg-gradient-to-br from-whisper-500 to-whisper-600 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-whisper-500/30 group-hover:rounded-3xl">
                    <SparklesIcon className="w-7 h-7 text-white" />
                </div>
            </Link>
            <hr className="w-10 border-t border-glass-border mb-2"/>

            <div className="flex flex-col items-center gap-3 overflow-y-auto flex-grow w-full no-scrollbar">
                {servers?.map((server) => (
                    <div key={server.server_id} onClick={() => setCurrentServer(server)}>
                        <Link to="/chat/$serverId" params={{ serverId: server.server_id }} className="group relative cursor-pointer" aria-label={server.name}>
                            <div className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 h-3 w-1.5 bg-white rounded-r-full transition-all duration-300 ease-in-out ${currentServer?.server_id === server.server_id ? 'h-8' : 'h-0 group-hover:h-5'}`}/>
                            <div className={`w-12 h-12 rounded-full bg-glass-light overflow-hidden shadow-lg transition-all duration-300 ease-in-out ${currentServer?.server_id === server.server_id ? 'rounded-2xl' : 'group-hover:rounded-2xl'}`}>
                                <img
                                    src={server.avatar?.trim() ? server.avatar : `https://ui-avatars.com/api/?name=${encodeURIComponent(server.name)}&background=373049&color=D9C9FF&bold=true&size=128`}
                                    alt={server.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <span className="absolute left-full ml-4 top-1/2 -translate-y-1/2 bg-glass-dark text-white font-semibold text-sm px-3 py-1.5 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-10">
                                {server.name}
                            </span>
                        </Link>
                    </div>
                ))}
            </div>
            {/* ... (Le reste du JSX pour le bouton et le modal est inchangé) ... */}
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
                                        <ButtonElement type={"neutral"} buttonType="button" className="text-gray-300 hover:underline" onClick={closeModal}>
                                            Annuler
                                        </ButtonElement>
                                        <ButtonElement type={'primary'} buttonType="submit" disabled={isSubmitting}>
                                            {isSubmitting ? 'Création...' : 'Créer'}
                                        </ButtonElement>
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
