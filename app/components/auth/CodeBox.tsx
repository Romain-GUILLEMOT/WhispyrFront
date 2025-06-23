import React, { useEffect, useState } from "react";
import {
    LockClosedIcon,
} from "@heroicons/react/24/outline";
import { OTPInput } from "input-otp";
import ky from "ky";
import createNotification from "@/components/Notification";

interface Props {
    email: string;
    loading: boolean;
    setLoading: (value: boolean) => void;
    setStep: (step: number) => void;
    setVerifCode: (code: string) => void;

}


interface codeResponse {
    message: string;
    data: string;
}

export default function CodeBox({ email, loading, setLoading, setStep, setVerifCode }: Props) {
    const [code, setCode] = useState<string>("");

    useEffect(() => {
        console.log("Code actuel :", code);
        if(code.length === 4) {
            setLoading(true);
            setTimeout(async () => {
                try {
                    const response: codeResponse = await ky
                        .post(`${import.meta.env.VITE_API_BASE_URL}/auth/code`, {
                            json: {
                                code,
                                email
                            }
                        })
                        .json();
                    setVerifCode(response.data);
                    setStep(3);
                } catch (err: any) {
                    const errorBody = await err.response.json();
                    createNotification({type: 'error', message: errorBody.message || 'Erreur inconnue'})

                }
                setLoading(false);
                console.log("done")
            }, 100)

        }
    }, [code]);

    return (
        <div className="w-full max-w-md bg-gray-900/30 backdrop-blur-lg rounded-3xl shadow-2xl py-12 px-10 z-10 border border-white/5">
            <div className="text-center">
                <img
                    alt="Whispyr"
                    src="https://assets.romain-guillemot.dev/whispyr/whispyr_full.webp"
                    className="h-10 mx-auto"
                />
                <h2 className="mt-8 text-2xl font-bold text-[#00C896]">
                    Vérification de l'email
                </h2>
            </div>

            <form className="mt-10 space-y-6">
                <div className="text-center">
                    <label htmlFor="code" className="block text-sm font-medium text-gray-300 mb-4">
                        Entrez le code reçu
                    </label>

                    <OTPInput
                        maxLength={4}
                        value={code}
                        disabled={loading}
                        onChange={(value) => {
                            if (/^\d*$/.test(value)) setCode(value);
                        }}
                        containerClassName="flex justify-center gap-3"
                        render={({ slots }) => (
                            <>
                                {slots.map((slot, idx) => (
                                    <div
                                        key={idx}
                                        className="relative w-14 h-14 text-2xl font-bold rounded-xl border border-gray-600 text-white flex items-center justify-center shadow-inner bg-gray-800 focus-within:ring-2 focus-within:ring-[#00C896]/70 transition-all duration-150"
                                    >
                                        {slot.isActive && (
                                            <div className="absolute inset-0 animate-pulse border-2 border-[#00C896] rounded-xl pointer-events-none" />
                                        )}
                                        <input
                                            {...slot.inputProps}
                                            inputMode="numeric"
                                            maxLength={1}
                                            disabled={loading}
                                            pattern="[0-9]*"
                                            value={slot.char ?? ""} // 🔥 force le rendu du chiffre ici
                                            className="w-full h-full text-center bg-transparent border-none outline-none text-white text-2xl font-bold"
                                        />
                                    </div>
                                ))}
                            </>
                        )}
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-8 rounded-xl bg-[#00C896] py-2 px-4 text-white font-semibold shadow-md hover:bg-[#00b285] focus:outline-none focus:ring-2 focus:ring-[#00C896] focus:ring-offset-2 focus:ring-offset-gray-800 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {loading ? "Chargement…" : "Vérifier mon email"}
                </button>
            </form>
        </div>
    );
}
