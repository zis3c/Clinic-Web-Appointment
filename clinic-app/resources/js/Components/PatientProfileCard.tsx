import React from 'react';

export default function PatientProfileCard({ 
    patient, 
    onClose, 
    variant = 'modal' 
}: { 
    patient: any, 
    onClose?: () => void,
    variant?: 'modal' | 'split'
}) {
    if (!patient) return null;

    return (
        <div className={`flex flex-col h-full relative ${variant === 'split' ? 'p-4 sm:p-6 lg:p-8' : ''}`}>
            {variant === 'modal' ? (
                <div className="flex items-center justify-between sticky top-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md z-10 px-8 py-6 border-b border-gray-100 dark:border-slate-800">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Patient Details</h3>
                    {onClose && (
                        <button onClick={onClose} className="text-gray-400 dark:text-gray-500 hover:text-rose-500 dark:hover:text-rose-400 transition-all duration-300 bg-gray-50 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-900/30 p-1.5 rounded-full shadow-sm outline-none outline-none focus:ring-0 active:outline-none">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    )}
                </div>
            ) : (
                <div className="flex items-center justify-between mb-4 sm:mb-6 shrink-0">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Patient Details</h3>
                        <p className="text-blue-600 dark:text-blue-400 font-semibold mt-1 flex items-center">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                            Medical Profile
                        </p>
                    </div>
                    {onClose && (
                        <button 
                            onClick={onClose} 
                            className="flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 px-4 py-2 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 border border-gray-200 dark:border-slate-700 font-bold text-sm outline-none outline-none focus:ring-0 active:outline-none"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                            Back
                        </button>
                    )}
                </div>
            )}
            
            <div className={`${variant === 'modal' ? 'px-8 pb-8 pt-4' : ''} flex-1 flex flex-col min-h-0`}>
                <div className="bg-white dark:bg-slate-800 md:rounded-2xl p-4 md:p-6 md:border border-gray-100 dark:border-slate-700 shadow-sm flex-1 overflow-y-auto custom-scrollbar modal-scrollbar space-y-4 border-t md:border-t-0">
                        <div className="flex items-center gap-4 border-b border-gray-100 dark:border-slate-700 pb-4 mb-4">
                            {patient.user?.avatar ? (
                                <img 
                                    src={`/storage/${patient.user.avatar}`} 
                                    alt={patient.user.name} 
                                    className="h-16 w-16 shrink-0 rounded-full object-cover border-2 border-white dark:border-slate-700 shadow-sm"
                                />
                            ) : (
                                <div className="h-16 w-16 shrink-0 rounded-full bg-gradient-to-tr from-teal-400 to-blue-600 flex items-center justify-center text-white font-bold text-2xl shadow-sm">
                                    {patient.user?.name?.charAt(0) || '?'}
                                </div>
                            )}
                            <div>
                                <h4 className="text-xl font-bold text-gray-900 dark:text-white">{patient.user?.name || 'Unknown Patient'}</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{patient.user?.email || 'No email'}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-gray-500 dark:text-gray-400 font-medium mb-1">Phone Number</p>
                                {patient.tel ? (
                                    <a 
                                        href={`https://wa.me/${patient.tel.replace(/\D/g, '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center font-bold text-gray-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-all group"
                                        title="Chat on WhatsApp"
                                    >
                                        {patient.tel}
                                        <svg className="w-3.5 h-3.5 ml-1.5 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                                    </a>
                                ) : (
                                    <p className="font-bold text-gray-900 dark:text-white">Not provided</p>
                                )}
                            </div>
                            <div>
                                <p className="text-gray-500 dark:text-gray-400 font-medium mb-1">Gender</p>
                                <p className="font-bold text-gray-900 dark:text-white capitalize">{patient.gender || 'Not specified'}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 dark:text-gray-400 font-medium mb-1">Blood Group</p>
                                <p className="font-bold text-gray-900 dark:text-white">{patient.blood_group || 'Not specified'}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 dark:text-gray-400 font-medium mb-1">Date of Birth</p>
                                <p className="font-bold text-gray-900 dark:text-white">{patient.dob ? new Date(patient.dob).toLocaleDateString() : 'Not provided'}</p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-gray-500 dark:text-gray-400 font-medium mb-1">National ID (NIC)</p>
                                <p className="font-bold text-gray-900 dark:text-white">{patient.nic || 'Not provided'}</p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-gray-500 dark:text-gray-400 font-medium mb-1">Address</p>
                                <p className="font-bold text-gray-900 dark:text-white truncate" title={patient.address}>{patient.address || 'Not provided'}</p>
                            </div>
                            
                            {(patient.allergies || patient.medical_conditions) && (
                                <div className="col-span-2 pt-2 border-t border-gray-100 dark:border-slate-700 mt-1">
                                    <div className="flex flex-row gap-2 w-full">
                                        {patient.allergies && (
                                            <div className="bg-rose-50 dark:bg-rose-900/30 rounded-lg p-2 border border-rose-100 dark:border-rose-800/30 flex-1 min-w-0 flex items-center shadow-sm">
                                                <span className="text-[10px] font-bold capitalize tracking-wider text-rose-700 dark:text-rose-400 mr-2 shrink-0">Allergies:</span>
                                                <span className="text-xs font-bold text-rose-950 dark:text-rose-200 truncate">{patient.allergies}</span>
                                            </div>
                                        )}
                                        {patient.medical_conditions && (
                                            <div className="bg-rose-50 dark:bg-rose-900/30 rounded-lg p-2 border border-rose-100 dark:border-rose-800/30 flex-1 min-w-0 flex items-center shadow-sm">
                                                <span className="text-[10px] font-bold capitalize tracking-wider text-rose-700 dark:text-rose-400 mr-2 shrink-0">Conditions:</span>
                                                <span className="text-xs font-bold text-rose-950 dark:text-rose-200 truncate">{patient.medical_conditions}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
            </div>
        </div>
    );
}

