import React, { createContext, useContext, useState, useMemo, type ReactNode } from 'react';



interface ChannelContextType {
    currentChannel: Channel | null;
    setCurrentChannel: (channel: Channel | null) => void;
}

const ChannelContext = createContext<ChannelContextType | undefined>(undefined);

export const ChannelProvider = ({ children }: { children: ReactNode }) => {
    const [currentChannel, setCurrentChannel] = useState<Channel | null>(null);

    const value = useMemo(() => ({
        currentChannel,
        setCurrentChannel,
    }), [currentChannel]);

    return (
        <ChannelContext.Provider value={value}>
            {children}
        </ChannelContext.Provider>
    );
};

export const useChannel = () => {
    const context = useContext(ChannelContext);
    if (!context) {
        throw new Error('useChannel must be used within a ChannelProvider');
    }
    return context;
};
