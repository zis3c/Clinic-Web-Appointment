import { useState, useEffect, useRef, ReactNode, lazy, Suspense } from 'react';
import { Link, usePage } from '@inertiajs/react';
import Toast from '@/Components/Toast';
import Modal from '@/Components/Modal';
import NotificationBell from '@/Components/NotificationBell';
import SessionTimeout from '@/Components/SessionTimeout';

const AIChatbot = lazy(() => import('@/Components/AIChatbot'));

export default function SidebarLayout({ user, header: _header, children }: { user: any, header?: ReactNode, children: ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile sidebar
    const [showLogoutModal, setShowLogoutModal] = useState(false); // Logout confirmation
    const [showMoreMenu, setShowMoreMenu] = useState(false); // More (...) menu
    const moreMenuRef = useRef<HTMLDivElement>(null);
    
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

    // Close more menu on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
                setShowMoreMenu(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Compute if the sidebar should appear collapsed (only applies to desktop)
    const isVisuallyCollapsed = isCollapsed && !sidebarOpen;

    // Navigation Links based on roles
    const navigation = {
        admin: [
            { name: 'Dashboard', href: route('admin.dashboard'), icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
            { name: 'Doctors', href: route('admin.doctors.index'), icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
            { name: 'Patients', href: route('admin.patients.index'), icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
            { name: 'Appointments', href: route('admin.appointments.index'), icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
            { name: 'Schedules', href: route('admin.schedules.index'), icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
            { name: 'Reports', href: route('admin.reports.index'), icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
            { name: 'Analytics', href: route('admin.analytics'), icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
            { name: 'Pharmacy', href: route('admin.pharmacy.index'), icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z' },
            { name: 'AI', href: route('admin.ai'), icon: 'M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z' },
            { name: 'Security', href: route('admin.security.index'), icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
        ],
        doctor: [
            { name: 'Dashboard', href: route('doctor.dashboard'), icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
            { name: 'My Appointments', href: route('doctor.appointments.index'), icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
            { name: 'My Schedule', href: route('doctor.schedules.index'), icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
            { name: 'Consultation History', href: route('doctor.history.index'), icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
            { name: 'Analytics', href: route('doctor.analytics'), icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
        ],
        patient: [
            { name: 'Dashboard', href: route('patient.dashboard'), icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
            { name: 'Doctors', href: route('patient.doctors.index'), icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
            { name: 'Book Appointment', href: route('patient.schedules.index'), icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
            { name: 'My Appointments', href: route('patient.appointments.index'), icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
            { name: 'Medical History', href: route('patient.history.index'), icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
        ]
    };

    const links = (navigation[role as keyof typeof navigation] || []) as Array<{ name: string; href: string; icon: string }>;

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-slate-950 font-sans antialiased text-gray-900 dark:text-slate-100 overflow-hidden transition-all duration-300">
            <SessionTimeout />
            
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
                    onClick={() => isVisuallyCollapsed && setIsCollapsed(false)}
                    className={`flex items-center h-20 border-b border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all duration-300 relative group ${isVisuallyCollapsed ? 'justify-center px-0 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800' : 'px-6'}`}
                >
                    <div className={`flex items-center w-full overflow-hidden whitespace-nowrap ${isVisuallyCollapsed ? 'justify-center' : 'gap-3'}`}>
                        <div className="relative flex items-center justify-center w-8 h-8 flex-shrink-0">
                            {/* The Logo (+) */}
                            <div className={`absolute inset-0 bg-gradient-to-tr from-teal-400 to-blue-600 dark:from-teal-600 dark:to-blue-800 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm transition-opacity duration-300 pointer-events-none ${isVisuallyCollapsed ? 'opacity-100 group-hover:opacity-0' : 'opacity-100'}`}>
                                +
                            </div>
                            
                            {/* The Expand Icon */}
                            {isVisuallyCollapsed && (
                                <div className="absolute inset-0 flex items-center justify-center text-gray-400 group-hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                    <svg className="w-5 h-5 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14v-14" />
                                    </svg>
                                </div>
                            )}
                        </div>
                        <span className={`text-xl font-extrabold tracking-tight text-gray-900 dark:text-white truncate transition-all duration-300 ${isVisuallyCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100'}`}>
                            JanjiCare
                        </span>
                    </div>

                    {/* Collapse Toggle Button (Desktop Only) */}
                    <button 
                        onClick={(e) => { e.stopPropagation(); setIsCollapsed(true); }}
                        className={`hidden lg:flex absolute right-4 w-8 h-8 rounded-lg items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-all z-50 ${isVisuallyCollapsed ? 'opacity-0 pointer-events-none scale-0' : 'opacity-100 scale-100'}`}
                        title="Collapse Sidebar"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14v-14" />
                        </svg>
                    </button>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 overflow-y-auto overflow-x-hidden py-6 px-3 space-y-1.5 custom-scrollbar">
                    {links.map((item: { name: string; href: string; icon: string }) => {
                        const isActive = url.startsWith(new URL(item.href, window.location.origin).pathname);
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                title={isVisuallyCollapsed ? item.name : undefined}
                                className={`flex items-center rounded-xl transition-all duration-200 group font-medium border relative ${
                                    isActive 
                                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 shadow-sm border-blue-100 dark:border-blue-800/30' 
                                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white'
                                } ${isVisuallyCollapsed ? 'justify-center py-3 px-0' : 'gap-3 px-4 py-3'}`}
                            >
                                <svg className="w-5 h-5 flex-shrink-0 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon}></path>
                                </svg>
                                <span className={`whitespace-nowrap transition-opacity duration-300 ${isVisuallyCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100'}`}>
                                    {item.name}
                                </span>
                            </Link>
                        );
                    })}
                </nav>

                {/* User Info & Settings */}
                <div className="p-3 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
                    <Link 
                        href={route('profile.edit')}
                        title={isVisuallyCollapsed ? "Profile Settings" : undefined}
                        className={`flex items-center flex-1 min-w-0 rounded-xl transition-all duration-200 group hover:bg-gray-50 dark:hover:bg-slate-800 ${isVisuallyCollapsed ? 'justify-center py-2 px-0' : 'gap-3 px-3 py-2'}`}
                    >
                        <div className={`rounded-full overflow-hidden bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-700 dark:text-blue-400 font-bold group-hover:bg-blue-600 dark:group-hover:bg-blue-500 group-hover:text-white dark:group-hover:text-white transition-all flex-shrink-0 ${isVisuallyCollapsed ? 'w-10 h-10' : 'w-10 h-10'}`}>
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
                        <div className={`flex-1 min-w-0 transition-opacity duration-300 ${isVisuallyCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100'}`}>
                            <p className="text-sm font-bold text-gray-900 dark:text-white truncate group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-all">{user.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate capitalize">{role}</p>
                        </div>
                    </Link>

                    {!isVisuallyCollapsed && (
                        <div className="flex flex-shrink-0 items-center gap-1">
                            {/* More Menu (...) */}
                            <div className="relative" ref={moreMenuRef}>
                                <button 
                                    onClick={() => setShowMoreMenu(!showMoreMenu)}
                                    title="More options"
                                    className={`p-2 rounded-xl transition-all outline-none ${showMoreMenu ? 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-200' : 'text-gray-400 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800'}`}
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <circle cx="12" cy="6" r="1.5" />
                                        <circle cx="12" cy="12" r="1.5" />
                                        <circle cx="12" cy="18" r="1.5" />
                                    </svg>
                                </button>

                                {/* Popover */}
                                {showMoreMenu && (
                                    <div className="absolute bottom-full left-0 mb-2 w-48 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl shadow-2xl dark:shadow-black/50 border border-white/20 dark:border-slate-700/50 overflow-hidden z-[60] py-1.5 transform transition-all">
                                        {/* Theme Toggle */}
                                        <button 
                                            onClick={() => { setIsDarkMode(!isDarkMode); setShowMoreMenu(false); }}
                                            className="w-full flex items-center gap-3 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50/80 dark:hover:bg-slate-800/80 transition-all group"
                                        >
                                            <div className="p-1 rounded-lg bg-gray-100 dark:bg-slate-800 group-hover:bg-white dark:group-hover:bg-slate-700 transition-colors">
                                                {isDarkMode ? (
                                                    <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                                                ) : (
                                                    <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
                                                )}
                                            </div>
                                            <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
                                        </button>

                                        {/* Divider */}
                                        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-slate-700 to-transparent my-1"></div>

                                        {/* Logout */}
                                        <button 
                                            onClick={() => { setShowMoreMenu(false); setShowLogoutModal(true); }}
                                            className="w-full flex items-center gap-3 px-4 py-2 text-sm font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50/50 dark:hover:bg-rose-900/10 transition-all group"
                                        >
                                            <div className="p-1 rounded-lg bg-rose-50 dark:bg-rose-900/30 group-hover:bg-rose-100 dark:group-hover:bg-rose-900/50 transition-colors">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                                                </svg>
                                            </div>
                                            <span>Log Out</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                            
                            {/* Notification Bell — standalone */}
                            <NotificationBell compact />
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 relative w-full transition-all duration-300">
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="lg:hidden print:hidden fixed top-4 left-4 z-40 p-2 rounded-xl bg-white/50 dark:bg-slate-900/50 backdrop-blur border border-gray-100 dark:border-slate-800 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800 shadow-sm outline-none"
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
            
            <Suspense fallback={null}>
                <AIChatbot />
            </Suspense>

            {/* Logout Confirmation Modal */}
            <Modal show={showLogoutModal} onClose={() => setShowLogoutModal(false)} maxWidth="sm">
                <div className="p-8">
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
