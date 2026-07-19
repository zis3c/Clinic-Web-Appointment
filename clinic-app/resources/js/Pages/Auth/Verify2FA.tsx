import { useState, useEffect, useRef } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import DevCodePanel from '@/Components/DevCodePanel';

type Verify2FAProps = {
    devVerificationCode?: string | null;
    devVerificationExpiresAt?: string | null;
};

export default function Verify2FA({
    devVerificationCode,
    devVerificationExpiresAt,
}: Verify2FAProps) {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const autoFillRef = useRef(false);

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
        submitOtp(route('verify-2fa.store'));
    };

    return (
        <GuestLayout 
            title="Two-Factor Authentication" 
            description="We have sent a 6-digit authentication code to your registered email address."
        >
            <Head title="Two-Factor Authentication" />

            <DevCodePanel
                title="Two-factor code"
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
                    
                    <InputError message={errors.code} className="mt-2 text-center" />
                </div>

                <div className="pt-2">
                    <button 
                        type="submit"
                        disabled={processingVerify || otp.join('').length < 6}
                        className="w-full flex items-center justify-center py-3.5 px-4 border border-transparent rounded-full shadow-[0_4px_14px_0_rgb(20,184,166,0.39)] dark:shadow-none text-sm font-bold text-white bg-gradient-to-r from-teal-500 to-blue-600 hover:shadow-[0_6px_20px_rgba(20,184,166,0.23)] dark:hover:shadow-[0_6px_20px_rgba(20,184,166,0.15)] hover:scale-[1.02] outline-none transition-all duration-300 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed group"
                    >
                        {processingVerify ? (
                            <div className="flex items-center gap-2">
                                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Verifying...</span>
                            </div>
                        ) : (
                            <span>Verify Code</span>
                        )}
                    </button>
                </div>
            </form>
            
            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-center gap-3">
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Lost your device or can't access email?</p>
                <Link 
                    href={route('login')}
                    className="text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 underline underline-offset-4 transition-colors"
                >
                    Back to Login
                </Link>
            </div>
        </GuestLayout>
    );
}
