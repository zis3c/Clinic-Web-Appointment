import { useState } from 'react';
import SidebarLayout from '@/Layouts/SidebarLayout';
import { Head, Link } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import LogoutOtherBrowserSessionsForm from './Partials/LogoutOtherBrowserSessionsForm';

export default function Edit({ auth, mustVerifyEmail, status, sessions = [] }: any) {
    const [activeTab, setActiveTab] = useState('profile');

    const tabs = [
        { id: 'profile', name: 'Profile Information', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
        { id: 'security', name: 'Security & Password', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
        { id: 'logout', name: 'Active Sessions', icon: 'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1' },
        { id: 'danger', name: 'Danger Zone', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
    ];

    return (
        <SidebarLayout
            user={auth.user}
            header={<h2 className="font-semibold text-2xl text-gray-800 dark:text-slate-100 leading-tight">Account Settings</h2>}
        >
            <Head title="Profile Settings" />

            {/* Unscrollable height container */}
            <div className="h-[calc(100vh-4rem)] lg:h-[calc(100vh-4rem)] min-h-[600px] w-full flex flex-col md:flex-row bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden max-w-7xl mx-auto transition-colors">
                
                {/* Left Side: Settings Navigation Menu */}
                <div className="w-full md:w-80 bg-gray-50 dark:bg-slate-900/50 border-r border-gray-200 dark:border-slate-700 flex flex-col">
                    <div className="p-6 pb-2">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Settings</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your account preferences and security.</p>
                    </div>
                    <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-xl transition-all duration-200 font-medium border ${
                                    activeTab === tab.id 
                                    ? 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-400 shadow-sm border-gray-200 dark:border-slate-600' 
                                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:bg-white/60 dark:hover:bg-slate-800/60 hover:text-gray-900 dark:hover:text-slate-200'
                                }`}
                            >
                                <svg className={`w-5 h-5 ${activeTab === tab.id ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={tab.icon}></path>
                                </svg>
                                {tab.name}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Right Side: Active Settings Pane */}
                <div className="flex-1 bg-white dark:bg-slate-800 overflow-y-auto transition-colors">
                    <div className="p-8 lg:p-12 max-w-3xl">
                        
                        {/* Profile Tab */}
                        {activeTab === 'profile' && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Profile Information</h3>
                                <UpdateProfileInformationForm
                                    mustVerifyEmail={mustVerifyEmail}
                                    status={status}
                                />
                            </div>
                        )}

                        {/* Security Tab */}
                        {activeTab === 'security' && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Security & Password</h3>
                                <UpdatePasswordForm />
                            </div>
                        )}

                        {/* Logout Tab */}
                        {activeTab === 'logout' && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                <LogoutOtherBrowserSessionsForm sessions={sessions} className="max-w-xl" />
                            </div>
                        )}

                        {/* Danger Zone Tab */}
                        {activeTab === 'danger' && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Danger Zone</h3>
                                <DeleteUserForm />
                            </div>
                        )}

                    </div>
                </div>

            </div>
        </SidebarLayout>
    );
}
