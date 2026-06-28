import { useState, useEffect, ReactNode } from 'react';
import { Link, usePage } from '@inertiajs/react';
import Toast from '@/Components/Toast';
import Modal from '@/Components/Modal';

export default function SidebarLayout({ user, header, children }: { user: any, header?: ReactNode, children: ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile sidebar
    const [showLogoutModal, setShowLogoutModal] = useState(false); // Logout confirmation
    
    // Desktop sidebar collapse state
    const [isCollapsed, setIsCollapsed] = useState(() => {
        // Retrieve saved state from localStorage if available
        const saved = localStorage.getItem('sidebarCollapsed');
        return saved ? JSON.parse(saved) : false;
    });

    // Dark Mode state
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const saved = localStorage.getItem('darkMode');
        if (saved !== null) {
            return JSON.parse(saved);
        }
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    useEffect(() => {
        localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);

    const { url } = usePage();
    const role = user.role;
    
    // Save collapse state to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('sidebarCollapsed', JSON.stringify(isCollapsed));
    }, [isCollapsed]);

    // Navigation Links based on roles
    const navigation = {
        admin: [
            { name: 'Dashboard', href: route('admin.dashboard'), icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
            { name: 'Doctors', href: route('admin.doctors.index'), icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
            { name: 'Patients', href: route('admin.patients.index'), icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
            { name: 'Appointments', href: route('admin.appointments.index'), icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
            { name: 'Schedules', href: route('admin.schedules.index'), icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
            { name: 'Reports', href: route('admin.reports.index'), icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
        ],
        doctor: [
            { name: 'Dashboard', href: route('doctor.dashboard'), icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
            { name: 'My Appointments', href: route('doctor.appointments.index'), icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
            { name: 'My Schedule', href: route('doctor.schedules.index'), icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
        ],
        patient: [
            { name: 'Dashboard', href: route('patient.dashboard'), icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
            { name: 'Doctors', href: route('patient.doctors.index'), icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
            { name: 'Book Appointment', href: route('patient.schedules.index'), icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
            { name: 'My Appointments', href: route('patient.appointments.index'), icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
        ]
    };

    const links = (navigation[role as keyof typeof navigation] || []) as Array<{ name: string; href: string; icon: string }>;

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-slate-950 font-sans antialiased text-gray-900 dark:text-slate-100 overflow-hidden transition-colors duration-300">
            {/* Mobile Sidebar Overlay */}
            <div 
                className={`fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
                onClick={() => setSidebarOpen(false)}
            />

            {/* Sidebar */}
            <div 
                className={`fixed inset-y-0 left-0 z-50 bg-white dark:bg-slate-900 border-r border-gray-100 dark:border-slate-800 shadow-lg transform transition-all duration-300 ease-in-out flex flex-col 
                ${sidebarOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0 lg:static lg:inset-auto'} 
                ${isCollapsed && !sidebarOpen ? 'lg:w-20' : 'lg:w-72'}`}
            >
                {/* Logo Area */}
                <div 
                    onClick={() => isCollapsed && setIsCollapsed(false)}
                    className={`flex items-center h-20 border-b border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all duration-300 relative ${isCollapsed ? 'justify-center px-0 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800' : 'px-6'}`}
                    title={isCollapsed ? "Expand Sidebar" : undefined}
                >
                    <div className={`flex items-center w-full overflow-hidden whitespace-nowrap ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
                        <div className={`bg-gradient-to-tr from-teal-400 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm flex-shrink-0 transition-all duration-300 ${isCollapsed ? 'w-8 h-8' : 'w-8 h-8'}`}>
                            +
                        </div>
                        <span className={`text-xl font-extrabold tracking-tight text-gray-900 dark:text-white truncate transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100'}`}>
                            JanjiCare
                        </span>
                    </div>

                    {/* Collapse Toggle Button (Desktop Only) */}
                    <button 
                        onClick={(e) => { e.stopPropagation(); setIsCollapsed(true); }}
                        className={`hidden lg:flex absolute right-4 w-8 h-8 rounded-lg items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-all z-50 ${isCollapsed ? 'opacity-0 pointer-events-none scale-0' : 'opacity-100 scale-100'}`}
                        title="Collapse Sidebar"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14v-14" />
                        </svg>
                    </button>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 overflow-y-auto overflow-x-hidden py-6 px-3 space-y-1.5 scrollbar-hide">
                    {links.map((item: { name: string; href: string; icon: string }) => {
                        const isActive = url.startsWith(new URL(item.href, window.location.origin).pathname);
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                title={isCollapsed ? item.name : undefined}
                                className={`flex items-center rounded-xl transition-all duration-200 group font-medium border relative ${
                                    isActive 
                                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 shadow-sm border-blue-100 dark:border-blue-800/30' 
                                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white'
                                } ${isCollapsed ? 'justify-center py-3 px-0' : 'gap-3 px-4 py-3'}`}
                            >
                                <svg className={`w-5 h-5 flex-shrink-0 transition-colors ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon}></path>
                                </svg>
                                <span className={`whitespace-nowrap transition-opacity duration-300 ${isCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100'}`}>
                                    {item.name}
                                </span>
                            </Link>
                        );
                    })}
                </nav>

                {/* User Info & Settings */}
                <div className="p-3 border-t border-gray-100 dark:border-slate-800 overflow-hidden flex items-center justify-between">
                    <Link 
                        href={route('profile.edit')}
                        title={isCollapsed ? "Profile Settings" : undefined}
                        className={`flex items-center flex-1 min-w-0 rounded-xl transition-all duration-200 group hover:bg-gray-50 dark:hover:bg-slate-800 ${isCollapsed ? 'justify-center py-2 px-0' : 'gap-3 px-3 py-2'}`}
                    >
                        <div className={`rounded-full overflow-hidden bg-blue-100 flex items-center justify-center text-blue-700 font-bold group-hover:bg-blue-600 group-hover:text-white transition-all flex-shrink-0 ${isCollapsed ? 'w-10 h-10' : 'w-10 h-10'}`}>
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
                        <div className={`flex-1 min-w-0 transition-opacity duration-300 ${isCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100'}`}>
                            <p className="text-sm font-bold text-gray-900 dark:text-white truncate group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">{user.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate capitalize">{role}</p>
                        </div>
                    </Link>

                    {!isCollapsed && (
                        <div className="flex flex-shrink-0 items-center gap-1">
                            <button 
                                onClick={() => setIsDarkMode(!isDarkMode)}
                                title="Toggle Dark Mode"
                                className="p-2 rounded-xl text-gray-400 dark:text-gray-300 hover:text-yellow-500 dark:hover:text-blue-400 hover:bg-yellow-50 dark:hover:bg-blue-900/30 transition-colors focus:outline-none"
                            >
                                {isDarkMode ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                                )}
                            </button>
                            <button 
                                onClick={() => setShowLogoutModal(true)}
                                title="Log Out"
                                className="p-2 rounded-xl text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors focus:outline-none"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                                </svg>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 relative w-full transition-colors duration-300">
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="lg:hidden fixed top-4 left-4 z-40 p-2 rounded-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur border border-gray-100 dark:border-slate-800 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800 shadow-sm focus:outline-none"
                    aria-label="Open navigation"
                >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pt-16 sm:pt-20 z-10 w-full">
                    {children}
                </main>
            </div>
            
            <Toast />

            {/* Logout Confirmation Modal */}
            <Modal show={showLogoutModal} onClose={() => setShowLogoutModal(false)} maxWidth="sm">
                <div className="p-8 dark:bg-slate-900">
                    <div className="flex items-center justify-center w-16 h-16 mx-auto bg-rose-50 dark:bg-rose-900/20 rounded-2xl mb-6 shadow-inner">
                        <svg className="w-8 h-8 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-3">Ready to leave?</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-8 leading-relaxed">
                        Are you sure you want to log out of your account? You will need to enter your credentials to access the clinic portal again.
                    </p>
                    <div className="flex gap-3">
                        <button 
                            onClick={() => setShowLogoutModal(false)}
                            className="flex-1 px-4 py-3 bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 font-bold rounded-xl transition-all shadow-sm"
                        >
                            Cancel
                        </button>
                        <Link 
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-bold rounded-xl transition-all text-center shadow-md hover:shadow-lg hover:-translate-y-0.5"
                        >
                            Log Out
                        </Link>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
