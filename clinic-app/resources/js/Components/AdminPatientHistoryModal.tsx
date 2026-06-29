import React, { useState, useEffect } from 'react';
import Modal from '@/Components/Modal';
import PatientProfileCard from '@/Components/PatientProfileCard';
import { formatTime12Hour } from '@/Utils/time';

export default function AdminPatientHistoryModal({ 
    show, 
    onClose, 
    patient 
}: { 
    show: boolean; 
    onClose: () => void; 
    patient: any;
}) {
    const [internalPatient, setInternalPatient] = useState<any>(null);
    const [expandedApt, setExpandedApt] = useState<number | null>(null);

    useEffect(() => {
        if (patient) {
            setInternalPatient(patient);
        }
    }, [patient]);

    if (!internalPatient) return null;

    // Sort appointments: newest first
    const sortedAppointments = internalPatient.appointments ? [...internalPatient.appointments].sort((a: any, b: any) => {
        const dateA = new Date(a.date + 'T' + (a.schedule?.time || '00:00:00')).getTime();
        const dateB = new Date(b.date + 'T' + (b.schedule?.time || '00:00:00')).getTime();
        return dateB - dateA;
    }) : [];

    return (
        <Modal show={show} onClose={onClose} maxWidth="5xl">
            <div className="relative max-h-[90vh] flex flex-col bg-white dark:bg-slate-800 rounded-2xl overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-white dark:from-slate-800 to-transparent z-10 pointer-events-none"></div>
                
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-rose-500 transition-all duration-300 hover:rotate-90 hover:scale-110 active:scale-95 bg-gray-50 hover:bg-rose-50 dark:bg-slate-700/50 dark:hover:bg-rose-900/30 p-1.5 rounded-full shadow-sm z-20"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>

                <div className="flex flex-col lg:flex-row h-[85vh] overflow-hidden">
                    {/* Left side: Profile */}
                    <div className="w-full lg:w-5/12 border-r border-gray-100 dark:border-slate-700 overflow-y-auto custom-scrollbar bg-gray-50/50 dark:bg-slate-900/20">
                        <PatientProfileCard patient={internalPatient} variant="split" />
                    </div>

                    {/* Right side: History */}
                    <div className="w-full lg:w-7/12 flex flex-col h-full bg-white dark:bg-slate-800">
                        <div className="p-6 border-b border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 z-10 sticky top-0 shrink-0">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Appointment History</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Full record of patient consultations</p>
                        </div>
                        
                        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-4">
                            {sortedAppointments.length === 0 ? (
                                <div className="text-center py-12 flex flex-col items-center justify-center">
                                    <div className="h-16 w-16 bg-gray-50 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
                                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
                                    </div>
                                    <p className="text-gray-500 dark:text-gray-400 font-medium">No appointments found for this patient.</p>
                                </div>
                            ) : (
                                sortedAppointments.map((apt: any) => (
                                    <div key={apt.id} className="bg-gray-50/50 dark:bg-slate-700/30 rounded-2xl p-5 border border-gray-100 dark:border-slate-700 flex flex-col gap-4">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div className="flex items-center space-x-4">
                                                <div className="h-12 w-12 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl flex-shrink-0">
                                                    {apt.schedule?.doctor?.user?.avatar ? (
                                                        <img 
                                                            src={`/storage/${apt.schedule.doctor.user.avatar}`} 
                                                            alt={apt.schedule.doctor.user.name} 
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        apt.schedule?.doctor?.user?.name?.charAt(0) || 'D'
                                                    )}
                                                </div>
                                                <div>
                                                    <h4 className="text-base font-bold text-gray-900 dark:text-white">
                                                        Dr. {apt.schedule?.doctor?.user?.name || 'Unknown'}
                                                    </h4>
                                                    <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mb-1">
                                                        {apt.schedule?.doctor?.specialty?.name || 'Specialty'}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                                        {new Date(apt.date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })} at {formatTime12Hour(apt.schedule?.time)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex flex-row items-center gap-2">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-black border ${
                                                    apt.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200/50 dark:bg-amber-900/30 dark:text-amber-400' :
                                                    apt.status === 'confirmed' ? 'bg-blue-50 text-blue-700 border-blue-200/50 dark:bg-blue-900/30 dark:text-blue-400' :
                                                    apt.status === 'rejected' ? 'bg-rose-50 text-rose-700 border-rose-200/50 dark:bg-rose-900/30 dark:text-rose-400' :
                                                    apt.status === 'in_progress' ? 'bg-indigo-50 text-indigo-700 border-indigo-200/50 dark:bg-indigo-900/30 dark:text-indigo-400' :
                                                    'bg-emerald-50 text-emerald-700 border-emerald-200/50 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                }`}>
                                                    {apt.status ? apt.status.charAt(0).toUpperCase() + apt.status.slice(1).replace('_', ' ') : 'Pending'}
                                                </span>
                                                {apt.diagnosis && (
                                                    <button 
                                                        onClick={() => setExpandedApt(expandedApt === apt.id ? null : apt.id)}
                                                        title={expandedApt === apt.id ? "Hide EHR Note" : "Read EHR Note"}
                                                        className={`inline-flex items-center justify-center w-8 h-8 rounded-lg border transition-colors shadow-sm ${
                                                            expandedApt === apt.id 
                                                                ? 'bg-teal-600 text-white border-teal-700' 
                                                                : 'bg-teal-50 text-teal-700 border-teal-200/50 dark:bg-teal-900/30 dark:text-teal-400 dark:border-teal-800 hover:bg-teal-100 dark:hover:bg-teal-800/50'
                                                        }`}
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        {expandedApt === apt.id && apt.diagnosis && (
                                            <div className="mt-2 p-5 bg-white dark:bg-slate-800 rounded-xl border border-teal-100 dark:border-teal-900/30 shadow-sm text-sm transition-all duration-300">
                                                <div className="mb-4">
                                                    <span className="font-bold text-teal-800 dark:text-teal-300 uppercase tracking-widest text-[10px] bg-teal-50 dark:bg-teal-900/50 px-2 py-1 rounded">Diagnosis</span>
                                                    <p className="text-gray-800 dark:text-gray-200 mt-2 whitespace-pre-wrap font-medium">{apt.diagnosis}</p>
                                                </div>
                                                {apt.prescription && (
                                                    <div>
                                                        <span className="font-bold text-blue-800 dark:text-blue-300 uppercase tracking-widest text-[10px] bg-blue-50 dark:bg-blue-900/50 px-2 py-1 rounded">Prescription</span>
                                                        <p className="text-gray-800 dark:text-gray-200 mt-2 whitespace-pre-wrap font-medium">{apt.prescription}</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
