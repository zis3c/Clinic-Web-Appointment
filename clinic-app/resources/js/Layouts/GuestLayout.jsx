import { Link } from '@inertiajs/react';

export default function GuestLayout({ children, title, description }) {
    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gray-50 selection:bg-teal-500 selection:text-white">
            {/* Background elements */}
            <div className="absolute top-0 -translate-y-12 translate-x-1/3 opacity-30 filter blur-3xl pointer-events-none">
                <div className="w-96 h-96 bg-teal-400 rounded-full mix-blend-multiply"></div>
            </div>
            <div className="absolute bottom-0 translate-y-1/4 -translate-x-1/2 opacity-30 filter blur-3xl pointer-events-none">
                <div className="w-[30rem] h-[30rem] bg-blue-500 rounded-full mix-blend-multiply"></div>
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20 filter blur-3xl pointer-events-none">
                <div className="w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply"></div>
            </div>

            <div className="relative z-10 w-full max-w-lg px-6 py-12">
                <div className="text-center mb-8 flex flex-col items-center">
                    <Link href="/" className="flex items-center gap-2 group mb-6">
                        <div className="w-12 h-12 bg-gradient-to-tr from-teal-400 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-3xl shadow-lg transform group-hover:rotate-12 transition-transform duration-300">
                            +
                        </div>
                        <span className="text-3xl font-extrabold tracking-tight text-gray-900 group-hover:text-blue-600 transition-colors">
                            JanjiCare
                        </span>
                    </Link>
                    {title && <h2 className="text-2xl font-bold text-gray-800">{title}</h2>}
                    {description && <p className="text-sm text-gray-500 mt-2">{description}</p>}
                </div>

                <div className="bg-white/80 backdrop-blur-xl overflow-hidden shadow-2xl sm:rounded-3xl border border-white p-8 transition-all hover:shadow-teal-500/10 hover:border-teal-100">
                    {children}
                </div>
            </div>
        </div>
    );
}
