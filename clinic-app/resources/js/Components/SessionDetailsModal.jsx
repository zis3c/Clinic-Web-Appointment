import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { formatTime12Hour } from '@/Utils/time';

export default function SessionDetailsModal({ selectedSession, onClose }) {
    const [internalSession, setInternalSession] = useState(null);

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
                            <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-3xl bg-white p-8 text-left align-middle shadow-2xl transition-all">
                                <button 
                                    onClick={onClose}
                                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-full p-2 transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                </button>

                                {internalSession && (
                                    <>
                                        <div className="mb-6">
                                            <h3 className="text-2xl font-bold text-gray-900">{internalSession.title}</h3>
                                            <p className="text-blue-600 font-semibold mt-1 flex items-center">
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                                {new Date(internalSession.date).toLocaleDateString()} at {formatTime12Hour(internalSession.time)}
                                            </p>
                                        </div>

                                        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                                            <h4 className="font-bold text-gray-800 mb-4 flex items-center justify-between">
                                                Booked Patients
                                                <span className="bg-white px-3 py-1 rounded-full text-xs border border-gray-200">
                                                    {internalSession.appointments?.length || 0} / {internalSession.number_of_patients} Capacity
                                                </span>
                                            </h4>
                                            
                                            {(!internalSession.appointments || internalSession.appointments.length === 0) ? (
                                                <div className="text-center py-6 text-gray-500 text-sm">
                                                    No patients have booked this session yet.
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
                                                    {internalSession.appointments.map(apt => (
                                                        <div key={apt.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                                                            <div>
                                                                <div className="font-bold text-gray-900">{apt.patient?.user?.name || 'Unknown Patient'}</div>
                                                                <div className="text-xs text-gray-500 mt-1 flex items-center">
                                                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                                                                    {apt.patient?.tel || 'No phone'}
                                                                </div>
                                                            </div>
                                                            <div className="text-xs font-bold text-gray-400">
                                                                Apt #{apt.appointment_number}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
