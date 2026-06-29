import { useState } from 'react';
import SidebarLayout from '@/Layouts/SidebarLayout';
import Modal from '@/Components/Modal';
import PatientDetailsModal from '@/Components/PatientDetailsModal';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { formatTime12Hour } from '../../Utils/time';
import CustomSelect from '@/Components/CustomSelect';

export default function Appointments({ auth, appointments }: any) {
    const [searchQuery, setSearchQuery] = useState('');
    const [dateFilter, setDateFilter] = useState('today');
    const [appointmentToCancel, setAppointmentToCancel] = useState<number | null>(null);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [showBulkCancelModal, setShowBulkCancelModal] = useState(false);
    const [isBulkMode, setIsBulkMode] = useState(false);
    const [viewPatient, setViewPatient] = useState<any>(null);
    const [showPatientModal, setShowPatientModal] = useState(false);
    const [pendingDeleteIds, setPendingDeleteIds] = useState<number[]>([]);
    const [selectedAptForComplete, setSelectedAptForComplete] = useState<any>(null);

    const { data, setData, patch, processing, errors, reset, clearErrors } = useForm({
        diagnosis: '',
        prescriptions: '',
        notes: '',
    });

    const submitCompleteConsultation = (e: any) => {
        e.preventDefault();
        patch(route('doctor.appointments.complete', selectedAptForComplete.id), {
            preserveScroll: true,
            onSuccess: () => {
                setSelectedAptForComplete(null);
                reset();
                clearErrors();
            }
        });
    };

    const isDateInRange = (dateStr: string, filter: string) => {
        if (filter === 'all') return true;
        
        // Parse date safely (assuming YYYY-MM-DD format from backend)
        const apptDate = new Date(dateStr);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (filter === 'yesterday') {
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            return apptDate.toDateString() === yesterday.toDateString();
        }
        
        if (filter === 'today') {
            return apptDate.toDateString() === today.toDateString();
        }
        
        if (filter === 'tomorrow') {
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            return apptDate.toDateString() === tomorrow.toDateString();
        }
        
        if (filter === 'week') {
            const nextWeek = new Date(today);
            nextWeek.setDate(nextWeek.getDate() + 7);
            return apptDate >= today && apptDate < nextWeek;
        }
        
        if (filter === 'month') {
            return apptDate.getMonth() === today.getMonth() && apptDate.getFullYear() === today.getFullYear();
        }
        
        return true;
    };

    const filteredAppointments = appointments.filter((appointment: any) => {
        if (pendingDeleteIds.includes(appointment.id)) return false;

        const matchesSearch = 
            appointment.patient.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            appointment.schedule.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            appointment.patient.tel.includes(searchQuery) ||
            appointment.appointment_number.toString().includes(searchQuery);
            
        const matchesDate = isDateInRange(appointment.date, dateFilter);
        
        return matchesSearch && matchesDate;
    });

    // The handleSelectAll logic is now inside the button's onClick in the render function

    const handleSelect = (id: number) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const handleConfirmCancel = () => {
        if (!appointmentToCancel) return;
        const targetId = appointmentToCancel;
        const apt = appointments.find((a: any) => a.id === targetId);
        const patientName = apt?.patient?.user?.name || 'Patient';
        
        // Hide immediately
        setPendingDeleteIds(prev => [...prev, targetId]);
        setAppointmentToCancel(null);

        // Dispatch undo toast event
        const event = new CustomEvent('show-undo-toast', {
            detail: {
                message: `Appointment for "${patientName}" has been cancelled.`,
                onConfirm: () => {
                    router.delete(route('doctor.appointments.destroy', targetId), {
                        onFinish: () => {
                            setPendingDeleteIds(prev => prev.filter(id => id !== targetId));
                        },
                        preserveScroll: true
                    });
                },
                onUndo: () => {
                    setPendingDeleteIds(prev => prev.filter(id => id !== targetId));
                }
            }
        });
        window.dispatchEvent(event);
    };

    const handleBulkCancel = () => {
        router.delete(route('doctor.appointments.bulk-destroy'), {
            data: { appointment_ids: selectedIds },
            onSuccess: () => {
                setShowBulkCancelModal(false);
                setSelectedIds([]);
            },
            preserveScroll: true
        });
    };

    const dateOptions = [
        { value: 'all', label: 'All Dates' },
        { value: 'yesterday', label: 'Yesterday' },
        { value: 'today', label: 'Today' },
        { value: 'tomorrow', label: 'Tomorrow' },
        { value: 'week', label: 'Next 7 Days' },
        { value: 'month', label: 'This Month' }
    ];

    return (
        <SidebarLayout
            user={auth.user}
            header={<h2 className="font-semibold text-2xl text-gray-800 leading-tight">My Appointments</h2>}
        >
            <Head title="My Appointments" />

            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                
                {/* Header Actions */}
                <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex-col md:flex-row gap-4 transition-colors">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 dark:text-slate-100">Your Upcoming Patient Appointments</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">View details of patients who have booked your sessions.</p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto z-20 relative items-center">
                        {!isBulkMode ? (
                            <button
                                onClick={() => setIsBulkMode(true)}
                                className="px-4 py-2 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-600 font-bold rounded-xl text-sm transition-all whitespace-nowrap h-11 shadow-sm"
                            >
                                Select
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={() => {
                                        if (filteredAppointments.length > 0 && selectedIds.length === filteredAppointments.length) {
                                            setSelectedIds([]);
                                        } else {
                                            setSelectedIds(filteredAppointments.map((a: any) => a.id));
                                        }
                                    }}
                                    className="px-4 py-2 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800/50 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 font-bold rounded-xl text-sm transition-all whitespace-nowrap h-11"
                                >
                                    {filteredAppointments.length > 0 && selectedIds.length === filteredAppointments.length ? 'Deselect All' : 'Select All'}
                                </button>
                                {selectedIds.length > 0 && (
                                    <button
                                        onClick={() => setShowBulkCancelModal(true)}
                                        className="px-4 py-2 bg-rose-500 text-white hover:bg-rose-600 font-bold rounded-xl text-sm transition-all whitespace-nowrap h-11 shadow-md hover:shadow-lg hover:-translate-y-0.5"
                                    >
                                        Cancel Selected ({selectedIds.length})
                                    </button>
                                )}
                                <button
                                    onClick={() => {
                                        setIsBulkMode(false);
                                        setSelectedIds([]);
                                    }}
                                    className="px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600 font-bold rounded-xl text-sm transition-all whitespace-nowrap h-11"
                                >
                                    Done
                                </button>
                            </>
                        )}
                        <div className="w-full sm:w-36">
                            <CustomSelect
                                value={dateFilter}
                                onChange={(val: string | number) => setDateFilter(val as string)}
                                options={dateOptions}
                                className="border border-gray-200 dark:border-slate-700 rounded-xl text-sm bg-gray-50 dark:bg-slate-900/50 h-11 px-3 font-medium"
                            />
                        </div>
                        <div className="relative w-full md:w-auto">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                            </div>
                            <input 
                                type="text" 
                                placeholder="Search appointments..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 w-full md:w-64 border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50 dark:bg-slate-900/50 dark:text-white h-11 transition-all outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-slate-800 overflow-hidden shadow-sm rounded-2xl border border-gray-100 dark:border-slate-700 relative transition-colors">
                    {/* Patch to cover the scrollbar track gap in the header */}
                    <div className="absolute top-0 right-0 w-[8px] h-[49px] bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 z-20"></div>
                    
                    <div className="overflow-x-auto h-[calc(100vh-190px)] overflow-y-auto custom-scrollbar flex flex-col">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                                    <thead className="bg-gray-50 dark:bg-slate-800 sticky top-0 z-10 ring-1 ring-gray-200 dark:ring-slate-700">
                                        <tr>
                                            {isBulkMode && <th className="px-6 py-4 text-left w-12"></th>}
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Patient Details</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Session Info</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Apt No.</th>
                                            <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                                        {filteredAppointments.map((appointment: any) => (
                                            <tr key={appointment.id} className={`hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors ${selectedIds.includes(appointment.id) ? 'bg-blue-50/50 dark:bg-blue-900/20' : ''}`}>
                                                {isBulkMode && (
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <input 
                                                            type="checkbox" 
                                                            className="rounded border-gray-300 dark:border-gray-600 dark:bg-slate-700 text-blue-600 shadow-sm focus:ring-blue-500 cursor-pointer"
                                                            checked={selectedIds.includes(appointment.id)}
                                                            onChange={() => handleSelect(appointment.id)}
                                                        />
                                                    </td>
                                                )}
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="h-10 w-10 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-700 dark:text-teal-400 font-bold">
                                                            {appointment.patient.user.name.charAt(0)}
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="flex items-center gap-2">
                                                                <div className="text-sm font-bold text-gray-900 dark:text-white">{appointment.patient.user.name}</div>
                                                                {appointment.patient.allergies && (
                                                                    <span title={`Allergies: ${appointment.patient.allergies}`} className="flex items-center gap-1 px-1.5 py-0.5 bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 text-[10px] font-bold rounded uppercase border border-rose-200 dark:border-rose-800/50 cursor-help">
                                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                                                                        Allergy
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="text-sm text-gray-500 dark:text-gray-400">Tel: {appointment.patient.tel}</div>
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
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400">
                                                        #{appointment.appointment_number}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex items-center justify-end gap-2.5">
                                                        <button 
                                                            onClick={() => {
                                                                setViewPatient(appointment.patient);
                                                                setShowPatientModal(true);
                                                            }}
                                                            title="View Patient Details"
                                                            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 p-2 rounded-xl transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                            </svg>
                                                        </button>
                                                        {!!appointment.checked_in && appointment.status === 'confirmed' && (
                                                            <Link
                                                                href={route('doctor.appointments.call', appointment.id)}
                                                                method="patch"
                                                                as="button"
                                                                preserveScroll
                                                                title="Call Patient"
                                                                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 p-2 rounded-xl transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
                                                            >
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                                                </svg>
                                                            </Link>
                                                        )}
                                                        {!!appointment.checked_in && appointment.status === 'in_progress' && (
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedAptForComplete(appointment);
                                                                }}
                                                                title="Complete Consultation"
                                                                className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 p-2 rounded-xl transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
                                                            >
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                                                </svg>
                                                            </button>
                                                        )}
                                                        {appointment.status !== 'rejected' && appointment.status !== 'completed' && (
                                                            <button 
                                                                onClick={() => setAppointmentToCancel(appointment.id)}
                                                                title="Cancel Appointment"
                                                                className="text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 bg-rose-50 dark:bg-rose-900/30 hover:bg-rose-100 dark:hover:bg-rose-900/50 p-2 rounded-xl transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
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
                        {filteredAppointments.length === 0 && (
                            <div className="flex-1 flex flex-col justify-center items-center p-10 text-center text-gray-500 dark:text-gray-400">
                                {searchQuery ? "No appointments found matching your search." : "No appointments have been booked yet."}
                            </div>
                        )}
                    </div>
                </div>

            </div>

            {/* Cancel Confirmation Modal */}
            <Modal show={appointmentToCancel !== null} onClose={() => setAppointmentToCancel(null)} maxWidth="sm">
                <div className="p-8">
                    <div className="flex items-center justify-center w-16 h-16 mx-auto bg-rose-50 dark:bg-rose-900/30 rounded-2xl mb-6 shadow-inner">
                        <svg className="w-8 h-8 text-rose-500 dark:text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-3">Cancel Appointment?</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-8 leading-relaxed">
                        Are you sure you want to cancel this appointment? This action cannot be undone and the patient will be notified.
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
            {/* Bulk Cancel Modal */}
            <Modal show={showBulkCancelModal} onClose={() => setShowBulkCancelModal(false)} maxWidth="sm">
                <div className="p-8 dark:bg-slate-800">
                    <div className="flex items-center justify-center w-16 h-16 mx-auto bg-rose-50 dark:bg-rose-900/30 rounded-2xl mb-6 shadow-inner">
                        <svg className="w-8 h-8 text-rose-500 dark:text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-3">Cancel Selected Appointments?</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-8 leading-relaxed">
                        Are you sure you want to cancel <span className="font-bold text-gray-800 dark:text-gray-200">{selectedIds.length}</span> appointment(s)? This action cannot be undone.
                    </p>
                    <div className="flex gap-3">
                        <button 
                            onClick={() => setShowBulkCancelModal(false)}
                            className="flex-1 px-4 py-3 bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-gray-200 font-bold rounded-xl transition-all shadow-sm"
                        >
                            Go Back
                        </button>
                        <button 
                            onClick={handleBulkCancel}
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-bold rounded-xl transition-all text-center shadow-md hover:shadow-lg hover:-translate-y-0.5"
                        >
                            Yes, Cancel All
                        </button>
                    </div>
                </div>
            </Modal>

            {/* View Patient Details Modal */}
            <PatientDetailsModal 
                show={showPatientModal} 
                onClose={() => setShowPatientModal(false)} 
                patient={viewPatient} 
            />

            {/* Complete Consultation (EHR Form) Modal */}
            {selectedAptForComplete && (
                <Modal
                    show={selectedAptForComplete !== null}
                    onClose={() => {
                        setSelectedAptForComplete(null);
                        reset();
                        clearErrors();
                    }}
                    maxWidth="md"
                >
                    <form onSubmit={submitCompleteConsultation} className="p-8 relative">
                        <button 
                            type="button"
                            onClick={() => {
                                setSelectedAptForComplete(null);
                                reset();
                                clearErrors();
                            }}
                            className="absolute top-4 right-4 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors bg-gray-100 dark:bg-slate-700 rounded-full p-1 focus:outline-none"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>

                        <div className="text-center mb-6">
                            <div className="h-14 w-14 bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Complete Consultation</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Please enter the EHR notes for <span className="font-bold text-gray-700 dark:text-gray-300">{selectedAptForComplete.patient.user.name}</span></p>
                        </div>

                        <div className="space-y-4">
                            {/* Diagnosis */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">Diagnosis</label>
                                <input
                                    type="text"
                                    required
                                    value={data.diagnosis}
                                    onChange={(e) => setData('diagnosis', e.target.value)}
                                    placeholder="e.g. Acute Pharyngitis, Essential Hypertension"
                                    className="w-full border-gray-200 dark:border-slate-700 rounded-xl text-xs focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50 dark:bg-slate-900/50 dark:text-white transition-all outline-none"
                                />
                                {errors.diagnosis && (
                                    <p className="text-rose-500 text-[10px] mt-1 font-bold">{errors.diagnosis}</p>
                                )}
                            </div>

                            {/* Prescriptions */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">Prescriptions</label>
                                <textarea
                                    value={data.prescriptions}
                                    onChange={(e) => setData('prescriptions', e.target.value)}
                                    placeholder="e.g. Paracetamol 500mg TDS x 5 days&#10;Amoxicillin 500mg BD x 7 days"
                                    rows={3}
                                    className="w-full border-gray-200 dark:border-slate-700 rounded-xl text-xs focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50 dark:bg-slate-900/50 dark:text-white transition-all outline-none font-mono"
                                />
                                {errors.prescriptions && (
                                    <p className="text-rose-500 text-[10px] mt-1 font-bold">{errors.prescriptions}</p>
                                )}
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">Doctor Notes / Instructions</label>
                                <textarea
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    placeholder="e.g. Drink plenty of water, rest for 3 days, follow up if symptoms persist."
                                    rows={3}
                                    className="w-full border-gray-200 dark:border-slate-700 rounded-xl text-xs focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50 dark:bg-slate-900/50 dark:text-white transition-all outline-none"
                                />
                                {errors.notes && (
                                    <p className="text-rose-500 text-[10px] mt-1 font-bold">{errors.notes}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                type="button"
                                onClick={() => {
                                    setSelectedAptForComplete(null);
                                    reset();
                                    clearErrors();
                                }}
                                className="flex-1 py-3 px-4 text-xs font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-xl transition-colors focus:outline-none"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                className="flex-1 py-3 px-4 text-xs font-bold text-white bg-gradient-to-r from-teal-500 to-blue-600 hover:shadow-lg rounded-xl shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all transform enabled:hover:scale-[1.02] focus:outline-none"
                            >
                                Complete Consultation
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
        </SidebarLayout>
    );
}
