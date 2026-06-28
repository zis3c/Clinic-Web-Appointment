import { useState } from 'react';
import SidebarLayout from '@/Layouts/SidebarLayout';
import Modal from '@/Components/Modal';
import { Head, Link, router } from '@inertiajs/react';
import { formatTime12Hour } from '../../Utils/time';
import DoctorDetailsModal from '@/Components/DoctorDetailsModal';

export default function Appointments({ auth, appointments }: any) {
    const [appointmentToCancel, setAppointmentToCancel] = useState<number | null>(null);
    const [selectedDoctorForModal, setSelectedDoctorForModal] = useState<any>(null);
    const [pendingDeleteIds, setPendingDeleteIds] = useState<number[]>([]);

    const handleConfirmCancel = () => {
        if (!appointmentToCancel) return;
        const targetId = appointmentToCancel;
        
        // Find appointment details for toast
        const apt = appointments.find((a: any) => a.id === targetId);
        const drName = apt?.schedule?.doctor?.user?.name || 'Doctor';

        setPendingDeleteIds(prev => [...prev, targetId]);
        setAppointmentToCancel(null);

        // Dispatch undo toast event
        const event = new CustomEvent('show-undo-toast', {
            detail: {
                message: `Appointment with Dr. ${drName} has been cancelled.`,
                duration: 5000,
                onConfirm: () => {
                    // Send real delete request to backend
                    router.delete(route('patient.appointments.destroy', targetId), {
                        preserveScroll: true,
                        onSuccess: () => {
                            setPendingDeleteIds(prev => prev.filter(id => id !== targetId));
                        }
                    });
                },
                onUndo: () => {
                    // Remove from pending UI list
                    setPendingDeleteIds(prev => prev.filter(id => id !== targetId));
                }
            }
        });
        window.dispatchEvent(event);
    };

    return (
        <SidebarLayout
            user={auth.user}
        >
            <Head title="My Appointments" />

            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                
                {/* Header Actions */}
                <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 transition-colors">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 dark:text-slate-100">Your Booked Appointments</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">View and manage all your upcoming visits to the clinic.</p>
                    </div>
                    <Link 
                        href={route('patient.schedules.index')}
                        className="px-4 py-2 bg-gradient-to-r from-teal-500 to-blue-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition-all"
                    >
                        + Book New
                    </Link>
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-slate-800 overflow-hidden shadow-sm rounded-2xl border border-gray-100 dark:border-slate-700 relative transition-colors">
                    {/* Patch to cover the scrollbar track gap in the header */}
                    <div className="absolute top-0 right-0 w-[8px] h-[49px] bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 z-20"></div>

                    <div className="overflow-x-auto h-[calc(100vh-190px)] overflow-y-auto custom-scrollbar flex flex-col">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                            <thead className="bg-gray-50 dark:bg-slate-800 sticky top-0 z-10 ring-1 ring-gray-200 dark:ring-slate-700">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Apt No.</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Doctor</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Session Info</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                                {appointments.filter((apt: any) => !pendingDeleteIds.includes(apt.id)).map((appointment: any) => (
                                    <tr key={appointment.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-4 py-2 inline-flex text-sm leading-5 font-bold rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50">
                                                #{appointment.appointment_number}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div 
                                                onClick={() => setSelectedDoctorForModal(appointment.schedule.doctor)}
                                                className="flex items-center cursor-pointer group/doctor"
                                            >
                                                <div className="h-10 w-10 rounded-full overflow-hidden bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-700 dark:text-teal-400 font-bold group-hover/doctor:scale-105 transition-transform duration-200">
                                                    {appointment.schedule.doctor.user?.avatar ? (
                                                        <img 
                                                            src={`/storage/${appointment.schedule.doctor.user.avatar}`} 
                                                            alt={appointment.schedule.doctor.user.name} 
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        appointment.schedule.doctor.user.name.charAt(0)
                                                    )}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-bold text-gray-900 dark:text-white group-hover/doctor:text-teal-600 dark:group-hover/doctor:text-teal-400 transition-colors">Dr. {appointment.schedule.doctor.user.name}</div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 font-semibold">{appointment.schedule.doctor.specialty?.name}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-bold text-gray-900 dark:text-white">{appointment.schedule.title}</div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">{new Date(appointment.date).toLocaleDateString()} at {formatTime12Hour(appointment.schedule.time)}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col space-y-1">
                                                <div className="flex items-center gap-1.5">
                                                    {!!appointment.checked_in && (
                                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold leading-5 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 border border-teal-200/50 dark:border-teal-800/50">
                                                            Arrived
                                                        </span>
                                                    )}
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold leading-5 border ${
                                                        appointment.status === 'pending' ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200/50 dark:border-amber-800/50' :
                                                        appointment.status === 'confirmed' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200/50 dark:border-blue-800/50' :
                                                        appointment.status === 'rejected' ? 'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border-rose-200/50 dark:border-rose-800/50' :
                                                        'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-800/50'
                                                    }`}>
                                                        {appointment.status ? appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1) : 'Pending'}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2.5">
                                                {appointment.status !== 'rejected' && appointment.status !== 'completed' && (
                                                    <button 
                                                        onClick={() => setAppointmentToCancel(appointment.id)}
                                                        title="Cancel Appointment"
                                                        className="text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 bg-rose-50 dark:bg-rose-900/30 hover:bg-rose-100 dark:hover:bg-rose-900/50 p-2 rounded-xl transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95 border border-rose-100 dark:border-rose-800/50"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {(!appointments || appointments.filter((apt: any) => !pendingDeleteIds.includes(apt.id)).length === 0) && (
                            <div className="flex-1 flex flex-col justify-center items-center p-10 text-center text-gray-500 dark:text-gray-400">
                                You don't have any upcoming appointments.
                            </div>
                        )}
                    </div>
                </div>

            </div>

            {/* Cancel Confirmation Modal */}
            <Modal show={appointmentToCancel !== null} onClose={() => setAppointmentToCancel(null)} maxWidth="sm">
                <div className="p-8 dark:bg-slate-800">
                    <div className="flex items-center justify-center w-16 h-16 mx-auto bg-rose-50 dark:bg-rose-900/30 rounded-2xl mb-6 shadow-inner">
                        <svg className="w-8 h-8 text-rose-500 dark:text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-3">Cancel Appointment?</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-8 leading-relaxed">
                        Are you sure you want to cancel this appointment? This action cannot be undone and the clinic will be notified.
                    </p>
                    <div className="flex gap-3">
                        <button 
                            onClick={() => setAppointmentToCancel(null)}
                            className="flex-1 px-4 py-3 bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-gray-200 font-bold rounded-xl transition-all shadow-sm"
                        >
                            Keep It
                        </button>
                        <button 
                            onClick={handleConfirmCancel}
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-bold rounded-xl transition-all text-center shadow-md hover:shadow-lg hover:-translate-y-0.5"
                        >
                            Yes, Cancel
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Doctor Profile Details Modal */}
            <DoctorDetailsModal 
                show={selectedDoctorForModal !== null} 
                onClose={() => setSelectedDoctorForModal(null)} 
                doctor={selectedDoctorForModal} 
            />
        </SidebarLayout>
    );
}
