import { Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function GuestLayout({ children, title, description }: any) {
    const [isDarkMode, setIsDarkMode] = useState(() => {
        if (typeof window !== 'undefined') {
            return JSON.parse(localStorage.getItem('darkMode') || 'false');
        }
        return false;
    });

    useEffect(() => {
        localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        document.documentElement.classList.remove('lenis', 'lenis-smooth', 'lenis-scrolling', 'lenis-stopped');
    }, [isDarkMode]);

    return (
        <div className="min-h-screen flex items-center justify-center relative bg-slate-50 dark:bg-slate-900 transition-colors duration-300 selection:bg-teal-500 selection:text-white font-sans">
            
            {/* Animated Mesh Gradient Background Elements */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-teal-300/40 rounded-full mix-blend-multiply filter blur-3xl md:blur-[80px] opacity-70 animate-blob"></div>
                <div className="absolute top-[20%] right-[-10%] w-[35vw] h-[35vw] bg-blue-400/40 rounded-full mix-blend-multiply filter blur-3xl md:blur-[80px] opacity-70 animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-[-20%] left-[20%] w-[45vw] h-[45vw] bg-indigo-300/40 rounded-full mix-blend-multiply filter blur-3xl md:blur-[80px] opacity-70 animate-blob animation-delay-4000"></div>
                
                {/* Subtle Grid Pattern Overlay */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMCwgMCwgMCwgMC4wNSkiLz48L3N2Zz4=')] opacity-50 dark:opacity-20"></div>
            </div>

            <div className="relative z-10 w-full max-w-lg px-4 sm:px-6 py-12 flex flex-col items-center">
                
                {/* Dark Mode Toggle */}
                <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
                    <button
                        onClick={() => setIsDarkMode(!isDarkMode)}
                        className="p-2.5 rounded-full bg-white/50 dark:bg-slate-800/50 backdrop-blur-md text-slate-500 hover:bg-white dark:text-slate-400 dark:hover:bg-slate-800 shadow-sm border border-slate-200/50 dark:border-slate-700/50 transition-all focus:outline-none hover:scale-110"
                        aria-label="Toggle Dark Mode"
                    >
                        {isDarkMode ? (
                            <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                        ) : (
                            <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
                        )}
                    </button>
                </div>

                {/* Logo & Header */}
                <div className="text-center mb-8 flex flex-col items-center w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <Link href="/" className="flex items-center gap-3 group mb-6 relative">
                        {/* Glow behind logo */}
                        <div className="absolute inset-0 bg-teal-400 blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 rounded-full"></div>
                        <div className="relative w-14 h-14 bg-gradient-to-tr from-teal-400 to-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-3xl shadow-lg shadow-teal-500/30 dark:shadow-teal-900/30 transform group-hover:rotate-[15deg] group-hover:scale-110 transition-all duration-500">
                            +
                        </div>
                        <span className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors duration-300">
                            JanjiCare
                        </span>
                    </Link>
                    
                    {title && <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{title}</h2>}
                    {description && <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-2 font-medium max-w-sm">{description}</p>}
                </div>

                {/* Premium Glassmorphic Card */}
                <div className="w-full bg-white/70 dark:bg-slate-800/80 backdrop-blur-2xl shadow-[0_8px_40px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_40px_rgb(0,0,0,0.4)] sm:rounded-[2rem] rounded-3xl border border-white/60 dark:border-slate-700/60 p-6 sm:p-10 transition-[box-shadow,background-color] duration-300 hover:shadow-[0_8px_50px_rgb(20,184,166,0.15)] dark:hover:shadow-[0_8px_50px_rgb(20,184,166,0.1)] hover:bg-white/80 dark:hover:bg-slate-800/90 animate-in fade-in zoom-in-95 duration-500">
                    {children}
                </div>
                
            </div>
            
        </div>
    );
}
