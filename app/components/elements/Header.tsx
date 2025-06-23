// Header.tsx
import React from 'react'
import { BellIcon, Cog6ToothIcon } from '@heroicons/react/16/solid'
import { useUser } from '@/providers/UserProvider'

export default function Header() {
    const { user } = useUser()
    if (user === null) return null


    return (
        <header className="h-14 bg-[#1F1F1F] border-b border-[#2C2C2C] flex items-center justify-between px-4">
            <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold text-[#F4F4F4]">Whispyr Dev</h1>
                <span className="text-sm text-[#A0A0A0] bg-[#2C2C2C] px-2 py-0.5 rounded">#général</span>
            </div>
            <div className="flex items-center gap-4">
                <button className="text-[#5EB9FF] hover:text-white transition">
                    <BellIcon className="w-5 h-5" />
                </button>
                <button className="text-[#FFC857] hover:text-white transition">
                    <Cog6ToothIcon className="w-5 h-5" />
                </button>
                <img
                    src={user.avatar || '/default-avatar.png'}
                    className="w-8 h-8 rounded-full object-cover border border-[#2C2C2C]"
                    alt="Avatar"
                />
            </div>
        </header>
    )
}
