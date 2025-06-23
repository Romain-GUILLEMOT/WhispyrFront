import React, {useEffect, useRef, useState} from "react";
import {useUser} from "@/providers/UserProvider";
import Cookies from "js-cookie";

type Message = {
    type: "join" | "message" | "quit";
    username: string;
    avatar: string;
    content: string;
};

export default function ChatSocket() {
    const {user} = useUser();
    const socketRef = useRef<WebSocket | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!user?.authentificated || !user.username) return;

        const token = Cookies.get("access_token");

        const socket = new WebSocket(`wss://whispyr-back.romain-guillemot.dev/ws?token=${token}`);

        socket.onopen = () => {
            console.log("🔗 WebSocket connecté");
            const joinMessage: Message = {
                type: "join",
                username: user.username!,
                avatar: user.avatar!, // Assurez-vous que l'utilisateur a un avatar attribué
                content: "a rejoint le salon"
            };
            socket.send(JSON.stringify(joinMessage));

        };

        socket.onmessage = (event) => {
            try {
                const msg: Message = JSON.parse(event.data);
                setMessages((prev) => [...prev, msg]);
            } catch (err) {
                console.warn("❌ Erreur de parsing WebSocket :", err);
            }
        };

        socket.onerror = (err) => {
            console.error("❌ WebSocket error:", err);
        };

        socket.onclose = () => {
            console.log("🔌 WebSocket déconnecté");
            const leaveMessage: Message = {
                type: "quit",
                username: user.username!,
                avatar: user.avatar!, // Assurez-vous que l'utilisateur a un avatar attribué
                content: "a quitté le salon"
            };
            socket.send(JSON.stringify(leaveMessage));
        };

        socketRef.current = socket;

        return () => {
            socket.close();
        };
    }, [user, user?.authentificated, user?.username]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({behavior: "smooth"});

    }, [messages]);

    const sendMessage = () => {
        if (socketRef.current && input.trim() !== "") {
            socketRef.current.send(input);
            setInput("");
        }
    };

    return (
        <div
            className="flex flex-col h-[90vh] max-w-2xl w-full mx-auto bg-[#1f1f1f] rounded-2xl shadow-xl border border-[#2a2a2a]">
            <div className="bg-[#121212] p-4 border-b border-[#2a2a2a] text-white font-bold text-lg">
                🗨️ Salon général
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 bg-[#121212]">
                {messages.map((msg, i) => (
                    msg.type === "message" ? (
                        <div key={i} className="flex gap-3 items-start">
                            <img
                                src={msg.avatar}
                                alt={msg.username}
                                className="w-10 h-10 rounded-full border border-[#333]"
                            />
                            <div>
                                <div className="text-sm font-semibold text-white">{msg.username}</div>
                                <div className="text-sm text-[#e0e0e0]">{msg.content}</div>
                            </div>
                        </div>
                    ) : msg.type === "join" ? (
                        <div key={i} className="text-center text-xs text-[#A0A0A0] italic">
                            ✅ {msg.username} {msg.content}
                        </div>
                    ) : msg.type === "quit" ? (
                        <div key={i} className="text-center text-xs text-[#A0A0A0] italic">
                            ❌ {msg.username} {msg.content}
                        </div>
                    ) : (null)))}
                <div ref={messagesEndRef}/>
            </div>

            <div className="p-4 border-t border-[#2a2a2a] bg-[#1f1f1f] flex gap-2">
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    placeholder="Tape ton message..."
                    className="flex-1 p-2 bg-[#2a2a2a] text-white rounded-md outline-none"
                />
                <button
                    onClick={sendMessage}
                    className="bg-[#00C896] hover:bg-[#00aa88] px-4 rounded-md text-black font-semibold"
                >
                    Envoyer
                </button>
            </div>
        </div>
    );
}
