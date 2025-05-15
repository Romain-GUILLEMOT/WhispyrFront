import React from 'react';
import {
    CodeBracketSquareIcon,
    EnvelopeIcon,
    GlobeAltIcon,
    LockClosedIcon,
} from '@heroicons/react/24/outline';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import ky from "ky";
import createNotification from "~/components/Notification";

const emailSchema = z.object({
    email: z.string().email('Adresse email invalide'),
});

type FormData = z.infer<typeof emailSchema>;

interface Props {
    email: string;
    loading: boolean;
    setLoading: (value: boolean) => void;
    setEmail: (email: string) => void;
    setStep: (step: number) => void;
}

interface mailResponse {
    message: string;
}

export default function EmailBox({ email, loading, setLoading, setEmail, setStep }: Props) {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<FormData>({
        resolver: zodResolver(emailSchema),
        defaultValues: { email },
    });
    const onSubmit = async (data: FormData) => {
        setLoading(true);
        setEmail(data.email);
        try {
            const response: mailResponse = await ky
                .get(`${import.meta.env.VITE_API_BASE_URL}/auth/code?email=${data.email}`)
                .json();
            createNotification({type: 'success', message: response.message})
            setStep(2);
        } catch (err: any) {
            const errorBody = await err.response.json();
            if (errorBody.message.includes('WHIAUTH-004')) {
                setStep(4);
            } else {
                createNotification({type: 'error', message: errorBody.message || 'Erreur inconnue'})
            }

        }
        setLoading(false);
    };

    return (
        <div className="w-full max-w-md  bg-gray-900/30 backdrop-blur-lg rounded-3xl shadow-2xl py-12 px-10 z-10 border border-white/5">
            <div className="text-center">
                <img
                    alt="Whispyr"
                    src="https://assets.romain-guillemot.dev/whispyr/whispyr_full.webp"
                    className="h-10 mx-auto"
                />
                <h2 className="mt-8 text-2xl font-bold text-[#00C896]">
                    Sign in to your account
                </h2>
            </div>

            <form className="mt-10 space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
                <div className="relative">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                        Email address
                    </label>
                    <EnvelopeIcon className="pointer-events-none absolute left-3 top-10 h-5 w-5 text-gray-400" />
                    <input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        {...register('email')}
                        className={`mt-2 w-full rounded-xl border bg-gray-700 py-2 px-11 text-gray-100 focus:border-[#00C896] focus:ring-2 focus:ring-[#00C896]/50 outline-none ${
                            errors.email ? 'border-red-500' : 'border-gray-600'
                        }`}
                    />
                    {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl bg-[#00C896] py-2 px-4 text-white font-semibold shadow-md hover:bg-[#00b285] focus:outline-none focus:ring-2 focus:ring-[#00C896] focus:ring-offset-2 ocus:ring-offset-gray-800 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {loading ? 'Loading…' : 'Sign in'}
                </button>

                <div className="flex items-center justify-center">
                    <a href="#" className="text-sm font-semibold text-[#00C896] text-center hover:underline">
                        Forgot password?
                    </a>
                </div>
            </form>

            {/* Social Auth */}
            <div className="mt-10">
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-gray-600" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="bg-gray-800 px-3 text-gray-400">Or continue with</span>
                    </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4">
                    <button className="flex items-center justify-center gap-2 rounded-xl border border-gray-600 bg-gray-700 py-2 text-sm font-medium shadow hover:bg-gray-600 transition">
                        <GlobeAltIcon className="h-5 w-5 text-[#00C896]" />
                        Google
                    </button>
                    <button className="flex items-center justify-center gap-2 rounded-xl border border-gray-600 bg-gray-700 py-2 text-sm font-medium shadow hover:bg-gray-600 transition">
                        <CodeBracketSquareIcon className="h-5 w-5 text-gray-100" />
                        GitHub
                    </button>
                </div>
            </div>
        </div>
    );
}
