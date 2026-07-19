import { Head, Link } from '@inertiajs/react';
import { useEffect, useRef, useState, lazy, Suspense } from 'react';
import Lenis from 'lenis';

const AIChatbot = lazy(() => import('@/Components/AIChatbot'));

export default function Welcome({ auth }: any) {
    const lenisRef = useRef<Lenis | null>(null);
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
    }, [isDarkMode]);

    useEffect(() => {
        const lenis = new Lenis({
            autoRaf: true,
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
        });
        lenisRef.current = lenis;
        return () => {
            lenis.destroy();
            lenisRef.current = null;
            document.documentElement.classList.remove('lenis', 'lenis-smooth', 'lenis-scrolling', 'lenis-stopped');
            // We don't remove dark class globally on unmount because the user might navigate to another dark-mode page.
        };
    }, []);

    const scrollToFeatures = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        if (lenisRef.current) {
            lenisRef.current.scrollTo('#features', { offset: -80 });
        }
    };

    return (
        <>
            <Head title="Welcome to JanjiCare" />
            <main className="relative min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white selection:bg-teal-500 selection:text-white font-sans overflow-x-hidden transition-colors duration-500">
                
                {/* Global Medical Cross Pattern Background */}
                <div className="fixed inset-0 pointer-events-none z-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTI4IDIwaDR2OGg4djRoLTh2OGgtNHYtOGgtOHYtNGg4di04eiIgZmlsbD0iIzBmNzY2ZSIgZmlsbC1vcGFjaXR5PSIwLjA1Ii8+PC9zdmc+')] dark:opacity-10"></div>

                {/* Navbar */}
                <nav className="fixed top-0 w-full z-50 backdrop-blur-xl bg-white/60 dark:bg-slate-900/60 border-b border-white/40 dark:border-slate-800/60 transition-all duration-300">
                    <div className="flex justify-between items-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <div className="flex items-center gap-2 group cursor-pointer">
                            <div className="w-9 h-9 bg-gradient-to-tr from-teal-400 to-blue-600 dark:from-teal-600 dark:to-blue-700 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-teal-500/20 transform group-hover:rotate-12 transition-all duration-300">
                                +
                            </div>
                            <span className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-teal-600 group-hover:to-blue-600 transition-all duration-300">
                                JanjiCare
                            </span>
                        </div>
                        <div className="flex gap-2 sm:gap-4 items-center">
                            <button
                                onClick={() => setIsDarkMode(!isDarkMode)}
                                className="p-2 rounded-full text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors focus:outline-none"
                                aria-label="Toggle Dark Mode"
                            >
                                {isDarkMode ? (
                                    <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                                ) : (
                                    <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
                                )}
                            </button>
                            {auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="px-5 py-2.5 rounded-full font-bold bg-slate-900 dark:bg-teal-500 text-white hover:bg-teal-600 dark:hover:bg-teal-400 hover:shadow-[0_4px_14px_0_rgb(20,184,166,0.39)] hover:-translate-y-0.5 transition-all duration-300"
                                >
                                    Go to Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={route('login')}
                                        className="font-semibold text-slate-600 hover:text-teal-600 dark:text-teal-400 dark:text-slate-300 dark:hover:text-teal-400 px-4 py-2 transition-all hidden sm:block"
                                    >
                                        Log in
                                    </Link>
                                    <Link
                                        href={route('register')}
                                        className="px-5 py-2.5 rounded-full font-bold bg-slate-900 dark:bg-teal-500 text-white hover:bg-teal-600 dark:hover:bg-teal-400 hover:shadow-[0_4px_14px_0_rgb(20,184,166,0.39)] hover:-translate-y-0.5 transition-all duration-300 text-sm sm:text-base"
                                    >
                                        Get Started
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </nav>

                {/* Hero Section */}
                <div className="relative pt-28 pb-12 sm:pt-40 sm:pb-24 lg:pb-32 flex flex-col items-center justify-center min-h-[100svh] text-center px-4">
                    
                    {/* Animated Glow Blobs */}
                    <div className="absolute top-1/4 left-1/4 -translate-x-1/2 opacity-30 filter blur-[100px] pointer-events-none animate-blob">
                        <div className="w-[40vw] h-[40vw] bg-teal-300 rounded-full mix-blend-multiply max-w-[500px] max-h-[500px]"></div>
                    </div>
                    <div className="absolute top-1/3 right-1/4 translate-x-1/4 opacity-30 filter blur-[100px] pointer-events-none animate-blob animation-delay-2000">
                        <div className="w-[30vw] h-[30vw] bg-blue-400 rounded-full mix-blend-multiply max-w-[400px] max-h-[400px]"></div>
                    </div>

                    <div className="relative z-10 max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">

                        <h1 className="text-5xl sm:text-7xl lg:text-[5.5rem] font-extrabold tracking-tight text-slate-900 dark:text-white drop-shadow-sm leading-[1.1]">
                            Healthcare excellence, <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 via-blue-500 to-indigo-600 animate-gradient-x">
                                at your fingertips.
                            </span>
                        </h1>
                        
                        <p className="mt-6 text-lg sm:text-2xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed font-medium">
                            Experience seamless medical appointments. Book instantly, manage your health history, and connect with top-tier specialists with zero friction.
                        </p>
                        
                        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <Link
                                href={auth.user ? route('dashboard') : route('register')}
                                className="w-full max-w-[280px] sm:max-w-none sm:w-auto px-6 py-3.5 sm:px-8 sm:py-4 rounded-full font-bold text-base sm:text-lg text-center bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-[0_8px_30px_rgb(20,184,166,0.3)] hover:shadow-[0_8px_30px_rgb(20,184,166,0.5)] hover:scale-105 transition-all duration-300"
                            >
                                Book an Appointment
                            </Link>
                            <a
                                href="#features"
                                onClick={scrollToFeatures}
                                className="w-full max-w-[280px] sm:max-w-none sm:w-auto px-6 py-3.5 sm:px-8 sm:py-4 rounded-full font-bold text-base sm:text-lg text-center bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 shadow-md border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                            >
                                Explore Features
                            </a>
                        </div>
                    </div>
                </div>

                {/* Features Section */}
                <div id="features" className="py-24 relative z-10 before:absolute before:inset-0 before:bg-white/60 dark:before:bg-slate-900/60 before:backdrop-blur-3xl before:-z-10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        
                        <div className="text-center max-w-3xl mx-auto mb-16">
                            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">Everything you need to manage your health</h2>
                            <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">JanjiCare is built to remove the friction from healthcare scheduling for both patients and medical professionals.</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="group p-8 rounded-[2rem] bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/20 dark:shadow-none hover:shadow-2xl hover:shadow-teal-500/10 hover:-translate-y-2 transition-all duration-500 relative overflow-hidden">

                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-100 to-teal-50 dark:from-teal-900/40 dark:to-teal-800/20 flex items-center justify-center mb-8 border border-teal-200/50 dark:border-teal-700/30 shadow-sm">
                                    <svg className="w-8 h-8 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                </div>
                                <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">Instant Booking</h3>
                                <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">Schedule appointments with your preferred doctors in just a few clicks. No waiting on hold, no endless back-and-forth.</p>
                            </div>

                            <div className="group p-8 rounded-[2rem] bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/20 dark:shadow-none hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-2 transition-all duration-500 relative overflow-hidden">

                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/40 dark:to-blue-800/20 flex items-center justify-center mb-8 border border-blue-200/50 dark:border-blue-700/30 shadow-sm">
                                    <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                                </div>
                                <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">Top Specialists</h3>
                                <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">Gain access to a wide network of highly qualified medical professionals across dozens of specialized fields.</p>
                            </div>

                            <div className="group p-8 rounded-[2rem] bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/20 dark:shadow-none hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-2 transition-all duration-500 relative overflow-hidden">

                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-100 to-indigo-50 dark:from-indigo-900/40 dark:to-indigo-800/20 flex items-center justify-center mb-8 border border-indigo-200/50 dark:border-indigo-700/30 shadow-sm">
                                    <svg className="w-8 h-8 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                                </div>
                                <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">Secure Records</h3>
                                <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">Your health data and digital prescriptions are encrypted and securely stored for instant access when you need them.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <footer className="bg-slate-950 text-slate-400 py-16 relative z-10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid md:grid-cols-4 gap-12 mb-12">
                            <div className="col-span-2">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 bg-gradient-to-tr from-teal-400 to-blue-600 dark:from-teal-600 dark:to-blue-700 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                                        +
                                    </div>
                                    <span className="text-2xl font-extrabold tracking-tight text-white">JanjiCare</span>
                                </div>
                                <p className="text-base max-w-sm leading-relaxed">Modernizing clinical appointments. Connecting patients with the best specialists instantly.</p>
                            </div>
                            <div>
                                <h4 className="text-white font-bold text-lg mb-6">Legal</h4>
                                <ul className="space-y-4 text-sm font-medium">
                                    <li><a href="#" className="hover:text-teal-400 transition-all">Privacy Policy</a></li>
                                    <li><a href="#" className="hover:text-teal-400 transition-all">Terms of Service</a></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="text-white font-bold text-lg mb-6">Contact</h4>
                                <ul className="space-y-4 text-sm font-medium">
                                    <li className="hover:text-teal-400 transition-all cursor-pointer">support@janjicare.com</li>
                                    <li className="hover:text-teal-400 transition-all cursor-pointer">1-800-JANJICARE</li>
                                </ul>
                            </div>
                        </div>
                        <div className="border-t border-slate-800 pt-8 text-sm text-center font-medium">
                            &copy; {new Date().getFullYear()} JanjiCare Systems. All rights reserved.
                        </div>
                    </div>
                </footer>

                <Suspense fallback={null}>
                    <AIChatbot isPublic={true} />
                </Suspense>
            </main>
        </>
    );
}
