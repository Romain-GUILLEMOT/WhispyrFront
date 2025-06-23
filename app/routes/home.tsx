import { CheckBadgeIcon } from "@heroicons/react/24/solid";
import { useUser } from "@/providers/UserProvider";
import {useEffect, useState} from "react";

export default function HomeContainer() {
  const [ready, setReady] = useState(false);
  const { user } = useUser();

  useEffect(() => {
    setReady(true);
  }, []);

  if (!ready || !user) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-950">
          <div className="text-gray-400 text-xl">Chargement...</div>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-gray-950 to-black flex items-center justify-center">
        <div className="bg-gray-900/80 p-8 rounded-2xl shadow-2xl max-w-md w-full flex flex-col items-center gap-6 border border-green-800/40">
          <div className="relative">
            <img
                src={user.avatar}
                alt="Avatar"
                className="w-28 h-28 rounded-full border-4 border-green-700 shadow-lg object-cover"
            />
            {user.authentificated && (
                <CheckBadgeIcon className="absolute -bottom-2 -right-2 h-9 w-9 text-green-500 bg-gray-900 rounded-full border-2 border-green-900 shadow" />
            )}
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl font-bold text-white">{user.username}</span>
              {user.authentificated && (
                  <span className="bg-green-700 text-green-50 text-xs px-3 py-1 rounded-full font-semibold flex items-center gap-1">
                <CheckBadgeIcon className="h-4 w-4" /> Authentifié
              </span>
              )}
            </div>
            <div className="mt-2 text-sm text-gray-300">{user.email}</div>
            <div className="mt-2 text-xs text-gray-500 select-all break-all">
              <span className="font-mono">ID: {user.id}</span>
            </div>
          </div>
          <div className="mt-4">
            <a
                href="/logout"
                className="inline-block px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white font-medium transition"
            >
              Se déconnecter
            </a>
          </div>
        </div>
      </div>
  );
}
