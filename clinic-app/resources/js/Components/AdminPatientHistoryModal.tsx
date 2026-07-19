import React, { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
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
    const [expandedApt, setExpandedApt] = useState<number | null>(null);

    // Sort appointments: newest first
    const sortedAppointments = patient?.appointments ? [...patient.appointments].sort((a: any, b: any) => {
        const dateA = new Date(a.date + 'T' + (a.schedule?.time || '00:00:00')).getTime();
        const dateB = new Date(b.date + 'T' + (b.schedule?.time || '00:00:00')).getTime();
        return dateB - dateA;
    }) : [];

    return (
        <Transition show={show} as={Fragment} leave="duration-200">
            <Dialog as="div" className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm" />
                </Transition.Child>

                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0 translate-y-full sm:translate-y-0 sm:scale-95"
                    enterTo="opacity-100 translate-y-0 sm:scale-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                    leaveTo="opacity-0 translate-y-full sm:translate-y-0 sm:scale-95"
                >
                    <Dialog.Panel className="w-full h-[100dvh] sm:max-h-[90vh] sm:max-w-5xl flex flex-col bg-white dark:bg-slate-800 sm:rounded-2xl overflow-y-auto lg:overflow-hidden lg:h-[85vh] shadow-2xl relative">
                        <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-white dark:from-slate-800 to-transparent z-10 pointer-events-none hidden lg:block"></div>
                        
                        <button 
                            onClick={onClose}
                            className="absolute top-4 right-4 text-gray-400 hover:text-rose-500 transition-all duration-300 hover:rotate-90 hover:scale-110 active:scale-95 bg-gray-50 hover:bg-rose-50 dark:bg-slate-700/50 dark:hover:bg-rose-900/30 p-1.5 rounded-full shadow-sm z-[100]"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>

                        <div className="flex flex-col lg:flex-row flex-1 min-h-0 custom-scrollbar">
                            {/* Left side: Profile */}
                            <div className="w-full lg:w-5/12 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-slate-700 lg:overflow-y-auto custom-scrollbar bg-gray-50/50 dark:bg-slate-900/20 shrink-0">
                                <PatientProfileCard patient={patient} variant="split" />
                            </div>

                            {/* Right side: History */}
                            <div className="w-full lg:w-7/12 flex flex-col bg-white dark:bg-slate-800 flex-1 min-h-0">
                                <div className="p-5 sm:p-6 border-b border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 z-10 sticky top-0 shrink-0 shadow-sm lg:shadow-none">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Appointment History</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Full record of patient consultations</p>
                                </div>
                                
                                <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar flex-1 space-y-4">
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
                                                        <div className="h-12 w-12 rounded-full overflow-hidden bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xl flex-shrink-0">
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
                                                                className={`inline-flex items-center justify-center w-8 h-8 rounded-lg border transition-all shadow-sm ${
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
                                                            <span className="font-bold text-teal-800 dark:text-teal-300 capitalize tracking-widest text-[10px] bg-teal-50 dark:bg-teal-900/50 px-2 py-1 rounded">Diagnosis</span>
                                                            <p className="text-gray-800 dark:text-gray-200 mt-2 whitespace-pre-wrap font-medium">{apt.diagnosis}</p>
                                                        </div>
                                                        {apt.prescription && (
                                                            <div>
                                                                <span className="font-bold text-blue-800 dark:text-blue-300 capitalize tracking-widest text-[10px] bg-blue-50 dark:bg-blue-900/50 px-2 py-1 rounded">Prescription</span>
                                                                <p className="text-gray-800 dark:text-gray-200 mt-2 whitespace-pre-wrap font-medium">{apt.prescription}</p>
                                                            </div>
                                                        )}
                                                        {apt.prescription && (
                                                            <div className="mt-4 pt-4 border-t border-teal-100 dark:border-teal-900/30">
                                                                <a 
                                                                    href={route('prescriptions.pdf', apt.id)} 
                                                                    target="_blank"
                                                                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-bold rounded-lg shadow-sm hover:shadow-md transition-all"
                                                                >
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                                                    Download Prescription PDF
                                                                </a>
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
                    </Dialog.Panel>
                </Transition.Child>
            </Dialog>
        </Transition>
    );
}

