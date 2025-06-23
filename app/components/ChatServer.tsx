import React, { useEffect, useRef, useState } from "react";
import { useWebSocket, type ChatMessage } from '@/providers/WebSocketProvider';
import {useDebug} from "@/providers/DebugProvider"; // Importez ChatMessage type

interface ChatServerProps {
    initialMessages?: ChatMessage[]; // Prop optionnelle pour l'historique des messages
}

export default function ChatServer({ initialMessages = [] }: ChatServerProps) {
    const { sendMessage, currentServerId, messages, onlineUsers, isConnected } = useWebSocket();
    const [input, setInput] = useState("");
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const { isDebugEnabled } = useDebug();


    // Concaténer l'historique initial avec les messages reçus en temps réel pour le serveur actuel
    const allMessages = currentServerId ? [...initialMessages, ...(messages[currentServerId] || [])] : [];

    // Effet pour faire défiler les messages vers le bas
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [allMessages]); // Dépend de allMessages

    const handleSendMessage = () => {
        if (input.trim() !== "" && currentServerId) {
            sendMessage({
                type: 'chat',
                serverId: currentServerId, // Important: envoyer l'ID du serveur actuel
                content: input,
            });
            setInput("");
        }
    };

    return (
        <div className="flex flex-col h-[90vh] max-w-2xl w-full mx-auto bg-[#1f1f1f] rounded-2xl shadow-xl border border-[#2a2a2a]">
            <div className="bg-[#121212] p-4 border-b border-[#2a2a2a] text-white font-bold text-lg flex justify-between items-center">
                <span>🗨️ Salon : {currentServerId || "Sélectionnez un serveur"}</span>
                <span className={`text-xs font-normal ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
                    {isConnected ? 'Connecté' : 'Déconnecté'}
                </span>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 bg-[#121212]">
                {allMessages.map((msg, i) => (
                    <div key={i} className="flex gap-3 items-start">
                        <img
                            src={msg.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.username)}&background=313338&color=ffffff&size=128`}
                            alt={msg.username}
                            className="w-10 h-10 rounded-full border border-[#333]"
                        />
                        <div>
                            <div className="text-sm font-semibold text-white">
                                {msg.username} <span className="text-gray-500 text-xs ml-1">{new Date(msg.timestamp!).toLocaleTimeString()}</span>
                            </div>
                            <div className="text-sm text-[#e0e0e0]">{msg.content}</div>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-[#2a2a2a] bg-[#1f1f1f] flex gap-2">
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder={currentServerId ? "Tape ton message..." : "Sélectionnez un serveur pour discuter..."}
                    className="flex-1 p-2 bg-[#2a2a2a] text-white rounded-md outline-none"
                    disabled={!currentServerId || !isConnected}
                />
                <button
                    onClick={handleSendMessage}
                    className="bg-[#00C896] hover:bg-[#00aa88] px-4 rounded-md text-black font-semibold disabled:bg-gray-500 disabled:cursor-not-allowed"
                    disabled={!currentServerId || !isConnected || input.trim() === ""}
                >
                    Envoyer
                </button>
            </div>

            {/* Affichage des utilisateurs en ligne */}
            <div className="p-4 bg-[#1a1a1a] border-t border-[#2a2a2a]">
                <h4 className="text-white font-bold mb-2">Utilisateurs en ligne ({Object.values(onlineUsers).filter(u => u.status === 'online').length}):</h4>
                <ul className="text-sm text-gray-300">
                    {Object.values(onlineUsers).filter(user => user.status === 'online').map((user, index) => (
                        <li key={index} className="flex items-center gap-2">
                            {isDebugEnabled && (
                                user.avatar
                            )}
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            <img src={user.avatar} className={"h-16 w-16"}/> {user.username}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
