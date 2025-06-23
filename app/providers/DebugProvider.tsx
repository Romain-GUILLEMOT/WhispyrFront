import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    type ReactNode
} from 'react';
import { Transition } from '@headlessui/react';
import { Fragment } from 'react';

// Définition du type pour le contexte
interface DebugContextType {
    isDebugEnabled: boolean;
}

// Création du contexte avec une valeur par défaut
const DebugContext = createContext<DebugContextType | undefined>(undefined);

// Props pour le DebugProvider
interface DebugProviderProps {
    children: ReactNode;
}

// Composant de toast temporaire pour le mode debug
const DebugToast: React.FC<{ message: string; show: boolean; isEnabled: boolean }> = ({ message, show, isEnabled }) => {
    const bgColorClass = !isEnabled ? 'bg-green-600' : 'bg-red-600'; // Vert pour ENABLED, Rouge pour DISABLED
    const textColorClass = 'text-white'; // Toujours blanc pour la lisibilité sur fond coloré

    return (
        <Transition
            show={show}
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
        >
            <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-[9999]">
                <div className={`
                    ${bgColorClass}
                    ${textColorClass}
                    px-10 py-5 // Plus de padding
                    rounded-xl // Bords plus arrondis
                    shadow-2xl // Ombre plus forte
                    text-4xl // Texte BEAUCOUP plus grand
                    font-black // Texte plus gras
                    uppercase // En majuscules
                    tracking-widest // Espacement des lettres
                    transform -translate-y-1/2 // Pour centrer parfaitement même avec un grand texte
                    ring-4 ring-white ring-opacity-20 // Anneau lumineux autour
                    animate-bounce // Utilise l'animation de base de Tailwind CSS
                `}>
                    {message}
                </div>
            </div>
        </Transition>
    );
};

export const DebugProvider: React.FC<DebugProviderProps> = ({ children }) => {
    const isGlobalDebugMode = import.meta.env.VITE_APP_DEBUG === "true";

    const [isDebugEnabled, setIsDebugEnabled] = useState(isGlobalDebugMode);
    const [toastMessage, setToastMessage] = useState<string>('');
    const [showToast, setShowToast] = useState<boolean>(false);

    const toggleDebug = useCallback(() => {
        setIsDebugEnabled(prev => !prev);
    }, []);

    useEffect(() => {
        if (!isGlobalDebugMode) {
            return;
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if ((event.ctrlKey || event.metaKey) && event.key === 'e') {
                event.preventDefault();
                toggleDebug();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isGlobalDebugMode, toggleDebug]);

    useEffect(() => {
        if (!isGlobalDebugMode) {
            return;
        }

        let message = '';
        if (isDebugEnabled) {
            message = 'DEBUG ENABLED'; // Texte plus court et direct
        } else {
            message = 'DEBUG DISABLED'; // Texte plus court et direct
        }

        setToastMessage(message);
        setShowToast(true);

        const timer = setTimeout(() => {
            setShowToast(false);
            setToastMessage('');
        }, 1500); // 1.5 secondes, suffisant pour lire un message court et gros

        return () => clearTimeout(timer);
    }, [isDebugEnabled, isGlobalDebugMode]);

    const contextValue = {
        isDebugEnabled
    };

    return (
        <DebugContext.Provider value={contextValue}>
            {children}
            {/* Passe l'état isDebugEnabled au DebugToast */}
            <DebugToast message={toastMessage} show={showToast} isEnabled={isDebugEnabled} />
        </DebugContext.Provider>
    );
};

export const useDebug = (): DebugContextType => {
    const context = useContext(DebugContext);
    if (context === undefined) {
        throw new Error('useDebug must be used within a DebugProvider');
    }
    return context;
};
