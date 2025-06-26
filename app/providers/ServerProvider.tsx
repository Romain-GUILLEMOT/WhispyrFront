import React, { createContext, useContext, useState, useMemo, type ReactNode } from 'react';

// Le type pour un serveur (à adapter si besoin)
export interface Server {
    server_id: string;
    name: string;
    avatar?: string;
}

interface ServerContextType {
    currentServer: Server | null;
    setCurrentServer: (server: Server | null) => void;
}

const ServerContext = createContext<ServerContextType | undefined>(undefined);

export const ServerProvider = ({ children }: { children: ReactNode }) => {
    const [currentServer, setCurrentServer] = useState<Server | null>(null);

    const value = useMemo(() => ({
        currentServer,
        setCurrentServer,
    }), [currentServer]);

    return (
        <ServerContext.Provider value={value}>
            {children}
        </ServerContext.Provider>
    );
};

export const useServer = () => {
    const context = useContext(ServerContext);
    if (!context) {
        throw new Error('useServer must be used within a ServerProvider');
    }
    return context;
};
