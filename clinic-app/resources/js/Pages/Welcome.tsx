import { Head, Link } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
import Lenis from 'lenis';

export default function Welcome({ auth }: any) {
    const lenisRef = useRef<Lenis | null>(null);

    useEffect(() => {
        const lenis = new Lenis({
            autoRaf: true,
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // standard liquid easing
        });
        
        lenisRef.current = lenis;

        return () => {
            lenis.destroy();
            lenisRef.current = null;
        };
    }, []);

    const scrollToFeatures = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        if (lenisRef.current) {
            lenisRef.current.scrollTo('#features', { offset: -80 }); // offset for navbar
        }
    };

    return (
        <>
            <Head title="Welcome to JanjiCare" />
            <div className="relative min-h-screen bg-gray-50 text-gray-900 selection:bg-teal-500 selection:text-white font-sans antialiased">
                
                {/* Navbar */}
                <nav className="fixed top-0 w-full z-50 backdrop-blur-md bg-white/70 border-b border-gray-200/50 transition-all duration-300">
                    <div className="flex justify-between items-center max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-tr from-teal-400 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm flex-shrink-0">
                            +
                        </div>
                        <span className="text-2xl font-extrabold tracking-tight text-gray-900">JanjiCare</span>
                    </div>
                    <div className="flex gap-4 items-center">
                        {auth.user ? (
                            <Link
                                href={route('dashboard')}
                                className="font-semibold text-gray-700 hover:text-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 rounded-lg px-3 py-2 transition-all"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={route('login')}
                                    className="font-semibold text-gray-700 hover:text-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 rounded-lg px-3 py-2 transition-all"
                                >
                                    Log in
                                </Link>
                                <Link
                                    href={route('register')}
                                    className="px-5 py-2.5 rounded-full font-bold bg-gray-900 text-white hover:bg-teal-600 hover:shadow-lg hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-all duration-300"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </div>
                    </div>
                </nav>

                {/* Hero Section */}
                <div className="relative pt-32 pb-20 sm:pt-40 sm:pb-24 lg:pb-32 overflow-hidden flex flex-col items-center justify-center min-h-screen text-center px-4">
                    
                    {/* Background decorations */}
                    <div className="absolute top-0 -translate-y-12 translate-x-1/3 opacity-20 filter blur-3xl pointer-events-none">
                        <div className="w-96 h-96 bg-teal-400 rounded-full mix-blend-multiply"></div>
                    </div>
                    <div className="absolute top-0 -translate-y-1/4 -translate-x-1/2 opacity-20 filter blur-3xl pointer-events-none">
                        <div className="w-[30rem] h-[30rem] bg-blue-500 rounded-full mix-blend-multiply"></div>
                    </div>

                    <div className="relative z-10 max-w-4xl mx-auto space-y-8">
                        <h1 className="text-6xl sm:text-7xl font-extrabold tracking-tight text-gray-900 drop-shadow-sm leading-tight">
                            Healthcare excellence, <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-blue-600">at your fingertips.</span>
                        </h1>
                        <p className="mt-6 text-xl sm:text-2xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                            Experience the future of medical appointments. Book seamlessly, manage your health history, and connect with top-tier specialists instantly.
                        </p>
                        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <Link
                                href={auth.user ? route('dashboard') : route('register')}
                                className="px-8 py-4 rounded-full font-bold text-lg bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-xl hover:shadow-teal-500/30 hover:scale-105 transition-all duration-300"
                            >
                                Book an Appointment
                            </Link>
                            <a
                                href="#features"
                                onClick={scrollToFeatures}
                                className="px-8 py-4 rounded-full font-bold text-lg bg-white text-gray-800 shadow-md border border-gray-100 hover:bg-gray-50 transition-colors"
                            >
                                Learn More
                            </a>
                        </div>
                    </div>
                </div>

                {/* Features Section */}
                <div id="features" className="py-24 bg-white relative z-10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid md:grid-cols-3 gap-12">
                            <div className="p-8 rounded-3xl bg-gray-50 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                                <div className="w-14 h-14 rounded-2xl bg-teal-100 flex items-center justify-center mb-6">
                                    <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                </div>
                                <h3 className="text-xl font-bold mb-3">Instant Booking</h3>
                                <p className="text-gray-600 leading-relaxed">Schedule appointments with your preferred doctors in just a few clicks. No waiting, no hassle.</p>
                            </div>
                            <div className="p-8 rounded-3xl bg-gray-50 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                                <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center mb-6">
                                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                                </div>
                                <h3 className="text-xl font-bold mb-3">Top Specialists</h3>
                                <p className="text-gray-600 leading-relaxed">Access a wide network of highly qualified medical professionals across 50+ specialties.</p>
                            </div>
                            <div className="p-8 rounded-3xl bg-gray-50 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                                <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center mb-6">
                                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                                </div>
                                <h3 className="text-xl font-bold mb-3">Secure Records</h3>
                                <p className="text-gray-600 leading-relaxed">Your health data is encrypted and securely stored. Access your appointment history anytime.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <footer className="bg-gray-900 text-gray-400 py-12 relative z-10 border-t border-gray-800">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid md:grid-cols-4 gap-8 mb-8">
                            <div className="col-span-2">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-8 h-8 bg-gradient-to-tr from-teal-400 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm">
                                        +
                                    </div>
                                    <span className="text-2xl font-extrabold tracking-tight text-white">JanjiCare</span>
                                </div>
                                <p className="text-sm max-w-sm">Modernizing clinical appointments. Connecting patients with the best specialists instantly.</p>
                            </div>
                            <div>
                                <h4 className="text-white font-bold mb-4">Legal</h4>
                                <ul className="space-y-2 text-sm">
                                    <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                                    <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="text-white font-bold mb-4">Contact</h4>
                                <ul className="space-y-2 text-sm">
                                    <li>support@janjicare.com</li>
                                    <li>1-800-JANJICARE</li>
                                </ul>
                            </div>
                        </div>
                        <div className="border-t border-gray-800 pt-8 text-sm text-center">
                            &copy; {new Date().getFullYear()} JanjiCare Systems. All rights reserved.
                        </div>
                    </div>
                </footer>

            </div>
        </>
    );
}
