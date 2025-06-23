import { Outlet } from '@tanstack/react-router'
import Header from '@/components/elements/Header'
import Sidebar from '@/components/elements/Sidebar'
import { PhoneIcon } from '@heroicons/react/24/solid'
import { XMarkIcon } from '@heroicons/react/20/solid'
import {useEffect, useState} from 'react'
import ErrorBoundary from '@/components/elements/ErrorBoundary'
import {useUser} from "@/providers/UserProvider";
import {useNavigate} from "react-router";
import LoadingFull from "@/components/elements/LoadingFull";

export default function App() {
    const [isContactOpen, setContactOpen] = useState(false)
    const [isContactIcon, setContactIcon] = useState(true)
    const {user} = useUser()
    useEffect(() => {
        if(user && !user.authentificated && !window.location.pathname.startsWith('/auth')) {
            console.log(user)
            window.location.href = '/auth/login'
        }
    }, [user]);
    if(!user) {
        return <LoadingFull/>
    }
    return (
        <>
            {!window.location.pathname.startsWith('/auth') ? (
                <div className="flex h-screen w-full bg-[#121212] text-[#F4F4F4]">
                    <Sidebar />
                    <div className="flex-1 flex flex-col">
                        <Header />
                        <main className="flex-1 overflow-y-auto p-4">
                            <Outlet />
                        </main>
                    </div>
                </div>
            ): (
                <Outlet />
            )}


            {isContactIcon && (
                <div
                    className="fixed bottom-5 right-5 w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-xl border-ozlaloc-600 border-2 cursor-pointer"
                    onClick={() => setContactOpen(!isContactOpen)}
                    title="Contactez-nous"
                >
                    <PhoneIcon className="h-6 w-6 text-ozlaloc-600" />
                    <div
                        className="absolute -top-1 -right-1 w-5 h-5 text-white bg-ozlaloc-600 opacity-50 text-xs flex items-center justify-center rounded-full cursor-pointer"
                        onClick={(e) => {
                            e.stopPropagation()
                            setContactIcon(false)
                        }}
                        title="Fermer"
                    >
                        <XMarkIcon className="h-full w-full text-white" />
                    </div>
                </div>
            )}
        </>
    )
}
