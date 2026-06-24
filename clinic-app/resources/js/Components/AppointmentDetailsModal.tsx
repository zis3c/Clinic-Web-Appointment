import React from 'react';
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
    const arrivalTime = appointment?.checked_in_at 
        ? new Date(appointment.checked_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
        : '';

    return (
        <Modal show={show} onClose={onClose} maxWidth="md">
            {appointment && (
                <div className="p-8 relative">
                    {/* Close Button */}
                    <button 
                        onClick={onClose}
                        className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors p-1.5 hover:bg-gray-100 rounded-full"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>

                    {/* Modal Title */}
                    <div className="mb-6">
                        <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md uppercase tracking-wider">
                            Apt #{appointment.appointment_number}
                        </span>
                        <h3 className="text-2xl font-black text-gray-900 tracking-tight mt-2.5">
                            Appointment Status
                        </h3>
                    </div>

                    {/* Status Dashboard Block */}
                    <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl mb-6">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Current State</span>
                            <div className="flex items-center gap-1.5">
                                {!!appointment.checked_in && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200/50">
                                        Arrived
                                    </span>
                                )}
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold border ${
                                    appointment.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200/50' :
                                    appointment.status === 'confirmed' ? 'bg-blue-50 text-blue-700 border-blue-200/50' :
                                    appointment.status === 'rejected' ? 'bg-rose-50 text-rose-700 border-rose-200/50' :
                                    'bg-emerald-50 text-emerald-700 border-emerald-200/50'
                                }`}>
                                    {appointment.status ? appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1) : 'Pending'}
                                </span>
                            </div>
                        </div>

                        <div className="text-sm font-semibold text-gray-700 leading-relaxed border-t border-slate-200/50 pt-3">
                            {appointment.status === 'pending' && (
                                <p className="text-amber-700">Your appointment request is pending review by clinic administration.</p>
                            )}
                            {appointment.status === 'confirmed' && !appointment.checked_in && (
                                <p className="text-blue-700">Confirmed. Please notify reception upon arrival at the clinic.</p>
                            )}
                            {appointment.status === 'confirmed' && !!appointment.checked_in && (
                                <p className="text-teal-700">Checked in at {arrivalTime}. You are now in the doctor's waiting room queue.</p>
                            )}
                            {appointment.status === 'completed' && (
                                <p className="text-emerald-700">Consultation complete. Thank you for visiting us.</p>
                            )}
                            {appointment.status === 'rejected' && (
                                <p className="text-rose-700">This appointment request was rejected. Please contact support or reschedule.</p>
                            )}
                        </div>
                    </div>

                    {/* Consultation Details */}
                    <div className="space-y-4 mb-8">
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Doctor</label>
                            <p className="text-sm font-bold text-gray-900">Dr. {appointment.schedule?.doctor?.user?.name || 'Unknown Doctor'}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{appointment.schedule?.doctor?.specialization || 'General Practitioner'}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Scheduled Date</label>
                                <p className="text-sm font-bold text-gray-900">
                                    {new Date(appointment.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </p>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Session Time</label>
                                <p className="text-sm font-bold text-gray-900">
                                    {formatTime12Hour(appointment.schedule?.time)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <button 
                            onClick={onClose}
                            className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 font-bold rounded-xl transition-all shadow-sm text-sm"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </Modal>
    );
}
