import { useState, useEffect } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';

export default function VerifyEmail({ status }: any) {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);

    const { post: resendEmail, processing: processingResend } = useForm({});
    const { data, setData, post: submitOtp, processing: processingVerify, errors } = useForm({
        code: '',
    });

    // Update form data code field when otp digits change
    useEffect(() => {
        setData('code', otp.join(''));
    }, [otp]);

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
                <div className="mb-6 p-4 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-xl border border-emerald-100 animate-in fade-in slide-in-from-top-2">
                    A fresh verification code has been successfully sent to your email.
                </div>
            )}

            <form onSubmit={handleOtpSubmit} className="space-y-6">
                <div className="space-y-4">
                    <div className="flex flex-col items-center text-center">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                            Secure Verification Code
                        </h3>
                        <p className="text-xs text-gray-400 mt-1">
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
                                className="w-11 h-13 sm:w-12 sm:h-15 text-center text-xl font-black text-slate-800 bg-slate-50/50 border border-slate-300 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10 rounded-xl transition-all duration-200 outline-none shadow-sm"
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
                    disabled={data.code.length !== 6 || processingVerify}
                    className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-full shadow-md text-sm font-bold text-white bg-gradient-to-r from-teal-500 to-blue-600 hover:shadow-teal-500/30 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                    Verify Code
                </button>
            </form>

            <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
                <form onSubmit={handleResendSubmit} className="w-full sm:w-auto">
                    <button
                        type="submit"
                        disabled={processingResend}
                        className="w-full text-sm font-semibold text-teal-600 hover:text-teal-500 transition-colors disabled:opacity-50"
                    >
                        Resend Verification Code
                    </button>
                </form>

                <Link
                    href={route('logout')}
                    method="post"
                    as="button"
                    className="text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors"
                >
                    Back
                </Link>
            </div>
        </GuestLayout>
    );
}
