import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout title="Create an Account" description="Join us to book and manage your appointments seamlessly.">
            <Head title="Register" />

            <form onSubmit={submit} className="space-y-5">
                <div>
                    <InputLabel htmlFor="name" value="Full Name" className="font-semibold text-gray-700" />

                    <TextInput
                        id="name"
                        name="name"
                        value={data.name}
                        className="mt-1 block w-full border-gray-200 focus:border-teal-500 focus:ring-teal-500 rounded-xl shadow-sm transition-colors"
                        autoComplete="name"
                        isFocused={true}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                    />

                    <InputError message={errors.name} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="email" value="Email Address" className="font-semibold text-gray-700" />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full border-gray-200 focus:border-teal-500 focus:ring-teal-500 rounded-xl shadow-sm transition-colors"
                        autoComplete="username"
                        onChange={(e) => setData('email', e.target.value)}
                        required
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
                        autoComplete="new-password"
                        onChange={(e) => setData('password', e.target.value)}
                        required
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div>
                    <InputLabel
                        htmlFor="password_confirmation"
                        value="Confirm Password"
                        className="font-semibold text-gray-700"
                    />

                    <TextInput
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="mt-1 block w-full border-gray-200 focus:border-teal-500 focus:ring-teal-500 rounded-xl shadow-sm transition-colors"
                        autoComplete="new-password"
                        onChange={(e) =>
                            setData('password_confirmation', e.target.value)
                        }
                        required
                    />

                    <InputError
                        message={errors.password_confirmation}
                        className="mt-2"
                    />
                </div>

                <div className="flex flex-col space-y-4 pt-2">
                    <button 
                        disabled={processing}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-md text-sm font-bold text-white bg-gradient-to-r from-teal-500 to-blue-600 hover:shadow-teal-500/30 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-300 disabled:opacity-50"
                    >
                        Register Account
                    </button>

                    <div className="flex items-center justify-center mt-2">
                        <Link
                            href={route('login')}
                            className="text-sm text-gray-500 font-medium hover:text-gray-900 transition-colors"
                        >
                            Already registered? <span className="text-teal-600 font-semibold hover:text-teal-500 ml-1">Log in here</span>
                        </Link>
                    </div>
                </div>
            </form>
        </GuestLayout>
    );
}
