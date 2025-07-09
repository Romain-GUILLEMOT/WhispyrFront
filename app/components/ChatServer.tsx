import React, {
    useEffect,
    useMemo,
    useRef,
    useState,
    useLayoutEffect,
} from "react";
import { useWebSocket } from "@/providers/WebSocketProvider";
import { PaperAirplaneIcon } from "@heroicons/react/16/solid";
import TextareaAutosize from "react-textarea-autosize";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import useSWRInfinite from "swr/infinite";
import { kyFetcher } from "@/api/http";
import { useInView } from "react-intersection-observer";

/* ─────────── Types ─────────── */
interface ChatMessage {
    id: string;
    username: string;
    timestamp: string;
    content: string;
    avatar?: string;
    _isRealtime?: boolean; // pour l’animation d’apparition
}

interface ApiResponse {
    data: any[];
    next_cursor: string | null;
}

/* ─────────── Composant ─────────── */
export default function ChatServer() {
    const {
        sendMessage,
        currentServer,
        currentChannel,
        messages,
        isConnected,
    } = useWebSocket();

    const [input, setInput] = useState("");

    /* ───── Intersection Observer (sentinelle bas du DOM) ───── */
    const { ref: sentinelRef, inView } = useInView({
        threshold: 0,
        rootMargin: "150px 0px",
    });

    /* ───── Pagination SWR ───── */
    const getKey = (
        pageIndex: number,
        previous: ApiResponse | null
    ): string | null => {
        if (!currentServer?.id || !currentChannel?.id) return null;

        if (pageIndex === 0)
            return `server/${currentServer.id}/channels/${currentChannel.id}/messages`;

        if (previous?.next_cursor)
            return `server/${currentServer.id}/channels/${currentChannel.id}/messages?cursor=${previous.next_cursor}`;

        return null;
    };

    const {
        data: pages,
        size,
        setSize,
        isLoading,
    } = useSWRInfinite<ApiResponse>(getKey, kyFetcher, {
        revalidateFirstPage: false,
        keepPreviousData: true,
        dedupingInterval: 2_000,
    });

    const hasMore = pages?.[pages.length - 1]?.next_cursor != null;

    /* ───── Charger plus quand la sentinelle arrive à l’écran ───── */
    useEffect(() => {
        if (inView && hasMore && !isLoading) setSize((p) => p + 1);
    }, [inView, hasMore, isLoading, setSize]);

    /* ───── Réinitialiser la pagination au changement de salon ───── */
    useEffect(() => {
        setSize(1);
    }, [currentChannel?.id, setSize]);

    /* ───── Transforme l’historique reçu en tableaux typés ───── */
    const history: ChatMessage[] = useMemo(() => {
        if (!pages) return [];
        return pages.flatMap((p) =>
            Array.isArray(p?.data)
                ? p.data.map((m: any) => ({
                    id: m.id,
                    username: m.username,
                    timestamp: m.timestamp,
                    content: m.content,
                    avatar: m.avatar,
                }))
                : []
        );
    }, [pages]);

    /* ───── Messages temps-réel du WS ───── */
    const realtime: ChatMessage[] = currentChannel
        ? (messages[currentChannel.id] ?? []).map((m) => ({ ...m, _isRealtime: true }))
        : [];

    /* ───── Concatène et dé-doublonne ───── */
    const all: ChatMessage[] = useMemo(() => {
        const combined = [...history, ...realtime];
        const seen = new Set<string>();
        const out: ChatMessage[] = [];

        // on parcourt du plus vieux au plus récent,
        // puis on inverse pour avoir le plus récent en premier
        for (const msg of combined) {
            if (!seen.has(msg.id)) {
                seen.add(msg.id);
                out.push(msg);
            }
        }
        return out.reverse(); // le plus récent en PREMIER
    }, [history, realtime]);

    /* ───── Références de scroll ───── */
    const containerRef = useRef<HTMLDivElement>(null);
    const prevHeight = useRef(0);
    const prevCount = useRef(0);

    /*
       1) Conserver la position quand on PRÉ-pend (chargement historique)
       2) Scroller en haut (scrollTop = 0) pour afficher le nouveau message le plus récent
    */
    useLayoutEffect(() => {
        const cont = containerRef.current;
        if (!cont) return;

        // a) on vient de pré-pendre des messages (historique)
        if (all.length > prevCount.current && isLoading) {
            const diff = cont.scrollHeight - prevHeight.current;
            cont.scrollTop = diff + cont.scrollTop;
        }

        // b) message temps-réel → on remonte en haut
        if (realtime.length && all[0]?._isRealtime) {
            cont.scrollTop = 0;
        }

        prevHeight.current = cont.scrollHeight;
        prevCount.current = all.length;
    }, [all, isLoading, realtime.length]);

    /* ───── Envoi d’un message ───── */
    const handleSend = (
        e:
            | React.FormEvent<HTMLFormElement>
            | React.KeyboardEvent<HTMLTextAreaElement>
    ) => {
        e.preventDefault();
        if (
            input.trim() &&
            currentServer &&
            currentChannel &&
            isConnected
        ) {
            sendMessage({
                type: "chat",
                serverId: currentServer.id,
                channelId: currentChannel.id,
                content: input.trim(),
            });
            setInput("");
        }
    };

    /* ───── Si aucun salon sélectionné ───── */
    if (!currentChannel) {
        return (
            <div className="flex items-center justify-center h-full w-full text-gray-400">
                Sélectionnez un salon pour commencer à discuter.
            </div>
        );
    }

    /* ───────────────────── RENDU ───────────────────── */
    return (
        <div className="flex flex-col h-full w-full bg-glass-very-dark">
            {/* ── Liste des messages ── */}
            <div
                ref={containerRef}
                className="flex-1 overflow-y-auto px-6 py-4 space-y-5 no-scrollbar flex flex-col-reverse"
            >
                {/* Sentinelle (en bas du DOM, en haut visuellement) */}
                <div
                    ref={sentinelRef}
                    key={size}
                    className="text-center p-2"
                >
                    {isLoading && (
                        <span className="text-gray-400">Chargement…</span>
                    )}
                    {!hasMore && !isLoading && all.length > 0 && (
                        <span className="text-gray-500">Début de la conversation</span>
                    )}
                </div>

                {all.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex gap-4 items-start p-2 rounded-lg transition-all duration-300 hover:bg-white/5 ${
                            msg._isRealtime ? "animate-fade-in" : ""
                        }`}
                    >
                        <img
                            src={
                                msg.avatar ??
                                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                    msg.username
                                )}&background=373049&color=D9C9FF&bold=true&size=128`
                            }
                            alt={msg.username}
                            className="w-10 h-10 rounded-full mt-1 flex-shrink-0"
                        />
                        <div className="flex flex-col min-w-0">
                            <div className="flex items-baseline gap-2">
                <span className="font-semibold text-white">
                  {msg.username}
                </span>
                                <span className="text-xs text-gray-500">
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                  })}
                </span>
                            </div>
                            <div className="text-gray-300 text-base prose prose-invert break-words">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {msg.content}
                                </ReactMarkdown>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Zone de saisie ── */}
            <div className="px-6 pb-4 pt-2 shrink-0">
                <form onSubmit={handleSend} className="flex gap-2 items-end">
                    <TextareaAutosize
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) handleSend(e);
                        }}
                        placeholder={`Envoyer un message dans #${currentChannel.name}`}
                        className="flex-1 bg-glass-dark p-3 text-white rounded-xl outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-whisper-500 border border-glass-border resize-none"
                        disabled={!isConnected}
                        maxRows={5}
                    />
                    <button
                        type="submit"
                        className="p-2 rounded-lg bg-whisper-500 text-white hover:bg-whisper-600 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                        disabled={!isConnected || !input.trim()}
                    >
                        <PaperAirplaneIcon className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    );
}

/*
  CSS à placer dans votre feuille globale (ou Tailwind @layer utilities) :

  @keyframes fade-in {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in {
    animation: fade-in 0.25s ease-out both;
  }
*/
