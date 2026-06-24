import { useState } from 'react';
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Register() {
    const [step, setStep] = useState(1);
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        tel: '',
        nic: '',
        dob: '',
        address: '',
        gender: '',
        blood_group: '',
        allergies: '',
        medical_conditions: '',
    });

    const nextStep = () => setStep((prev) => Math.min(prev + 1, 4));
    const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

    const submit = (e: any) => {
        e.preventDefault();
        if (step < 4) {
            nextStep();
        } else {
            post(route('register'), {
                onFinish: () => reset('password', 'password_confirmation'),
            });
        }
    };

    return (
        <GuestLayout title="Create an Account" description="Join us to book and manage your appointments seamlessly.">
            <Head title="Register" />

            {/* Progress Indicator */}
            <div className="mb-8">
                <div className="flex items-center justify-between relative">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-100 rounded-full z-0"></div>
                    <div 
                        className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full z-0 transition-all duration-500"
                        style={{ width: `${((step - 1) / 3) * 100}%` }}
                    ></div>
                    
                    {[1, 2, 3, 4].map((num) => (
                        <div 
                            key={num} 
                            className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                                step >= num 
                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-200' 
                                    : 'bg-white text-gray-400 border-2 border-gray-200'
                            }`}
                        >
                            {step > num ? (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                            ) : num}
                        </div>
                    ))}
                </div>
                <div className="flex justify-between mt-2 text-[10px] sm:text-xs font-semibold text-gray-400">
                    <span className={step >= 1 ? 'text-blue-700' : ''}>Account</span>
                    <span className={step >= 2 ? 'text-blue-700' : ''}>Personal</span>
                    <span className={step >= 3 ? 'text-blue-700' : ''}>Contact</span>
                    <span className={step >= 4 ? 'text-blue-700' : ''}>Medical</span>
                </div>
            </div>

            <form onSubmit={submit} className="space-y-4 relative min-h-[250px]">
                
                {/* STEP 1: Account Info */}
                <div className={`transition-all duration-500 ${step === 1 ? 'block animate-in fade-in slide-in-from-right-4' : 'hidden'}`}>
                    <h3 className="text-base font-bold text-gray-800 mb-4">Step 1: Account Details</h3>
                    <div className="space-y-4">
                        <div>
                            <InputLabel htmlFor="name" value="Full Name" className="font-semibold text-gray-700" />
                            <TextInput
                                id="name"
                                name="name"
                                value={data.name}
                                className="mt-1 block w-full border-gray-200 focus:border-teal-500 focus:ring-teal-500 rounded-xl shadow-sm transition-colors"
                                autoComplete="name"
                                onChange={(e: any) => setData('name', e.target.value)}
                                required={step === 1}
                            />
                            <InputError message={errors.name} className="mt-1" />
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
                                onChange={(e: any) => setData('email', e.target.value)}
                                required={step === 1}
                            />
                            <InputError message={errors.email} className="mt-1" />
                        </div>
                        <div>
                            <InputLabel htmlFor="password" value="Password" className="font-semibold text-gray-700" />
                            <div className="relative">
                                <TextInput
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={data.password}
                                    className="mt-1 block w-full border-gray-200 focus:border-teal-500 focus:ring-teal-500 rounded-xl shadow-sm transition-colors pr-10"
                                    autoComplete="new-password"
                                    onChange={(e: any) => setData('password', e.target.value)}
                                    required={step === 1}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-teal-600 focus:outline-none transition-colors"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path></svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                                    )}
                                </button>
                            </div>
                            <InputError message={errors.password} className="mt-1" />
                        </div>
                        <div>
                            <InputLabel htmlFor="password_confirmation" value="Confirm Password" className="font-semibold text-gray-700" />
                            <div className="relative">
                                <TextInput
                                    id="password_confirmation"
                                    type={showPassword ? "text" : "password"}
                                    name="password_confirmation"
                                    value={data.password_confirmation}
                                    className="mt-1 block w-full border-gray-200 focus:border-teal-500 focus:ring-teal-500 rounded-xl shadow-sm transition-colors pr-10"
                                    autoComplete="new-password"
                                    onChange={(e: any) => setData('password_confirmation', e.target.value)}
                                    required={step === 1}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-teal-600 focus:outline-none transition-colors"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path></svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                                    )}
                                </button>
                            </div>
                            <InputError message={errors.password_confirmation} className="mt-1" />
                        </div>
                    </div>
                </div>

                {/* STEP 2: Personal Info */}
                <div className={`transition-all duration-500 ${step === 2 ? 'block animate-in fade-in slide-in-from-right-4' : 'hidden'}`}>
                    <h3 className="text-base font-bold text-gray-800 mb-4">Step 2: Personal Information</h3>
                    <div className="space-y-4">
                        <div>
                            <InputLabel htmlFor="dob" value="Date of Birth" className="font-semibold text-gray-700" />
                            <TextInput
                                id="dob"
                                type="date"
                                name="dob"
                                value={data.dob}
                                className="mt-1 block w-full border-gray-200 focus:border-teal-500 focus:ring-teal-500 rounded-xl shadow-sm transition-colors"
                                onChange={(e: any) => setData('dob', e.target.value)}
                                required={step === 2}
                            />
                            <InputError message={errors.dob} className="mt-1" />
                        </div>
                        
                        <div>
                            <InputLabel htmlFor="gender" value="Gender" className="font-semibold text-gray-700 mb-1" />
                            <Listbox value={data.gender} onChange={(val) => setData('gender', val)}>
                                {({ open }) => (
                                    <div className="relative">
                                        <ListboxButton className="mt-1 flex items-center justify-between w-full px-4 py-3 border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 rounded-xl shadow-sm bg-white text-left text-sm text-gray-900 transition-all duration-200 outline-none cursor-pointer">
                                            <span className={data.gender ? "text-gray-900 font-medium" : "text-gray-400"}>
                                                {data.gender || "Select Gender"}
                                            </span>
                                            <svg 
                                                className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} 
                                                fill="none" 
                                                stroke="currentColor" 
                                                viewBox="0 0 24 24"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                            </svg>
                                        </ListboxButton>

                                        <ListboxOptions className="absolute left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl z-20 overflow-hidden py-1 outline-none animate-in fade-in slide-in-from-top-2 duration-200">
                                            {['Male', 'Female', 'Other'].map((option) => (
                                                <ListboxOption
                                                    key={option}
                                                    value={option}
                                                    className={({ active, selected }) =>
                                                        `flex items-center justify-between w-full px-4 py-3 text-sm text-left cursor-pointer transition-colors ${
                                                            selected 
                                                                ? 'bg-teal-50 text-teal-600 font-bold' 
                                                                : active 
                                                                    ? 'bg-teal-50/50 text-teal-600' 
                                                                    : 'text-gray-700'
                                                        }`
                                                    }
                                                >
                                                    {({ selected }) => (
                                                        <>
                                                            <span>{option}</span>
                                                            {selected && (
                                                                <svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path>
                                                                </svg>
                                                            )}
                                                        </>
                                                    )}
                                                </ListboxOption>
                                            ))}
                                        </ListboxOptions>
                                    </div>
                                )}
                            </Listbox>
                            <InputError message={errors.gender} className="mt-1" />
                        </div>

                        <div>
                            <InputLabel htmlFor="nic" value="National ID (NIC)" className="font-semibold text-gray-700" />
                            <TextInput
                                id="nic"
                                name="nic"
                                value={data.nic}
                                className="mt-1 block w-full border-gray-200 focus:border-teal-500 focus:ring-teal-500 rounded-xl shadow-sm transition-colors"
                                onChange={(e: any) => setData('nic', e.target.value)}
                            />
                            <InputError message={errors.nic} className="mt-1" />
                        </div>
                    </div>
                </div>

                {/* STEP 3: Contact Info */}
                <div className={`transition-all duration-500 ${step === 3 ? 'block animate-in fade-in slide-in-from-right-4' : 'hidden'}`}>
                    <h3 className="text-base font-bold text-gray-800 mb-4">Step 3: Contact Information</h3>
                    <div className="space-y-4">
                        <div>
                            <InputLabel htmlFor="tel" value="Phone Number" className="font-semibold text-gray-700" />
                            <TextInput
                                id="tel"
                                name="tel"
                                type="tel"
                                value={data.tel}
                                className="mt-1 block w-full border-gray-200 focus:border-teal-500 focus:ring-teal-500 rounded-xl shadow-sm transition-colors"
                                onChange={(e: any) => setData('tel', e.target.value)}
                                required={step === 3}
                            />
                            <InputError message={errors.tel} className="mt-1" />
                        </div>

                        <div>
                            <InputLabel htmlFor="address" value="Home Address" className="font-semibold text-gray-700" />
                            <TextInput
                                id="address"
                                name="address"
                                value={data.address}
                                className="mt-1 block w-full border-gray-200 focus:border-teal-500 focus:ring-teal-500 rounded-xl shadow-sm transition-colors"
                                onChange={(e: any) => setData('address', e.target.value)}
                            />
                            <InputError message={errors.address} className="mt-1" />
                        </div>
                    </div>
                </div>

                {/* STEP 4: Medical Profile */}
                <div className={`transition-all duration-500 ${step === 4 ? 'block animate-in fade-in slide-in-from-right-4' : 'hidden'}`}>
                    <h3 className="text-base font-bold text-gray-800 mb-4">Step 4: Medical Profile</h3>
                    <div className="space-y-4">
                        <div>
                            <InputLabel htmlFor="blood_group" value="Blood Group" className="font-semibold text-gray-700 mb-1" />
                            <Listbox value={data.blood_group} onChange={(val) => setData('blood_group', val)}>
                                {({ open }) => (
                                    <div className="relative">
                                        <ListboxButton className="mt-1 flex items-center justify-between w-full px-4 py-3 border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 rounded-xl shadow-sm bg-white text-left text-sm text-gray-900 transition-all duration-200 outline-none cursor-pointer">
                                            <span className={data.blood_group ? "text-gray-900 font-medium" : "text-gray-400"}>
                                                {data.blood_group || "Select Blood Group (Optional)"}
                                            </span>
                                            <svg 
                                                className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} 
                                                fill="none" 
                                                stroke="currentColor" 
                                                viewBox="0 0 24 24"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                            </svg>
                                        </ListboxButton>

                                        <ListboxOptions className="absolute left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl z-20 overflow-hidden py-1 max-h-60 overflow-y-auto outline-none animate-in fade-in slide-in-from-top-2 duration-200">
                                            <ListboxOption
                                                value=""
                                                className={({ active, selected }) =>
                                                    `w-full px-4 py-3 text-sm text-left cursor-pointer transition-colors ${
                                                        active ? 'bg-gray-50 text-gray-900' : 'text-gray-500'
                                                    }`
                                                }
                                            >
                                                Select Blood Group (Optional)
                                            </ListboxOption>
                                            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                                                <ListboxOption
                                                    key={bg}
                                                    value={bg}
                                                    className={({ active, selected }) =>
                                                        `flex items-center justify-between w-full px-4 py-3 text-sm text-left cursor-pointer transition-colors ${
                                                            selected 
                                                                ? 'bg-teal-50 text-teal-600 font-bold' 
                                                                : active 
                                                                    ? 'bg-teal-50/50 text-teal-600' 
                                                                    : 'text-gray-700'
                                                        }`
                                                    }
                                                >
                                                    {({ selected }) => (
                                                        <>
                                                            <span>{bg}</span>
                                                            {selected && (
                                                                <svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path>
                                                                </svg>
                                                            )}
                                                        </>
                                                    )}
                                                </ListboxOption>
                                            ))}
                                        </ListboxOptions>
                                    </div>
                                )}
                            </Listbox>
                            <InputError message={errors.blood_group} className="mt-1" />
                        </div>

                        <div>
                            <InputLabel htmlFor="allergies" value="Known Allergies" className="font-semibold text-gray-700" />
                            <TextInput
                                id="allergies"
                                name="allergies"
                                placeholder="E.g. Penicillin (Leave blank if none)"
                                value={data.allergies}
                                className="mt-1 block w-full border-gray-200 focus:border-teal-500 focus:ring-teal-500 rounded-xl shadow-sm transition-colors"
                                onChange={(e: any) => setData('allergies', e.target.value)}
                            />
                            <InputError message={errors.allergies} className="mt-1" />
                        </div>

                        <div>
                            <InputLabel htmlFor="medical_conditions" value="Pre-existing Conditions" className="font-semibold text-gray-700" />
                            <TextInput
                                id="medical_conditions"
                                name="medical_conditions"
                                placeholder="E.g. Asthma, Diabetes (Leave blank if none)"
                                value={data.medical_conditions}
                                className="mt-1 block w-full border-gray-200 focus:border-teal-500 focus:ring-teal-500 rounded-xl shadow-sm transition-colors"
                                onChange={(e: any) => setData('medical_conditions', e.target.value)}
                            />
                            <InputError message={errors.medical_conditions} className="mt-1" />
                        </div>
                    </div>
                </div>

                {/* Form Controls */}
                <div className="flex gap-3 pt-6 mt-2 border-t border-gray-100">
                    {step > 1 && (
                        <button 
                            type="button"
                            onClick={prevStep}
                            className="w-1/3 flex justify-center py-3 px-4 border border-gray-200 rounded-full shadow-sm text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 hover:scale-[1.02] transition-all duration-300"
                        >
                            Back
                        </button>
                    )}

                    {step < 4 ? (
                        <button 
                            type="submit"
                            className={`${step === 1 ? 'w-full' : 'w-2/3'} flex justify-center items-center py-3 px-4 border border-transparent rounded-full shadow-md text-sm font-bold text-white bg-gradient-to-r from-teal-500 to-blue-600 hover:shadow-teal-500/30 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-300`}
                        >
                            Next Step
                            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                        </button>
                    ) : (
                        <button 
                            type="submit"
                            disabled={processing}
                            className="w-2/3 flex justify-center items-center py-3 px-4 border border-transparent rounded-full shadow-md text-sm font-bold text-white bg-gradient-to-r from-green-500 to-teal-600 hover:shadow-green-500/30 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-300 disabled:opacity-50"
                        >
                            Complete Setup
                            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        </button>
                    )}
                </div>

                <div className="flex items-center justify-center mt-6">
                    <Link
                        href={route('login')}
                        className="text-sm text-gray-500 font-medium hover:text-gray-900 transition-colors"
                    >
                        Already registered? <span className="text-teal-600 font-semibold hover:text-teal-500 ml-1">Log in here</span>
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
