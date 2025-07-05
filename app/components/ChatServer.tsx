import React, { useEffect, useRef, useState } from "react";
import { useWebSocket, type ChatMessage } from '@/providers/WebSocketProvider';
import { useChannel } from "@/providers/ChannelProvider";
import { PaperAirplaneIcon } from "@heroicons/react/16/solid";
import TextareaAutosize from 'react-textarea-autosize';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatServerProps {
    initialMessages?: ChatMessage[];
}

export default function ChatServer({ initialMessages = [] }: ChatServerProps) {
    const { sendMessage, currentChannel, currentServer, messages, isConnected } = useWebSocket();
    const [input, setInput] = useState("");
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    // --- MODIFIÉ : On filtre les messages en utilisant l'ID du salon actuel (`currentChannel`) ---
    const currentMessages = currentChannel ? messages[currentChannel.id] || [] : [];
    const allMessages = [...initialMessages, ...currentMessages];

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [allMessages]);

    const handleSendMessage = (e: React.FormEvent<HTMLFormElement> | React.KeyboardEvent<HTMLTextAreaElement>) => {
        e.preventDefault();
        // --- MODIFIÉ : On s'assure d'avoir un salon sélectionné (`currentChannel`) avant d'envoyer ---
        if (input.trim() !== "" && currentServer && currentChannel) {
            console.log("test")

            sendMessage({
                type: 'chat',
                serverId: currentServer.id,
                channelId: currentChannel.id, // AJOUTÉ : On envoie l'ID du salon
                content: input,
            });
            setInput("");
        }
    };
    console.log(currentChannel)
    return (
        <div className="flex flex-col h-full w-full">
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5 no-scrollbar">
                {allMessages.map((msg, i) => (
                    <div key={i} className="flex gap-4 items-start hover:bg-white/5 p-2 rounded-lg transition-colors duration-150">
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
                        disabled={!currentChannel || !isConnected}
                        maxRows={5}
                    />
                    <button
                        type="submit"
                        className="absolute right-2 bottom-2 p-2 rounded-lg bg-whisper-500 text-white hover:bg-whisper-600 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                        disabled={!currentChannel || !isConnected || input.trim() === ""}
                    >
                        <PaperAirplaneIcon className="w-5 h-5"/>
                    </button>
                </form>
            </div>
        </div>
    );
}
