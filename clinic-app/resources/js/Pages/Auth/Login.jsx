import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout title="Welcome Back" description="Log in to access your appointments and records.">
            <Head title="Log in" />

            {status && (
                <div className="mb-4 text-sm font-medium text-green-600 bg-green-50 p-3 rounded-lg border border-green-100">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-5">
                <div>
                    <InputLabel htmlFor="email" value="Email Address" className="font-semibold text-gray-700" />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full border-gray-200 focus:border-teal-500 focus:ring-teal-500 rounded-xl shadow-sm transition-colors"
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                    />

                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="password" value="Password" className="font-semibold text-gray-700" />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full border-gray-200 focus:border-teal-500 focus:ring-teal-500 rounded-xl shadow-sm transition-colors"
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="block">
                    <label className="flex items-center">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) =>
                                setData('remember', e.target.checked)
                            }
                            className="text-teal-600 focus:ring-teal-500 rounded"
                        />
                        <span className="ms-2 text-sm text-gray-600 font-medium">
                            Remember me
                        </span>
                    </label>
                </div>

                <div className="flex flex-col space-y-4 pt-2">
                    <button 
                        disabled={processing}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-md text-sm font-bold text-white bg-gradient-to-r from-teal-500 to-blue-600 hover:shadow-teal-500/30 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-300 disabled:opacity-50"
                    >
                        Log in
                    </button>
                    
                    <div className="flex items-center justify-between mt-2">
                        {canResetPassword && (
                            <Link
                                href={route('password.request')}
                                className="text-sm text-teal-600 font-semibold hover:text-teal-500 transition-colors"
                            >
                                Forgot your password?
                            </Link>
                        )}
                        <Link
                            href={route('register')}
                            className="text-sm text-gray-500 font-medium hover:text-gray-900 transition-colors"
                        >
                            Don't have an account?
                        </Link>
                    </div>
                </div>
            </form>
        </GuestLayout>
    );
}
