import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function ForgotPassword({ status }: any) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e: any) => {
        e.preventDefault();

        post(route('password.email'));
    };

    return (
        <GuestLayout title="Reset Password" description="Enter your email to receive a password reset link.">
            <Head title="Forgot Password" />

            <div className="mb-6 text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                Forgot your password? No problem. Just let us know your email
                address and we will email you a password reset link that will
                allow you to choose a new one.
            </div>

            {status && (
                <div className="mb-6 text-sm font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 p-3 rounded-xl border border-green-100 dark:border-green-800/50">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-5">
                <div>
                    <InputLabel htmlFor="email" value="Email Address" className="font-semibold text-gray-700 dark:text-gray-200" />
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full border-gray-200/80 dark:border-slate-700/80 rounded-xl shadow-sm py-3 bg-white/70 dark:bg-slate-800/70 text-slate-900 dark:text-white backdrop-blur-sm"
                        isFocused={true}
                        onChange={(e: any) => setData('email', e.target.value)}
                    />
                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="flex flex-col space-y-4 pt-2">
                    <button 
                        disabled={processing}
                        className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-full shadow-[0_4px_14px_0_rgb(20,184,166,0.39)] dark:shadow-none text-sm font-bold text-white bg-gradient-to-r from-teal-500 to-blue-600 hover:shadow-[0_6px_20px_rgba(20,184,166,0.23)] dark:hover:shadow-[0_6px_20px_rgba(20,184,166,0.15)] hover:scale-[1.02] outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 focus:ring-teal-500 transition-all duration-300 disabled:opacity-50"
                    >
                        Send Reset Link
                    </button>
                    
                    <div className="flex justify-center mt-2">
                        <Link
                            href={route('login')}
                            className="text-sm text-gray-500 dark:text-gray-400 font-medium hover:text-gray-900 dark:hover:text-white transition-all"
                        >
                            Return to <span className="text-teal-600 dark:text-teal-400 font-semibold hover:text-teal-500 dark:hover:text-teal-300 ml-1">Log in</span>
                        </Link>
                    </div>
                </div>
            </form>
        </GuestLayout>
    );
}
