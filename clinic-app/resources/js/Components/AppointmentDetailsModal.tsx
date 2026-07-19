import React, { useState, useEffect } from 'react';
import Modal from '@/Components/Modal';
import { formatTime12Hour } from '../Utils/time';

interface AppointmentDetailsModalProps {
    show: boolean;
    onClose: () => void;
    appointment: any;
}

export default function AppointmentDetailsModal({
    show,
    onClose,
    appointment
}: AppointmentDetailsModalProps) {
    const [internalApt, setInternalApt] = useState<any>(null);

    useEffect(() => {
        if (appointment) {
            setInternalApt(appointment);
        }
    }, [appointment]);

    const arrivalTime = internalApt?.checked_in_at 
        ? new Date(internalApt.checked_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
        : '';

    return (
        <Modal show={show} onClose={onClose} maxWidth="md">
            {internalApt && (
                <div className="p-8 relative dark:bg-slate-800">
                    {/* Close Button */}
                    <button 
                        onClick={onClose}
                        className="absolute top-6 right-6 text-gray-400 hover:text-rose-500 transition-all duration-300 p-1.5 bg-gray-50 dark:bg-slate-700 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-full shadow-sm hover:shadow outline-none outline-none focus:ring-0 active:outline-none"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>

                    {/* Modal Title */}
                    <div className="mb-6">
                            <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2.5 py-1 rounded-md capitalize tracking-wider">
                                Apt #{internalApt.appointment_number}
                            </span>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight mt-2.5">
                                Appointment Status
                            </h3>
                        </div>

                        {/* Status Dashboard Block */}
                        <div className="p-5 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 rounded-2xl mb-6">
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-xs text-gray-500 dark:text-gray-400 font-bold capitalize tracking-wider">Current State</span>
                                <div className="flex items-center gap-1.5">
                                    {!!internalApt.checked_in && (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 border border-teal-200/50 dark:border-teal-700/50">
                                            Arrived
                                        </span>
                                    )}
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold border ${
                                        internalApt.status === 'pending' ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200/50 dark:border-amber-700/50' :
                                        internalApt.status === 'confirmed' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200/50 dark:border-blue-700/50' :
                                        internalApt.status === 'rejected' ? 'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border-rose-200/50 dark:border-rose-700/50' :
                                        'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-700/50'
                                    }`}>
                                        {internalApt.status ? internalApt.status.charAt(0).toUpperCase() + internalApt.status.slice(1) : 'Pending'}
                                    </span>
                                </div>
                            </div>

                            {['pending', 'confirmed', 'scheduled', 'completed'].includes(internalApt.status) && (
                                <div className="text-sm font-semibold leading-relaxed border-t border-slate-200/50 dark:border-slate-700/50 pt-3 mt-3">
                                    {internalApt.status === 'pending' && (
                                        <p className="text-amber-700 dark:text-amber-400">Your appointment request is pending review by clinic administration.</p>
                                    )}
                                    {(internalApt.status === 'confirmed' || internalApt.status === 'scheduled') && !internalApt.checked_in && (
                                        <p className="text-blue-700 dark:text-blue-400">Scheduled and confirmed. Please notify reception upon arrival at the clinic.</p>
                                    )}
                                    {(internalApt.status === 'confirmed' || internalApt.status === 'scheduled') && !!internalApt.checked_in && (
                                        <p className="text-teal-700 dark:text-teal-400">Checked in at {arrivalTime}. You are now in the doctor's waiting room queue.</p>
                                    )}
                                    {internalApt.status === 'completed' && (
                                        <p className="text-emerald-700 dark:text-emerald-400">Consultation complete. Thank you for visiting us.</p>
                                    )}
                                </div>
                            )}
                            {internalApt.status === 'rejected' && (
                                <div className="text-sm font-semibold leading-relaxed border-t border-slate-200/50 dark:border-slate-700/50 pt-3 mt-3">
                                    <p className="text-rose-700 dark:text-rose-400">This appointment request was rejected. Please contact support or reschedule.</p>
                                </div>
                            )}
                        </div>

                        {/* Consultation Details */}
                        <div className="space-y-4 mb-8">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 capitalize tracking-widest mb-1">Doctor</label>
                                <p className="text-sm font-bold text-gray-900 dark:text-slate-100">Dr. {internalApt.schedule?.doctor?.user?.name || 'Unknown Doctor'}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{internalApt.schedule?.doctor?.specialization || 'General Practitioner'}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100 dark:border-slate-700">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 capitalize tracking-widest mb-1">Scheduled Date</label>
                                    <p className="text-sm font-bold text-gray-900 dark:text-slate-100">
                                        {new Date(internalApt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 capitalize tracking-widest mb-1">Session Time</label>
                                    <p className="text-sm font-bold text-gray-900 dark:text-slate-100">
                                        {formatTime12Hour(internalApt.schedule?.time)}
                                    </p>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <button 
                            onClick={onClose}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-200 font-black rounded-xl transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-1 active:translate-y-0 text-sm outline-none outline-none focus:ring-0 active:outline-none"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </Modal>
    );
}

