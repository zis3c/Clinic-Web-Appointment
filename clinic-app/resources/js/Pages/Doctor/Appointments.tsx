import { useState } from 'react';
import { useAutoRefresh } from '@/hooks/useAutoRefresh';
import SidebarLayout from '@/Layouts/SidebarLayout';
import Modal from '@/Components/Modal';
import PatientDetailsModal from '@/Components/PatientDetailsModal';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { formatTime12Hour } from '../../Utils/time';
import CustomSelect from '@/Components/CustomSelect';

export default function Appointments({ auth, appointments, medications = [] }: any) {
    useAutoRefresh(['appointments']);
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
        pharmacy_prescriptions: [] as {medication_id: string, dosage: string, frequency: string, duration_days: number, quantity_dispensed: number, instructions: string}[],
        notes: '',
    });

    const [selectedAptForVitals, setSelectedAptForVitals] = useState<any>(null);
    const vitalsForm = useForm({
        blood_pressure: '',
        heart_rate: '',
        temperature: '',
        weight: '',
        height: '',
        respiratory_rate: '',
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

    const submitVitals = (e: React.FormEvent) => {
        e.preventDefault();
        vitalsForm.post(route('doctor.appointments.vitals.store', selectedAptForVitals.id), {
            preserveScroll: true,
            onSuccess: () => {
                setSelectedAptForVitals(null);
                vitalsForm.reset();
            }
        });
    };

    return (
        <SidebarLayout
            user={auth.user}
            header={<h2 className="font-semibold text-2xl text-gray-800 leading-tight">My Appointments</h2>}
        >
            <Head title="My Appointments" />

            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                
                {/* Header Actions */}
                <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex-col md:flex-row gap-4 transition-all">
                    <div className="w-full text-center md:text-left">
                        <h3 className="text-base md:text-lg font-bold text-gray-800 dark:text-slate-100">Your Upcoming Patient Appointments</h3>
                        <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">View details of patients who have booked your sessions.</p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto z-20 relative items-center">
                        {!isBulkMode ? (
                            <button
                                onClick={() => setIsBulkMode(true)}
                                className="px-4 py-2 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-600 font-bold rounded-xl text-sm transition-all whitespace-nowrap h-11 shadow-sm"
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
                <div className="bg-white dark:bg-slate-800 overflow-hidden shadow-sm rounded-2xl border border-gray-100 dark:border-slate-700 relative transition-all">
                    {/* Patch to cover the scrollbar track gap in the header */}
                    <div className="absolute top-0 right-0 w-[8px] h-[49px] bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 z-20"></div>
                    
                    <div className="overflow-x-auto h-[calc(100vh-190px)] md:overflow-y-auto custom-scrollbar flex flex-col p-4 md:p-0">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700 hidden md:table">
                                    <thead className="bg-gray-50/80 dark:bg-slate-800/80 backdrop-blur-md sticky top-0 z-10 ring-1 ring-gray-200 dark:ring-slate-700">
                                        <tr>
                                            {isBulkMode && <th className="px-6 py-4 text-left w-12"></th>}
                                            <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 dark:text-gray-400 capitalize tracking-wider w-12">#</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 capitalize tracking-wider">Patient Details</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 capitalize tracking-wider">Session Info</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 capitalize tracking-wider">Status</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 capitalize tracking-wider">Apt No.</th>
                                            <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 dark:text-gray-400 capitalize tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                                        {filteredAppointments.map((appointment: any, index: number) => (
                                            <tr key={appointment.id} className={`hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-all ${selectedIds.includes(appointment.id) ? 'bg-blue-50/50 dark:bg-blue-900/20' : ''}`}>
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
                                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold text-gray-400 dark:text-gray-500">
                                                    {index + 1}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="h-10 w-10 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-700 dark:text-teal-400 font-bold">
                                                            {appointment.patient.user.name.charAt(0)}
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="flex items-center gap-2">
                                                                <div className="text-sm font-bold text-gray-900 dark:text-white">{appointment.patient.user.name}</div>
                                                                {appointment.patient.allergies && (
                                                                    <span title={`Allergies: ${appointment.patient.allergies}`} className="flex items-center gap-1 px-1.5 py-0.5 bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 text-[10px] font-bold rounded capitalize border border-rose-200 dark:border-rose-800/50 cursor-help">
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
                                                        {!!appointment.checked_in && (appointment.status === 'confirmed' || appointment.status === 'in_progress') && (
                                                            <button 
                                                                onClick={() => {
                                                                    setSelectedAptForVitals(appointment);
                                                                }}
                                                                title="Record Vitals"
                                                                className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900/50 p-2 rounded-xl transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
                                                            >
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                                </svg>
                                                            </button>
                                                        )}
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
                        
                        {/* Mobile Card View */}
                        <div className="flex flex-col space-y-4 md:hidden">
                            {filteredAppointments.map((appointment: any) => (
                                <div key={appointment.id} className={`bg-white dark:bg-slate-800 border ${selectedIds.includes(appointment.id) ? 'border-blue-300 dark:border-blue-700 bg-blue-50/20 dark:bg-blue-900/10' : 'border-gray-100 dark:border-slate-700'} rounded-2xl p-5 shadow-sm space-y-4`}>
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            {isBulkMode && (
                                                <input 
                                                    type="checkbox" 
                                                    className="rounded border-gray-300 dark:border-gray-600 dark:bg-slate-700 text-blue-600 shadow-sm focus:ring-blue-500 cursor-pointer mr-2"
                                                    checked={selectedIds.includes(appointment.id)}
                                                    onChange={() => handleSelect(appointment.id)}
                                                />
                                            )}
                                            <div className="h-10 w-10 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-700 dark:text-teal-400 font-bold shrink-0">
                                                {appointment.patient.user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                                    {appointment.patient.user.name}
                                                    {appointment.patient.allergies && (
                                                        <span title={`Allergies: ${appointment.patient.allergies}`} className="px-1.5 py-0.5 bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 text-[10px] font-bold rounded capitalize border border-rose-200 dark:border-rose-800/50">
                                                            Allergy
                                                        </span>
                                                    )}
                                                </h4>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Tel: {appointment.patient.tel}</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-gray-50 dark:bg-slate-900/50 p-3 rounded-xl border border-gray-100 dark:border-slate-700/50">
                                        <div className="flex justify-between items-start mb-2">
                                            <p className="text-xs font-bold text-gray-900 dark:text-white">{appointment.schedule.title}</p>
                                            <span className="px-2 py-0.5 inline-flex text-[10px] font-semibold rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400">
                                                #{appointment.appointment_number}
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-2">
                                            {new Date(appointment.date).toLocaleDateString()} at {formatTime12Hour(appointment.schedule.time)}
                                        </p>
                                        <div className="flex items-center gap-1.5">
                                            {!!appointment.checked_in && (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 border border-teal-200/50 dark:border-teal-800/50">
                                                    Arrived
                                                </span>
                                            )}
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                                                appointment.status === 'pending' ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200/50 dark:border-amber-800/50' :
                                                appointment.status === 'confirmed' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200/50 dark:border-blue-800/50' :
                                                appointment.status === 'rejected' ? 'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border-rose-200/50 dark:border-rose-800/50' :
                                                'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-800/50'
                                            }`}>
                                                {appointment.status ? appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1) : 'Pending'}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="pt-2 border-t border-gray-100 dark:border-slate-700 flex flex-wrap gap-2">
                                        <button 
                                            onClick={() => {
                                                setViewPatient(appointment.patient);
                                                setShowPatientModal(true);
                                            }}
                                            className="flex-1 py-2 px-3 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-xl transition-all text-center"
                                        >
                                            View Patient
                                        </button>
                                        
                                        {!!appointment.checked_in && (appointment.status === 'confirmed' || appointment.status === 'in_progress') && (
                                            <button
                                                onClick={() => {
                                                    setSelectedAptForVitals(appointment);
                                                }}
                                                className="flex-1 py-2 px-3 text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900/50 rounded-xl transition-all text-center"
                                            >
                                                Vitals
                                            </button>
                                        )}
                                        {!!appointment.checked_in && appointment.status === 'confirmed' && (
                                            <Link
                                                href={route('doctor.appointments.call', appointment.id)}
                                                method="patch"
                                                as="button"
                                                preserveScroll
                                                className="flex-1 py-2 px-3 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-all text-center"
                                            >
                                                Call
                                            </Link>
                                        )}
                                        {!!appointment.checked_in && appointment.status === 'in_progress' && (
                                            <button
                                                onClick={() => setSelectedAptForComplete(appointment)}
                                                className="flex-1 py-2 px-3 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-all text-center"
                                            >
                                                Complete
                                            </button>
                                        )}
                                        {appointment.status !== 'rejected' && appointment.status !== 'completed' && (
                                            <button 
                                                onClick={() => setAppointmentToCancel(appointment.id)}
                                                className="flex-none p-2 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30 hover:bg-rose-100 dark:hover:bg-rose-900/50 rounded-xl transition-all"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

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
                    <div className="flex flex-col-reverse sm:flex-row gap-3">
                        <button 
                            onClick={() => setAppointmentToCancel(null)}
                            className="flex-1 px-4 py-3 bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-200 font-bold rounded-xl transition-all shadow-sm"
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
                <div className="p-4 sm:p-6 md:p-8 dark:bg-slate-800">
                    <div className="flex items-center justify-center w-16 h-16 mx-auto bg-rose-50 dark:bg-rose-900/30 rounded-2xl mb-6 shadow-inner">
                        <svg className="w-8 h-8 text-rose-500 dark:text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-3">Cancel Selected Appointments?</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-8 leading-relaxed">
                        Are you sure you want to cancel <span className="font-bold text-gray-800 dark:text-gray-200">{selectedIds.length}</span> appointment(s)? This action cannot be undone.
                    </p>
                    <div className="flex flex-col-reverse sm:flex-row gap-3">
                        <button 
                            onClick={() => setShowBulkCancelModal(false)}
                            className="flex-1 px-4 py-3 bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-200 font-bold rounded-xl transition-all shadow-sm"
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
                            className="absolute top-4 right-4 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-all bg-gray-100 dark:bg-slate-700 rounded-full p-1 outline-none"
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

                        <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-2 -mr-2">
                            {/* Diagnosis */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 capitalize tracking-wider mb-1.5">Diagnosis</label>
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

                                {/* Pharmacy Prescriptions UI */}
                                <div className="mt-4 border-t border-gray-100 pt-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 capitalize tracking-wider">Structured Prescriptions (Pharmacy Sync)</label>
                                        <button 
                                            type="button"
                                            onClick={() => {
                                                setData('pharmacy_prescriptions', [
                                                    ...data.pharmacy_prescriptions, 
                                                    { medication_id: '', dosage: '', frequency: '', duration_days: 1, quantity_dispensed: 1, instructions: '' }
                                                ]);
                                            }}
                                            className="text-xs bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 hover:bg-teal-100 dark:hover:bg-teal-900/50 px-2 py-1 rounded font-bold transition-all"
                                        >
                                            + Add Medication
                                        </button>
                                    </div>
                                    
                                    {data.pharmacy_prescriptions.map((rx, idx) => (
                                        <div key={idx} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-3 rounded-lg mb-3 relative">
                                            <button 
                                                type="button" 
                                                onClick={() => {
                                                    const newRx = [...data.pharmacy_prescriptions];
                                                    newRx.splice(idx, 1);
                                                    setData('pharmacy_prescriptions', newRx);
                                                }}
                                                className="absolute top-2 right-2 text-red-500 hover:text-red-700 font-bold text-xs"
                                            >
                                                Remove
                                            </button>
                                            <div className="grid grid-cols-2 gap-3 mb-2">
                                                <div>
                                                    <label className="text-[10px] text-gray-500 capitalize font-bold">Medication</label>
                                                    <CustomSelect 
                                                        value={rx.medication_id} 
                                                        onChange={(val) => {
                                                            const newRx = [...data.pharmacy_prescriptions];
                                                            newRx[idx].medication_id = val.toString();
                                                            setData('pharmacy_prescriptions', newRx);
                                                        }}
                                                        className="w-full text-xs px-2.5 py-1.5 border border-gray-200 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-900/60 text-gray-800 dark:text-gray-100 transition-all outline-none"
                                                        placeholder="Select..."
                                                        options={(medications || []).map((m: any) => ({
                                                            value: m.id.toString(),
                                                            label: `${m.name} (${m.stock_quantity} in stock)`
                                                        }))}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] text-gray-500 capitalize font-bold">Dosage</label>
                                                    <input type="text" placeholder="e.g. 500mg" value={rx.dosage} onChange={(e) => {
                                                        const newRx = [...data.pharmacy_prescriptions];
                                                        newRx[idx].dosage = e.target.value;
                                                        setData('pharmacy_prescriptions', newRx);
                                                    }} className="w-full text-xs px-2.5 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-900/60 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm transition-all outline-none" required />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-3 gap-3 mb-2">
                                                <div>
                                                    <label className="text-[10px] text-gray-500 capitalize font-bold">Frequency</label>
                                                    <input type="text" placeholder="e.g. BD" value={rx.frequency} onChange={(e) => {
                                                        const newRx = [...data.pharmacy_prescriptions];
                                                        newRx[idx].frequency = e.target.value;
                                                        setData('pharmacy_prescriptions', newRx);
                                                    }} className="w-full text-xs px-2.5 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-900/60 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm transition-all outline-none" required />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] text-gray-500 capitalize font-bold">Days</label>
                                                    <div className="flex items-center border border-gray-200 dark:border-slate-600 rounded-lg shadow-sm focus-within:border-blue-500 focus-within:ring focus-within:ring-blue-500/20 bg-gray-50 dark:bg-slate-900/60 transition-colors outline-none">
                                                        <button type="button" onClick={() => {
                                                            const newRx = [...data.pharmacy_prescriptions];
                                                            newRx[idx].duration_days = Math.max(1, newRx[idx].duration_days - 1);
                                                            setData('pharmacy_prescriptions', newRx);
                                                        }} className="w-8 h-[34px] flex-shrink-0 flex items-center justify-center bg-gray-50 dark:bg-slate-900/50 text-gray-600 dark:text-gray-400 border-r border-gray-200 dark:border-slate-600 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors font-bold text-lg rounded-l-lg outline-none">-</button>
                                                        <input type="number" min="1" value={rx.duration_days} onChange={(e) => {
                                                            const newRx = [...data.pharmacy_prescriptions];
                                                            newRx[idx].duration_days = parseInt(e.target.value) || 1;
                                                            setData('pharmacy_prescriptions', newRx);
                                                        }} className="w-full text-center text-xs border-0 bg-transparent dark:text-white focus:ring-0 shadow-none px-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none outline-none" required />
                                                        <button type="button" onClick={() => {
                                                            const newRx = [...data.pharmacy_prescriptions];
                                                            newRx[idx].duration_days += 1;
                                                            setData('pharmacy_prescriptions', newRx);
                                                        }} className="w-8 h-[34px] flex-shrink-0 flex items-center justify-center bg-gray-50 dark:bg-slate-900/50 text-gray-600 dark:text-gray-400 border-l border-gray-200 dark:border-slate-600 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors font-bold text-lg rounded-r-lg outline-none">+</button>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="text-[10px] text-gray-500 capitalize font-bold">Dispensed Qty</label>
                                                    <div className="flex items-center border border-gray-200 dark:border-slate-600 rounded-lg shadow-sm focus-within:border-blue-500 focus-within:ring focus-within:ring-blue-500/20 bg-gray-50 dark:bg-slate-900/60 transition-colors outline-none">
                                                        <button type="button" onClick={() => {
                                                            const newRx = [...data.pharmacy_prescriptions];
                                                            newRx[idx].quantity_dispensed = Math.max(1, newRx[idx].quantity_dispensed - 1);
                                                            setData('pharmacy_prescriptions', newRx);
                                                        }} className="w-8 h-[34px] flex-shrink-0 flex items-center justify-center bg-gray-50 dark:bg-slate-900/50 text-gray-600 dark:text-gray-400 border-r border-gray-200 dark:border-slate-600 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors font-bold text-lg rounded-l-lg outline-none">-</button>
                                                        <input type="number" min="1" value={rx.quantity_dispensed} onChange={(e) => {
                                                            const newRx = [...data.pharmacy_prescriptions];
                                                            newRx[idx].quantity_dispensed = parseInt(e.target.value) || 1;
                                                            setData('pharmacy_prescriptions', newRx);
                                                        }} className="w-full text-center text-xs border-0 bg-transparent dark:text-white focus:ring-0 shadow-none px-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none outline-none" required />
                                                        <button type="button" onClick={() => {
                                                            const newRx = [...data.pharmacy_prescriptions];
                                                            newRx[idx].quantity_dispensed += 1;
                                                            setData('pharmacy_prescriptions', newRx);
                                                        }} className="w-8 h-[34px] flex-shrink-0 flex items-center justify-center bg-gray-50 dark:bg-slate-900/50 text-gray-600 dark:text-gray-400 border-l border-gray-200 dark:border-slate-600 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors font-bold text-lg rounded-r-lg outline-none">+</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {data.pharmacy_prescriptions.length === 0 && (
                                        <p className="text-xs text-gray-500 italic">No structured prescriptions added. Pharmacy stock will not be deducted.</p>
                                    )}
                                </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 capitalize tracking-wider mb-1.5">Doctor Notes / Instructions</label>
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

                        <div className="flex flex-col-reverse sm:flex-row gap-3 mt-6">
                            <button
                                type="button"
                                onClick={() => {
                                    setSelectedAptForComplete(null);
                                    reset();
                                    clearErrors();
                                }}
                                className="flex-1 py-3 px-4 text-xs font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-xl transition-all outline-none"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                className="flex-1 py-3 px-4 text-xs font-bold text-white bg-gradient-to-r from-teal-500 to-blue-600 hover:shadow-lg rounded-xl shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all transform enabled:hover:scale-[1.02] outline-none"
                            >
                                Complete Consultation
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
            
            {/* Vitals Modal */}
            <Modal
                show={!!selectedAptForVitals}
                onClose={() => {
                    setSelectedAptForVitals(null);
                    vitalsForm.reset();
                }}
                maxWidth="md"
            >
                <form onSubmit={submitVitals} className="p-8 relative">
                    <button 
                        type="button"
                        onClick={() => {
                            setSelectedAptForVitals(null);
                            vitalsForm.reset();
                        }}
                        className="absolute top-4 right-4 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-all bg-gray-100 dark:bg-slate-700 rounded-full p-1 outline-none"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>

                    <div className="text-center mb-6">
                        <div className="h-14 w-14 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Record Vitals</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">For patient <span className="font-bold text-gray-700 dark:text-gray-300">{selectedAptForVitals?.patient.user.name}</span></p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Blood Pressure (mmHg)</label>
                            <input
                                type="text"
                                placeholder="120/80"
                                value={vitalsForm.data.blood_pressure}
                                onChange={e => vitalsForm.setData('blood_pressure', e.target.value)}
                                className="w-full text-sm border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Heart Rate (bpm)</label>
                            <input
                                type="number"
                                placeholder="72"
                                value={vitalsForm.data.heart_rate}
                                onChange={e => vitalsForm.setData('heart_rate', e.target.value)}
                                className="w-full text-sm border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Temp (°C)</label>
                            <input
                                type="number"
                                step="0.1"
                                placeholder="36.5"
                                value={vitalsForm.data.temperature}
                                onChange={e => vitalsForm.setData('temperature', e.target.value)}
                                className="w-full text-sm border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Weight (kg)</label>
                            <input
                                type="number"
                                step="0.1"
                                placeholder="70"
                                value={vitalsForm.data.weight}
                                onChange={e => vitalsForm.setData('weight', e.target.value)}
                                className="w-full text-sm border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 dark:text-white"
                            />
                        </div>
                    </div>

                    <div className="mt-6 flex flex-col-reverse sm:flex-row gap-3">
                        <button type="button" onClick={() => { setSelectedAptForVitals(null); vitalsForm.reset(); }} className="flex-1 py-2 text-sm font-bold bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:text-white rounded-lg">Cancel</button>
                        <button type="submit" disabled={vitalsForm.processing} className="flex-1 py-2 text-sm font-bold bg-purple-600 text-white hover:bg-purple-700 rounded-lg shadow disabled:opacity-50">Save Vitals</button>
                    </div>
                </form>
            </Modal>
        </SidebarLayout>
    );
}


