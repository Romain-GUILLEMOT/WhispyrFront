import React, {Fragment, useEffect, useState} from 'react';
import useSWR from 'swr';
import {getAccessToken, kyFetcher} from '@/api/http';
import {Link, redirect, useNavigate, useParams, useRouterState} from '@tanstack/react-router';
import Loading from './Loading';
import {useServer} from '@/providers/ServerProvider';
import {useChannel, type Channel} from '@/providers/ChannelProvider';
import {Cog6ToothIcon, HashtagIcon} from '@heroicons/react/24/outline';
import {useWebSocket} from "@/providers/WebSocketProvider";
import {CameraIcon, PlusIcon} from "@heroicons/react/24/solid";
import {Dialog, Transition} from "@headlessui/react";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import ky from "ky";
import {z} from "zod";
import ButtonElement from "@/components/elements/ButtonElement";
import createNotification from "@/components/Notification";
import type {ChannelsAPI} from "@/types/channelsList";


const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
const createChannelSchema = z.object({
    name: z.string().min(1, "Le nom du salon est requis.").max(100),
});
type CreateChannelInput = z.infer<typeof createChannelSchema>;


export default function ChannelsSidebar() {
    const navigate = useNavigate();
    const {currentChannel, setCurrentChannel} = useChannel();
    const {currentServer} = useWebSocket();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const location = useRouterState({select: (s) => s.location});
    const activeChannelId = (() => {
        const match = location.pathname.match(/^\/chat\/[^/]+\/([^/]+)$/);
        return match?.[1];
    })();
    const {register, handleSubmit, watch, reset, formState: {errors, isSubmitting}} = useForm<CreateChannelInput>({
        resolver: zodResolver(createChannelSchema),
    });
    const {data: categories, error, isLoading, mutate} = useSWR<ChannelsAPI>(
        currentServer ? `server/${currentServer.id}/channels` : null,
        kyFetcher
    );

    const closeModal = () => {
        setIsModalOpen(false);
        setTimeout(() => {
            reset();
        }, 200);
    }

    const onSubmit = async (data: CreateChannelInput) => {
        const formData = new FormData();
        formData.append('name', data.name);
        const token = getAccessToken();
        if (!currentServer) {
            return createNotification({type: "error", message: "Le serveur est introuvable !"})
        }
        try {
            await ky.post(`${import.meta.env.VITE_API_BASE_URL}/server/${currentServer.id}/channels`, {
                body: formData,
                headers: {'Authorization': `Bearer ${token}`}
            });
            mutate();
            closeModal();
        } catch (err) {
            console.error("Erreur lors de la création du serveur:", err);
        }
    };

    useEffect(() => {
        if (activeChannelId && categories && categories.length > 0) {
            for (const category of categories.categories) {
                const channel = category.channels.find(c => c.channel_id === activeChannelId);
                if (channel) {
                    setCurrentChannel(channel);
                    break;
                }
            }
        }
    }, [activeChannelId, categories, setCurrentChannel]);

    if (!currentServer) {
        return <aside
            className="w-60 flex-shrink-0 bg-glass-medium/80 backdrop-blur-xl border-r border-glass-border rounded-l-2xl"></aside>;
    }

    return (
        <aside
            className="w-60 flex-shrink-0 bg-glass-medium/80 backdrop-blur-xl border-r border-glass-border rounded-l-2xl flex flex-col">
            <header
                className="p-4 h-[57px] flex items-center justify-between border-b border-glass-border shadow-md shrink-0">
                <h2 className="flex gap-2 font-bold text-lg truncate">
                    <HashtagIcon className="w-6 h-6 text-gray-400"/>

                    {currentChannel ? currentChannel.name : currentServer.name}</h2>
                <div className={"flex gap-2"}>
                    <button className="text-gray-400 hover:text-white transition-colors">
                        <Cog6ToothIcon className="w-5 h-5"/>
                    </button>
                    <button
                        className="text-gray-400 hover:text-white transition-colors"
                        onClick={() => setIsModalOpen(true)}
                    >
                        <PlusIcon className="w-6 h-6"/>
                    </button>
                </div>

            </header>

            <nav className="flex-1 overflow-y-auto p-2 space-y-4 no-scrollbar">
                {isLoading && <div className="p-2"><Loading/></div>}
                {error && <div className="p-2 text-red-400">Erreur de chargement.</div>}


                <Transition appear show={isModalOpen} as={Fragment}>
                    <Dialog as="div" className="relative z-50" onClose={closeModal}>
                        <Transition.Child as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0"
                                          enterTo="opacity-100" leave="ease-in duration-150" leaveFrom="opacity-100"
                                          leaveTo="opacity-0">
                            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm"/>
                        </Transition.Child>
                        <div className="fixed inset-0 overflow-y-auto">
                            <div className="flex min-h-full items-center justify-center p-4 text-center">
                                <Transition.Child as={Fragment} enter="ease-out duration-300"
                                                  enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
                                                  leave="ease-in duration-200" leaveFrom="opacity-100 scale-100"
                                                  leaveTo="opacity-0 scale-95">
                                    {/* ✅ On utilise la balise `form` et le handler `handleSubmit` */}
                                    <Dialog.Panel as="form" onSubmit={handleSubmit(onSubmit)}
                                                  className="w-full max-w-md transform overflow-hidden rounded-xl bg-[#1e1e1e] p-6 text-left align-middle shadow-xl transition-all border border-[#2c2c2c]">
                                        <Dialog.Title as="h3" className="text-xl font-bold text-center text-white mb-2">
                                            Crée un salon
                                        </Dialog.Title>
                                        <p className="text-center text-gray-400 text-sm mb-6">Personnalise ton salon
                                            avec un nom et un type.</p>


                                        <label htmlFor="channel-name"
                                               className="text-xs font-bold text-gray-400 uppercase tracking-wide">Nom
                                            du salon</label>
                                        <input
                                            id="channel-name"
                                            type="text"
                                            placeholder="Le QG de l'équipage"
                                            className={`w-full mt-2 bg-[#292929] text-white p-3 rounded-lg outline-none placeholder-[#606060] text-sm focus:ring-2 transition-all ${errors.name ? 'ring-2 ring-red-500' : 'focus:ring-[#00C896]'}`}
                                            {...register("name")}
                                        />
                                        {errors.name &&
                                            <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}

                                        <div
                                            className="mt-8 flex justify-between items-center bg-[#161616] p-4 rounded-lg">
                                            <ButtonElement type={"neutral"} buttonType="button"
                                                           className="text-gray-300 hover:underline"
                                                           onClick={closeModal}>
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
                {categories?.uncategorized_channels && categories?.uncategorized_channels.map((channel) => (

                    <li key={channel.channel_id} onClick={() => setCurrentChannel(channel)}>
                        <Link
                            to="/chat/$serverId/$channelId"
                            params={{serverId: currentServer.id, channelId: channel.channel_id}}
                            className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-base font-medium transition-all duration-150 group ${activeChannelId === channel.channel_id
                                ? 'bg-whisper-500/20 text-white'
                                : 'text-gray-400 hover:bg-white/10 hover:text-gray-200'}`}
                        >
                            <HashtagIcon className="w-5 h-5 text-gray-500"/>
                            <span className="truncate">{channel.name}</span>
                        </Link>
                    </li>

                ))}

                {categories?.categories.map((category) => (
                    <div key={category.category_id}>
                        <h3 className="px-2 mb-1 text-xs font-bold uppercase text-whisper-300 tracking-wider">{category.name}</h3>
                        <ul className="space-y-1">
                            {category.channels.map((channel) => (
                                <li key={channel.channel_id} onClick={() => setCurrentChannel(channel)}>
                                    <Link
                                        to="/chat/$serverId/$channelId"
                                        params={{serverId: currentServer.id, channelId: channel.channel_id}}
                                        className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-base font-medium transition-all duration-150 group ${activeChannelId === channel.channel_id
                                            ? 'bg-whisper-500/20 text-white'
                                            : 'text-gray-400 hover:bg-white/10 hover:text-gray-200'}`}
                                    >
                                        <HashtagIcon className="w-5 h-5 text-gray-500"/>
                                        <span className="truncate">{channel.name}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </nav>
        </aside>
    );
}
