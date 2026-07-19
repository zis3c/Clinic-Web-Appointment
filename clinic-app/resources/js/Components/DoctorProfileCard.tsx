import React from 'react';

export default function DoctorProfileCard({ 
    doctor, 
    onClose, 
    variant = 'modal' 
}: { 
    doctor: any, 
    onClose?: () => void,
    variant?: 'modal' | 'split'
}) {
    if (!doctor) return null;

    return (
        <div className={`flex flex-col h-full relative ${variant === 'split' ? 'p-4 sm:p-6 lg:p-8' : ''}`}>
            {variant === 'modal' ? (
                <div className="flex items-center justify-between sticky top-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md z-10 px-8 py-6 border-b border-gray-100 dark:border-slate-700">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Doctor Details</h3>
                    {onClose && (
                        <button onClick={onClose} className="text-gray-400 hover:text-rose-500 transition-all duration-300 bg-gray-50 dark:bg-slate-700 hover:bg-rose-50 dark:hover:bg-rose-900/30 p-1.5 rounded-full shadow-sm outline-none outline-none focus:ring-0 active:outline-none">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    )}
                </div>
            ) : (
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Doctor Details</h3>
                        <p className="text-blue-600 dark:text-blue-400 font-semibold mt-1 flex items-center">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                            Professional Profile
                        </p>
                    </div>
                    {onClose && (
                        <button 
                            onClick={onClose} 
                            className="flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 px-4 py-2 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 border border-gray-200 dark:border-slate-700 font-bold text-sm outline-none outline-none focus:ring-0 active:outline-none"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                            Back
                        </button>
                    )}
                </div>
            )}
            
            <div className={`${variant === 'modal' ? 'px-8 pb-8 pt-4' : ''} flex-1`}>
                <div className="bg-white dark:bg-slate-900/50 rounded-2xl p-6 border border-gray-100 dark:border-slate-700 shadow-sm space-y-4 h-full">
                    <div className="flex items-center gap-4 border-b border-gray-100 dark:border-slate-700 pb-4 mb-4">
                        <div className="h-16 w-16 shrink-0 rounded-full overflow-hidden bg-gradient-to-tr from-teal-400 to-blue-600 flex items-center justify-center text-white font-bold text-2xl shadow-sm">
                            {doctor.user?.avatar ? (
                                <img 
                                    src={`/storage/${doctor.user.avatar}`} 
                                    alt={doctor.user.name} 
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                doctor.user?.name?.charAt(0) || '?'
                            )}
                        </div>
                        <div>
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white">Dr. {doctor.user?.name || 'Unknown Doctor'}</h4>
                            <p className="text-sm text-blue-600 dark:text-blue-400 font-semibold">{doctor.specialty?.name || 'Medical Specialist'}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="col-span-2">
                            <p className="text-gray-500 dark:text-gray-400 font-medium mb-1">Email Address</p>
                            {doctor.user?.email ? (
                                <a 
                                    href={`mailto:${doctor.user.email}`}
                                    className="font-bold text-gray-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
                                >
                                    {doctor.user.email}
                                </a>
                            ) : (
                                <p className="font-bold text-gray-900 dark:text-slate-100">Not provided</p>
                            )}
                        </div>

                        <div>
                            <p className="text-gray-500 dark:text-gray-400 font-medium mb-1">Phone Number</p>
                            {doctor.tel ? (
                                <a 
                                    href={`https://wa.me/${doctor.tel.replace(/\D/g, '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center font-bold text-gray-900 dark:text-slate-100 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all group"
                                    title="Chat on WhatsApp"
                                >
                                    {doctor.tel}
                                    <svg className="w-3.5 h-3.5 ml-1.5 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                                </a>
                            ) : (
                                <p className="font-bold text-gray-900 dark:text-slate-100">Not provided</p>
                            )}
                        </div>

                        <div>
                            <p className="text-gray-500 dark:text-gray-400 font-medium mb-1">National ID (NIC)</p>
                            <p className="font-bold text-gray-900 dark:text-slate-100">{doctor.nic || 'Not provided'}</p>
                        </div>

                        <div className="col-span-2 pt-4 border-t border-gray-50 dark:border-slate-700 mt-2">
                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3.5 border border-blue-100 dark:border-blue-800/40 flex items-start gap-3">
                                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                                </svg>
                                <div>
                                    <h5 className="text-xs font-bold text-blue-800 dark:text-blue-300 capitalize tracking-wider">Verified Medical Staff</h5>
                                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5 leading-relaxed">
                                        This doctor is fully registered and verified under the JanjiCare medical framework.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

