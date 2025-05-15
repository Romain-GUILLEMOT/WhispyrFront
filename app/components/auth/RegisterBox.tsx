import React, { useRef, useState } from 'react';
import {
    LockClosedIcon,
    UserIcon,
    CameraIcon,
} from '@heroicons/react/24/outline';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import ky from 'ky';
import createNotification from '~/components/Notification';
import {useNavigate} from "react-router";
import Cookies from 'js-cookie'

const registerSchema = z.object({
    username: z.string().min(3, 'Min 3 caractères').max(32, 'Max 32 caractères'),
    password: z.string().min(8, 'Min 8 caractères'),
});

type RegisterData = z.infer<typeof registerSchema>;

interface Props {
    email: string;
    code: string;
    loading: boolean;
    setLoading: (value: boolean) => void;
}
interface RegisterResponse {
    message: string;
    access_token: string;
    refresh_token: string;
}
export default function RegisterFinalForm({ email, code, loading, setLoading }: Props) {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<RegisterData>({
        resolver: zodResolver(registerSchema),
    });

    const avatarRef = useRef<HTMLInputElement | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const navigate = useNavigate();

    const onSubmit = async (data: RegisterData) => {
        setLoading(true);
        try {
            const form = new FormData();
            form.append('username', data.username);
            form.append('password', data.password);
            form.append('email', email);
            form.append('code', code);
            if (avatarRef.current?.files?.[0]) {
                form.append('avatar', avatarRef.current.files[0]);
            }
            const res: any = await ky
                .post(`${import.meta.env.VITE_API_BASE_URL}/auth/register`, {
                    body: form,
                })
                .json();
            createNotification({ type: 'success', message: res.message });
            Cookies.set('access_token', res.access_token, {
                expires: 1 / 24 / 12,
                secure: true,
                sameSite: 'Strict',
            })
            Cookies.set('refresh_token', res.refresh_token, {
                expires: 30,
                secure: true,
                sameSite: 'Strict',
            })
            setLoading(false)
            navigate('/');
        } catch (err: any) {
            const errorBody = await err.response.json();
            setLoading(false)
            createNotification({ type: 'error', message: errorBody.message || 'Erreur inconnue' });
        }
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="w-full max-w-md bg-gray-900/30 backdrop-blur-lg rounded-3xl shadow-2xl py-12 px-10 z-10 border border-white/5">
            <div className="text-center">
                <img
                    alt="Whispyr"
                    src="https://assets.romain-guillemot.dev/whispyr/whispyr_full.webp"
                    className="h-10 mx-auto"
                />
                <h2 className="mt-8 text-2xl font-bold text-[#00C896]">
                    Crée ton compte Whispyr
                </h2>
            </div>

            <form className="mt-10 space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
                {/* Avatar avec preview */}
                <div className="flex justify-center">
                    <label className="relative cursor-pointer flex flex-col items-center">
                        <input
                            ref={avatarRef}
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            className="hidden"
                        />
                        <span className="inline-flex size-20 overflow-hidden rounded-full bg-gray-800 border-2 border-gray-600 items-center justify-center">
      {preview ? (
          <img src={preview} alt="Preview" className="object-cover w-full h-full" />
      ) : (
          <svg fill="currentColor" viewBox="0 0 24 24" className="w-10 h-10 text-gray-400">
              <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
      )}
    </span>
                        <span className="block mt-2 text-sm text-center text-gray-400">Choisir un avatar</span>
                    </label>
                </div>
                {/* Username */}
                <div className="relative">
                    <label htmlFor="username" className="block text-sm font-medium text-gray-300">
                        Nom d'utilisateur
                    </label>
                    <UserIcon className="pointer-events-none absolute left-3 top-10 h-5 w-5 text-gray-400" />
                    <input
                        id="username"
                        {...register('username')}
                        placeholder="john_doe"
                        className={`mt-2 w-full rounded-xl border bg-gray-700 py-2 px-11 text-gray-100 focus:border-[#00C896] focus:ring-2 focus:ring-[#00C896]/50 outline-none ${
                            errors.username ? 'border-red-500' : 'border-gray-600'
                        }`}
                    />
                    {errors.username && <p className="mt-1 text-xs text-red-600">{errors.username.message}</p>}
                </div>

                {/* Password */}
                <div className="relative">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                        Mot de passe
                    </label>
                    <LockClosedIcon className="pointer-events-none absolute left-3 top-10 h-5 w-5 text-gray-400" />
                    <input
                        id="password"
                        type="password"
                        {...register('password')}
                        placeholder="••••••••"
                        className={`mt-2 w-full rounded-xl border bg-gray-700 py-2 px-11 text-gray-100 focus:border-[#00C896] focus:ring-2 focus:ring-[#00C896]/50 outline-none ${
                            errors.password ? 'border-red-500' : 'border-gray-600'
                        }`}
                    />
                    {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
                </div>

                <button
                    type="submit"
                    disabled={loading || isSubmitting}
                    className="w-full rounded-xl bg-[#00C896] py-2 px-4 text-white font-semibold shadow-md hover:bg-[#00b285] focus:outline-none focus:ring-2 focus:ring-[#00C896] focus:ring-offset-2 ocus:ring-offset-gray-800 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {loading ? 'Chargement…' : 'Créer mon compte'}
                </button>
            </form>
        </div>
    );
}
