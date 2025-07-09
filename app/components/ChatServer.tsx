import React, { useEffect, useMemo, useRef, useState } from "react";
import { useWebSocket } from '@/providers/WebSocketProvider';
// 'ChatMessage' est probablement défini dans ton provider, mais on l'infère ici
// import { type ChatMessage } from '@/providers/WebSocketProvider';
import { PaperAirplaneIcon } from "@heroicons/react/16/solid";
import TextareaAutosize from 'react-textarea-autosize';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import LoadingFull from "@/components/elements/LoadingFull";
import useSWR from "swr";
import { kyFetcher } from "@/api/http";

export default function ChatServer() {
    const { sendMessage, currentServer, currentChannel, messages, isConnected } = useWebSocket();
    const [input, setInput] = useState("");
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    const { data: historyResponse, isLoading } = useSWR(
        currentChannel?.id ? `server/${currentServer?.id}/channels/${currentChannel.id}/messages` : null,
        kyFetcher
    );

    // ✅ TRANSFORMATION DES DONNÉES DE L'HISTORIQUE
    const historicalMessages = useMemo(() => {
        // Si on n'a pas de données ou que la clé 'data' n'est pas un tableau, on retourne un tableau vide.
        if (!Array.isArray(historyResponse?.data)) {
            return [];
        }

        // On "traduit" les objets de l'API vers le format attendu par le JSX
        return historyResponse.data.map((msg: any) => ({
            id: msg.message_id,        // <- On mappe message_id sur id
            username: msg.username,     // <- On utilise sender_id pour username (à améliorer plus tard)
            timestamp: msg.timestamp,      // <- On mappe sent_at sur timestamp
            content: msg.content,
            avatar: msg.avatar, // L'API ne fournit pas d'avatar pour l'historique
        }));
    }, [historyResponse]); // Ce calcul se relance uniquement quand historyResponse change

    const currentMessages = currentChannel ? messages[currentChannel.id] || [] : [];

    // On fusionne l'historique (maintenant au bon format) et les messages temps réel
    const allMessages = [...historicalMessages, ...currentMessages];

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [allMessages]);

    if (!currentChannel) {
        console.log('ici')
        return <LoadingFull />; // Garde un état de chargement initial si aucun canal n'est sélectionné
    }

    if (isLoading) {
        console.log('la')
        return <LoadingFull />;
    }

    const handleSendMessage = (e: React.FormEvent<HTMLFormElement> | React.KeyboardEvent<HTMLTextAreaElement>) => {
        e.preventDefault();
        if (input.trim() !== "" && currentServer && currentChannel) {
            sendMessage({
                type: 'chat',
                serverId: currentServer.id,
                channelId: currentChannel.id,
                content: input,
            });
            setInput("");
        }
    };

    return (
        <div className="flex flex-col h-full w-full">
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5 no-scrollbar">
                {/* On utilise maintenant msg.id qui est défini pour tous les messages */}
                {allMessages.map((msg) => (
                    <div key={msg.id} className="flex gap-4 items-start hover:bg-white/5 p-2 rounded-lg transition-colors duration-150">
                        <img
                            src={msg.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.username)}&background=373049&color=D9C9FF&bold=true&size=128`}
                            alt={msg.username}
                            className="w-10 h-10 rounded-full flex-shrink-0 mt-1"
                        />
                        <div className="flex flex-col min-w-0">
                            <div className="flex items-baseline gap-2">
                                <span className="font-semibold text-white">{msg.username}</span>
                                <span className="text-xs text-gray-500">{new Date(msg.timestamp!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <div className="text-gray-300 text-base prose prose-invert prose-p:my-0 prose-headings:my-2">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {msg.content}
                                </ReactMarkdown>
                            </div>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <div className="px-6 pb-4 pt-2 shrink-0">
                <form onSubmit={handleSendMessage} className="relative">
                    <TextareaAutosize
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                handleSendMessage(e);
                            }
                        }}
                        placeholder={`Envoyer un message dans #${currentChannel?.name || '...'}`}
                        className="w-full bg-glass-dark p-3 pl-4 pr-12 text-white rounded-xl outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-whisper-500 transition-all border border-glass-border resize-none"
                        disabled={!isConnected}
                        maxRows={5}
                    />
                    <button
                        type="submit"
                        className="absolute right-2 bottom-2 p-2 rounded-lg bg-whisper-500 text-white hover:bg-whisper-600 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                        disabled={!isConnected || input.trim() === ""}
                    >
                        <PaperAirplaneIcon className="w-5 h-5"/>
                    </button>
                </form>
            </div>
        </div>
    );
}
