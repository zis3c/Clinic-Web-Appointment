import { useRef, useState } from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage, router } from '@inertiajs/react';

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = '',
}: any) {
    const user = (usePage().props as any).auth.user;
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm<{ name: string; email: string }>({
            name: user.name,
            email: user.email,
        });

    const submit = (e: any) => {
        e.preventDefault();

        patch(route('profile.update'));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                setUploadError('The photo size must be less than 2MB.');
                return;
            }
            setUploadError(null);
            setUploading(true);

            const formData = new FormData();
            formData.append('avatar', file);

            router.post(route('profile.avatar.update'), formData, {
                forceFormData: true,
                onSuccess: () => {
                    setUploading(false);
                },
                onError: (errors: any) => {
                    setUploading(false);
                    if (errors.avatar) {
                        setUploadError(errors.avatar);
                    } else {
                        setUploadError('Failed to upload profile photo.');
                    }
                }
            });
        }
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                    Profile Information
                </h2>

                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Update your account's profile information and email address.
                </p>
            </header>

            {/* Profile Avatar Upload Section */}
            <div className="mt-6 flex items-center gap-6 pb-6 border-b border-gray-100 dark:border-slate-700">
                <div className="relative group shrink-0">
                    <div className="h-20 w-20 rounded-full overflow-hidden bg-gradient-to-tr from-teal-400 to-blue-500 flex items-center justify-center text-white text-3xl font-bold shadow-sm border-2 border-gray-100 dark:border-slate-600">
                        {user.avatar ? (
                            <img 
                                src={`/storage/${user.avatar}`} 
                                alt={user.name} 
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            user.name.charAt(0)
                        )}
                    </div>
                    
                    {/* Hover Upload Overlay */}
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute inset-0 bg-black/40 rounded-full flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
                    >
                        <svg className="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        </svg>
                        <span className="text-[9px] font-bold uppercase tracking-wider">Change</span>
                    </button>
                    
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        className="hidden" 
                        accept="image/*"
                    />
                </div>
                
                <div>
                    <h3 className="text-sm font-bold text-gray-800 dark:text-slate-200">Profile Photo</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-[240px]">
                        PNG, JPG, or WEBP up to 2MB. Click on the image to upload a new one.
                    </p>
                    {uploading && (
                        <div className="flex items-center text-xs text-blue-600 font-bold mt-2 animate-pulse">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Uploading photo...
                        </div>
                    )}
                    {uploadError && (
                        <p className="text-xs text-rose-600 font-bold mt-2">{uploadError}</p>
                    )}
                </div>
            </div>

            <form onSubmit={submit} className="space-y-6">
                <div>
                    <InputLabel htmlFor="name" value="Name" />

                    <TextInput
                        id="name"
                        className="mt-1 block w-full"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                        isFocused
                        autoComplete="name"
                    />

                    <InputError className="mt-2" message={errors.name} />
                </div>

                <div>
                    <InputLabel htmlFor="email" value="Email" />

                    <TextInput
                        id="email"
                        type="email"
                        className="mt-1 block w-full"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                        autoComplete="username"
                    />

                    <InputError className="mt-2" message={errors.email} />
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div>
                        <p className="mt-2 text-sm text-gray-800 dark:text-gray-300">
                            Your email address is unverified.
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="rounded-md text-sm text-gray-600 dark:text-gray-400 underline hover:text-gray-900 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                                Click here to re-send the verification email.
                            </Link>
                        </p>

                        {status === 'verification-link-sent' && (
                            <div className="mt-2 text-sm font-medium text-green-600">
                                A new verification link has been sent to your
                                email address.
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-4">
                    <PrimaryButton disabled={processing}>Save</PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Saved.
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
