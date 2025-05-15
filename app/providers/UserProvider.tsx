import React, {createContext, useContext, useState, useEffect, type ReactNode} from 'react';
import {kyFetcher} from "~/api/http";
import useSWR from "swr";

interface UserDetails {
    id?: string;
    username?: string;
    avatar?: string;
    email?: string;
    authentificated: boolean;
}

interface UserContextType {
    user: UserDetails | null;
    setUser: (value: UserDetails) => void;
    mutateUser: () => void;
}

// Crée le contexte avec un type par défaut
const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
    children: ReactNode;
}


interface ApiResponse {
    status: 'success' | 'error';
    data?: {
        id: string;
        username: string;
        avatar: string;
        email: string;
    };
    message?: string;
};
export function UserProvider({ children }: UserProviderProps) {
    const [user, setUser] = useState<UserDetails | null>(null);
    const { data, error, isLoading, mutate: mutateUser } = useSWR<ApiResponse>(
        `me`,
        kyFetcher,
        {
            revalidateOnFocus: true,
            revalidateOnReconnect: true,
        }
    );

    useEffect(() => {
        if(data && !isLoading) {
            if(data.status == 'success' && data.data) {
                const userData = data.data;
                setUser({
                    id: userData.id,
                    username: userData.username,
                    email: userData.email,
                    avatar: userData.avatar,
                    authentificated: true,
                });
            } else {
                setUser({
                    authentificated: false
                })
            }

        } else if(error && !isLoading) {
            setUser({
                authentificated: false
            })
        }

    }, [data, error]);
    return (
        <UserContext.Provider value={{ user, setUser, mutateUser }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within an UserProvider');
    }
    return context;
}
