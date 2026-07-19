import { useState, useEffect, useRef } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import DevCodePanel from '@/Components/DevCodePanel';

type VerifyEmailProps = {
    status?: string;
    devVerificationCode?: string | null;
    devVerificationExpiresAt?: string | null;
};

export default function VerifyEmail({
    status,
    devVerificationCode,
    devVerificationExpiresAt,
}: VerifyEmailProps) {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const autoFillRef = useRef(false);

    const { post: resendEmail, processing: processingResend } = useForm({});
    const { setData, post: submitOtp, processing: processingVerify, errors } = useForm({
        code: '',
    });

    // Update form data code field when otp digits change
    useEffect(() => {
        setData('code', otp.join(''));
    }, [otp, setData]);

    useEffect(() => {
        if (autoFillRef.current || !devVerificationCode || devVerificationCode.length !== 6) {
            return;
        }

        autoFillRef.current = true;
        setOtp(devVerificationCode.split(''));
    }, [devVerificationCode]);

    const handleChange = (value: string, index: number) => {
        if (isNaN(Number(value))) return;

        const newOtp = [...otp];
        newOtp[index] = value.substring(value.length - 1);
        setOtp(newOtp);

        // Auto-focus next input field
        if (value && index < 5) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            nextInput?.focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            const prevInput = document.getElementById(`otp-${index - 1}`);
            prevInput?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').trim();
        if (/^\d{6}$/.test(pastedData)) {
            const digits = pastedData.split('');
            setOtp(digits);
            document.getElementById('otp-5')?.focus();
        }
    };

    const handleOtpSubmit = (e: any) => {
        e.preventDefault();
        submitOtp(route('verification.otp'));
    };

    const handleResendSubmit = (e: any) => {
        e.preventDefault();
        resendEmail(route('verification.send'));
    };

    return (
        <GuestLayout 
            title="Enter Verification Code" 
            description="We have sent a 6-digit verification code to your registered email address."
        >
            <Head title="Verify Email" />

            {status === 'verification-link-sent' && (
                <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-semibold rounded-xl border border-emerald-100 dark:border-emerald-500/20 animate-in fade-in slide-in-from-top-2">
                    A fresh verification code has been successfully sent to your email.
                </div>
            )}

            <DevCodePanel
                title="Email verification code"
                code={devVerificationCode}
                expiresAt={devVerificationExpiresAt}
            />

            <form onSubmit={handleOtpSubmit} className="space-y-6">
                <div className="space-y-4">
                    <div className="flex flex-col items-center text-center">
                        <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 capitalize tracking-widest">
                            Secure Verification Code
                        </h3>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            Type or paste the 6-digit code below
                        </p>
                    </div>
                    
                    <div className="flex justify-center gap-2.5 sm:gap-3.5 mt-6" onPaste={handlePaste}>
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                id={`otp-${index}`}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleChange(e.target.value, index)}
                                onKeyDown={(e) => handleKeyDown(e, index)}
                                className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-black text-slate-900 dark:text-white bg-white/70 dark:bg-slate-800/70 border-gray-200/80 dark:border-slate-700/80 focus:border-teal-500 focus:ring-teal-500/20 dark:focus:ring-teal-500/40 rounded-2xl shadow-sm backdrop-blur-sm transition-all duration-300 outline-none"
                                autoComplete="off"
                            />
                        ))}
                    </div>
                    
                    {errors.code && (
                        <div className="text-center">
                            <InputError message={errors.code} />
                        </div>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={processingVerify || otp.join('').length < 6}
                    className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-full shadow-[0_4px_14px_0_rgb(20,184,166,0.39)] dark:shadow-none text-sm font-bold text-white bg-gradient-to-r from-teal-500 to-blue-600 hover:shadow-[0_6px_20px_rgba(20,184,166,0.23)] dark:hover:shadow-[0_6px_20px_rgba(20,184,166,0.15)] hover:scale-[1.02] outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 focus:ring-teal-500 transition-all duration-300 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed group"
                >
                    Verify Code
                </button>
            </form>

            <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-100 dark:border-slate-800">
                <form onSubmit={handleResendSubmit} className="w-full sm:w-auto">
                    <button
                        type="submit"
                        disabled={processingResend}
                        className="w-full text-sm font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-500 dark:hover:text-teal-300 transition-all disabled:opacity-50"
                    >
                        Resend Verification Code
                    </button>
                </form>

                <Link
                    href={route('logout')}
                    method="post"
                    as="button"
                    className="text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all"
                >
                    Back
                </Link>
            </div>
        </GuestLayout>
    );
}

