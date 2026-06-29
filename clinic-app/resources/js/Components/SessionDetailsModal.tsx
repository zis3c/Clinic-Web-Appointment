import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { formatTime12Hour } from '../Utils/time';
import PatientProfileCard from '@/Components/PatientProfileCard';

export default function SessionDetailsModal({ selectedSession, onClose }: { selectedSession: any, onClose: () => void }) {
    const [internalSession, setInternalSession] = useState<any>(null);
    const [viewPatient, setViewPatient] = useState<any>(null);

    useEffect(() => {
        if (selectedSession) {
            setInternalSession(selectedSession);
        }
    }, [selectedSession]);
    return (
        <Transition appear show={!!selectedSession} as={Fragment}>
            <Dialog as="div" className="relative z-[100]" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="transform transition-all w-full flex justify-center pointer-events-none">
                                <div className={`pointer-events-auto overflow-hidden rounded-3xl bg-white dark:bg-slate-900 text-left align-middle shadow-2xl w-full max-h-[85vh] flex transition-[max-width,min-height] duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${viewPatient ? 'max-w-5xl min-h-[650px]' : 'max-w-2xl'}`}>
                                <div className={`p-8 max-h-[85vh] transition-[width,border-color] duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] relative flex flex-col ${viewPatient ? 'w-1/2 border-r border-gray-100 dark:border-slate-800' : 'w-full'}`}>
                                    <button 
                                        onClick={onClose}
                                        className="absolute top-4 right-4 text-gray-400 dark:text-gray-500 hover:text-rose-500 dark:hover:text-rose-400 transition-all duration-300 bg-gray-50 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-900/30 p-1.5 rounded-full shadow-sm z-20 outline-none focus:outline-none focus:ring-0 active:outline-none"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                                    </button>

                                {internalSession && (
                                    <>
                                        <div className="mb-6 shrink-0">
                                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{internalSession.title}</h3>
                                            <p className="text-blue-600 dark:text-blue-400 font-semibold mt-1 flex items-center">
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                                {new Date(internalSession.date).toLocaleDateString()} at {formatTime12Hour(internalSession.time)}
                                            </p>
                                        </div>

                                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-slate-700 shadow-sm flex-1 flex flex-col min-h-0">
                                            <h4 className="font-bold text-gray-800 dark:text-slate-200 mb-4 flex items-center justify-between shrink-0">
                                                Booked Patients
                                                <span className="bg-white dark:bg-slate-700 px-3 py-1 rounded-full text-xs border border-gray-200 dark:border-slate-600">
                                                    {internalSession.appointments?.length || 0} / {internalSession.number_of_patients} Capacity
                                                </span>
                                            </h4>
                                            
                                            {(!internalSession.appointments || internalSession.appointments.length === 0) ? (
                                                <div className="text-center py-6 text-gray-500 dark:text-gray-400 text-sm">
                                                    No patients have booked this session yet.
                                                </div>
                                            ) : (
                                                <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar modal-scrollbar flex-1">
                                                    {internalSession.appointments.map((apt: any) => (
                                                        <div 
                                                            key={apt.id} 
                                                            onClick={() => {
                                                                setViewPatient(apt.patient);
                                                            }}
                                                            className={`bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border flex justify-between items-center cursor-pointer transition-colors group ${viewPatient?.id === apt.patient?.id ? 'border-blue-400 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/30 ring-2 ring-blue-100 dark:ring-blue-900/50' : 'border-gray-100 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-slate-700 hover:border-blue-200 dark:hover:border-slate-600'}`}
                                                        >
                                                            <div>
                                                                <div className="font-bold text-gray-900 dark:text-white">{apt.patient?.user?.name || 'Unknown Patient'}</div>
                                                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center">
                                                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                                                                    {apt.patient?.tel || 'No phone'}
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="text-xs font-bold text-gray-400 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors mb-1">
                                                                    Apt #{apt.appointment_number}
                                                                </div>
                                                                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    View Details →
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                                </div>

                                {/* Right Column: Patient Details */}
                                <div className={`bg-gray-50 dark:bg-slate-900 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] overflow-hidden relative ${viewPatient ? 'w-1/2 opacity-100' : 'w-0 opacity-0'}`}>
                                    {viewPatient && (
                                        <div className="absolute inset-0 overflow-y-auto custom-scrollbar modal-scrollbar">
                                            <PatientProfileCard 
                                                patient={viewPatient} 
                                                onClose={() => setViewPatient(null)} 
                                                variant="split"
                                            />
                                        </div>
                                    )}
                                </div>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
