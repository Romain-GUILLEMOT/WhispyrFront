import { useForm } from "react-hook-form";
import {
    EnvelopeIcon,
    LockClosedIcon,
    GlobeAltIcon,
    CodeBracketSquareIcon,
} from "@heroicons/react/24/outline";
import {useState} from "react";
import EmailBox from "~/components/auth/EmailBox";
import CodeBox from "~/components/auth/CodeBox";
import RegisterBox from "~/components/auth/RegisterBox";
import LoginBox from "~/components/auth/LoginBox";

export default function LoginPage() {
    const [step, setStep] = useState<number>(1)
    const [email, setEmail] = useState<string>("");
    const [code, setVerifCode] = useState<string>("")
    const [loading, setLoading] = useState<boolean>(false);

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#003d2f] via-[#0b0b0b] to-[#1A1A1A] flex items-center justify-center px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 w-full max-w-6xl mx-auto items-center gap-8">
                {/* Auth Card */}
                {step === 1 ? (
                    <EmailBox email={email} setEmail={setEmail} setStep={setStep} loading={loading} setLoading={setLoading} />
                ) : step === 2 ? (
                    <CodeBox email={email} setVerifCode={setVerifCode} setStep={setStep} loading={loading} setLoading={setLoading} />
                ) : step === 3 ? (
                    <RegisterBox email={email} code={code} setLoading={setLoading} loading={loading} />
                ) :  <LoginBox loading={loading} setLoading={setLoading} email={email}/>}
                {/* Right Side Illustration */}
                <div className="hidden lg:block relative w-full">
                    {loading ? (
                        <img
                            alt="Whispyr illustration"
                            src="https://assets.romain-guillemot.dev/whispyr/pageillustrationthink.png"
                            className="w-full h-auto"
                        />
                    ) : (
                        <img
                            alt="Whispyr illustration"
                            src="https://assets.romain-guillemot.dev/whispyr/pageillustrationlogin.png"
                            className="w-full h-auto"
                        />
                    )}

                </div>
            </div>
        </div>
    );
}
