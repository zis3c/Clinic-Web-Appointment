import React from 'react';
import SidebarLayout from '@/Layouts/SidebarLayout';
import { Head, useForm } from '@inertiajs/react';

export default function Profile({ auth, patientData, flash }: any) {
    const { data, setData, patch, processing, errors, recentlySuccessful } = useForm({
        gender: patientData?.gender || '',
        blood_group: patientData?.blood_group || '',
        allergies: patientData?.allergies || '',
        medical_conditions: patientData?.medical_conditions || '',
    });

    const { data: avatarData, setData: setAvatarData, post: postAvatar, processing: processingAvatar } = useForm({
        avatar: null as File | null,
    });

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setAvatarData('avatar', e.target.files[0]);
            // Submit immediately when a file is selected
            setTimeout(() => {
                const form = document.getElementById('avatar-form') as HTMLFormElement;
                if (form) form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
            }, 100);
        }
    };

    const submitAvatar = (e: React.FormEvent) => {
        e.preventDefault();
        postAvatar(route('profile.avatar.update'), {
            preserveScroll: true,
        });
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(route('patient.profile.update'));
    };

    return (
        <SidebarLayout user={auth.user}>
            <Head title="My Medical Profile" />

            <div className="max-w-4xl mx-auto sm:px-6 lg:px-8 space-y-6">
                
                {/* Header Card */}
                <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                        <form id="avatar-form" onSubmit={submitAvatar} className="relative group cursor-pointer">
                            <input 
                                type="file" 
                                id="avatar-upload" 
                                className="hidden" 
                                accept="image/*"
                                onChange={handleAvatarChange}
                            />
                            <label htmlFor="avatar-upload" className="block relative cursor-pointer">
                                {auth.user.avatar ? (
                                    <img 
                                        src={`/storage/${auth.user.avatar}`} 
                                        alt={auth.user.name} 
                                        className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-slate-700 shadow-md"
                                    />
                                ) : (
                                    <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 text-3xl font-bold uppercase border-4 border-white dark:border-slate-700 shadow-md">
                                        {auth.user.name.charAt(0)}
                                    </div>
                                )}
                                
                                <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                </div>
                            </label>
                            {processingAvatar && (
                                <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 rounded-full flex items-center justify-center">
                                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            )}
                        </form>
                        <div className="text-center sm:text-left">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{auth.user.name}</h2>
                            <p className="text-gray-500 dark:text-gray-400 mt-1">{auth.user.email}</p>
                            <div className="flex gap-3 mt-3 justify-center sm:justify-start">
                                {patientData?.blood_group && (
                                    <span className="px-3 py-1 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-xs font-bold rounded-lg border border-rose-100 dark:border-rose-800/30">
                                        Type {patientData.blood_group}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <form onSubmit={submit} className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
                    <div className="p-6 sm:p-8 border-b border-gray-100 dark:border-slate-700">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                            Medical Information
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Update your medical profile so doctors are aware of your conditions and allergies before prescribing medication.
                        </p>
                    </div>

                    <div className="p-6 sm:p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Gender */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Gender</label>
                                <select
                                    value={data.gender}
                                    onChange={e => setData('gender', e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-gray-700 dark:text-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                >
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                                {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
                            </div>

                            {/* Blood Group */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Blood Group</label>
                                <select
                                    value={data.blood_group}
                                    onChange={e => setData('blood_group', e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-gray-700 dark:text-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                >
                                    <option value="">Select Blood Group</option>
                                    <option value="A+">A+</option>
                                    <option value="A-">A-</option>
                                    <option value="B+">B+</option>
                                    <option value="B-">B-</option>
                                    <option value="O+">O+</option>
                                    <option value="O-">O-</option>
                                    <option value="AB+">AB+</option>
                                    <option value="AB-">AB-</option>
                                </select>
                                {errors.blood_group && <p className="text-red-500 text-xs mt-1">{errors.blood_group}</p>}
                            </div>
                        </div>

                        {/* Allergies */}
                        <div>
                            <label className="block text-sm font-bold text-rose-700 dark:text-rose-400 mb-2 flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                                Allergies (Optional)
                            </label>
                            <textarea
                                value={data.allergies}
                                onChange={e => setData('allergies', e.target.value)}
                                rows={3}
                                placeholder="E.g. Peanuts, Penicillin, Dust..."
                                className="w-full bg-rose-50/30 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-900/30 rounded-xl px-4 py-3 text-gray-700 dark:text-slate-200 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all placeholder-gray-400 dark:placeholder-gray-500"
                            ></textarea>
                            {errors.allergies && <p className="text-red-500 text-xs mt-1">{errors.allergies}</p>}
                        </div>

                        {/* Medical Conditions */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                Existing Medical Conditions (Optional)
                            </label>
                            <textarea
                                value={data.medical_conditions}
                                onChange={e => setData('medical_conditions', e.target.value)}
                                rows={3}
                                placeholder="E.g. Asthma, Diabetes, Hypertension..."
                                className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-gray-700 dark:text-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder-gray-400 dark:placeholder-gray-500"
                            ></textarea>
                            {errors.medical_conditions && <p className="text-red-500 text-xs mt-1">{errors.medical_conditions}</p>}
                        </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-slate-800/80 p-6 sm:px-8 border-t border-gray-100 dark:border-slate-700 flex items-center justify-between">
                        <div>
                            {recentlySuccessful && (
                                <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                    Saved successfully!
                                </span>
                            )}
                        </div>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50"
                        >
                            {processing ? 'Saving...' : 'Save Profile'}
                        </button>
                    </div>
                </form>

            </div>
        </SidebarLayout>
    );
}
