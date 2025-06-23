import React, {createContext, useContext, useState, useEffect, type ReactNode} from 'react';
import {kyFetcher} from "@/api/http";
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
    isLoading: boolean; // <-- AJOUTÉ: pour exposer l'état de chargement
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
        // La logique d'initialisation de l'utilisateur dans le useEffect peut être améliorée
        // pour mieux refléter les états de SWR (loading, error, data).
        // En général, si isLoading est true, on attend.
        // Si error est présent, l'utilisateur n'est pas authentifié.
        // Si data est présent et succès, l'utilisateur est authentifié.

        if (isLoading) {
            // Pas d'action si en chargement, l'état `user` reste tel quel (probablement null au début)
            return;
        }

        if (error) {
            // En cas d'erreur de la requête (non authentifié, serveur down, etc.)
            setUser({ authentificated: false });
        } else if (data) {
            // Si des données sont reçues
            if (data.status === 'success' && data.data) {
                const userData = data.data;
                setUser({
                    id: userData.id,
                    username: userData.username,
                    email: userData.email,
                    avatar: userData.avatar,
                    authentificated: true,
                });
            } else {
                // Si la requête est un succès mais le statut est 'error' ou data.data est manquant
                setUser({ authentificated: false });
            }
        }
    }, [data, error, isLoading]); // Ajout de isLoading aux dépendances

    return (
        <UserContext.Provider value={{ user, setUser, mutateUser, isLoading }}> {/* <-- AJOUTÉ: isLoading dans la valeur du contexte */}
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
