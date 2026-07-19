import SidebarLayout from '@/Layouts/SidebarLayout';
import Modal from '@/Components/Modal';
import PatientDetailsModal from '@/Components/PatientDetailsModal';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
export default function Dashboard({ auth, doctorCount, patientCount, appointmentCount, scheduleCount, appointments = [], _chartData }: any) {
    const [showCodeCheckIn, setShowCodeCheckIn] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
    const [appointmentToCancel, setAppointmentToCancel] = useState<any>(null);
    const [pendingDeleteIds, setPendingDeleteIds] = useState<number[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showPatientModal, setShowPatientModal] = useState(false);
    const [viewPatient, setViewPatient] = useState<any>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const formatTime = (timeStr: string) => {
        if (!timeStr) return '';
        if (timeStr.toLowerCase().includes('am') || timeStr.toLowerCase().includes('pm')) {
            return timeStr;
        }
        const parts = timeStr.split(':');
        if (parts.length >= 2) {
            let hours = parseInt(parts[0], 10);
            const minutes = parseInt(parts[1], 10);
            const ampm = hours >= 12 ? 'pm' : 'am';
            hours = hours % 12;
            hours = hours ? hours : 12;
            const minutesStr = minutes === 0 ? '' : `:${minutes.toString().padStart(2, '0')}`;
            return `${hours}${minutesStr} ${ampm}`;
        }
        return timeStr;
    };

    const handleConfirmCancel = () => {
        if (!appointmentToCancel) return;
        const targetId = appointmentToCancel.id;
        const patientName = appointmentToCancel?.patient?.user?.name || 'Patient';
        
        // Hide immediately
        setPendingDeleteIds(prev => [...prev, targetId]);
        setAppointmentToCancel(null);

        // Dispatch undo toast event
        const event = new CustomEvent('show-undo-toast', {
            detail: {
                message: `Appointment for "${patientName}" has been cancelled.`,
                onConfirm: () => {
                    router.delete(route('admin.appointments.destroy', targetId), {
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

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        code: '',
    });

    useEffect(() => {
        if (searchQuery.length < 2) {
            setSearchResults([]);
            return;
        }

        // Prevent re-fetching if we just selected a patient and the input matches their name
        if (selectedAppointment && searchQuery === selectedAppointment.patient_name) {
            return;
        }

        const delayDebounce = setTimeout(async () => {
            setIsSearching(true);
            try {
                const response = await axios.get(route('admin.appointments.search', { q: searchQuery }));
                setSearchResults(response.data);
            } catch (err) {
                console.error(err);
            } finally {
                setIsSearching(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounce);
    }, [searchQuery, selectedAppointment]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setSearchResults([]);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleCheckInSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.appointments.check-in'), {
            onSuccess: () => {
                reset();
                setSearchQuery('');
                setSelectedAppointment(null);
                setShowCodeCheckIn(false);
            },
        });
    };

    const handleSelectResult = (apt: any) => {
        setSelectedAppointment(apt);
        setData('code', apt.code);
        setSearchQuery(apt.patient_name);
        setSearchResults([]);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setSearchQuery(val);
        setData('code', val);
        if (selectedAppointment && val !== selectedAppointment.patient_name) {
            setSelectedAppointment(null);
        }
    };

    return (
        <SidebarLayout
            user={auth.user}
            header={<h2 className="font-semibold text-2xl text-gray-800 dark:text-slate-100 leading-tight">Admin Dashboard</h2>}
        >
            <Head title="Admin Dashboard" />

            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6 lg:h-[calc(100vh-70px)] flex flex-col lg:overflow-hidden">
                
                {/* Clinic Reception Check-in Center Action Banner */}
                <div className="relative overflow-hidden bg-gradient-to-r from-teal-500 via-blue-600 to-indigo-700 dark:from-teal-800 dark:via-blue-900 dark:to-slate-900 p-4 rounded-3xl shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4 flex-shrink-0">
                    {/* Background floating graphics */}
                    <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>

                    <div className="flex items-center gap-4 relative z-10">
                        <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl text-white flex-shrink-0">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">Clinic Reception Check-in</h3>
                            <p className="text-xs text-blue-100 mt-1">Manage patient arrivals. Check in patients directly from the list below or lookup by Name, IC/NIC, or Code.</p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-end relative z-10 w-full md:w-auto mt-4 md:mt-0 gap-3">
                        <a 
                            href={route('queue.tv')} 
                            target="_blank" 
                            className="w-full sm:w-auto h-11 px-5 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600/90 dark:hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all whitespace-nowrap cursor-pointer"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            Launch TV Queue
                        </a>
                        <button
                            onClick={() => {
                                clearErrors();
                                reset();
                                setSearchQuery('');
                                setSelectedAppointment(null);
                                setSearchResults([]);
                                setShowCodeCheckIn(true);
                            }}
                            className="w-full sm:w-auto h-11 px-5 flex items-center justify-center gap-2 bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-bold rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all whitespace-nowrap cursor-pointer"
                        >
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            Check-in Lookup
                        </button>
                    </div>
                </div>

                {/* KPI Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 flex-shrink-0">
                    {/* Total Doctors */}
                    <div className="group cursor-default">
                        <div className="relative h-full overflow-hidden bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-4 group-hover:shadow-xl group-hover:shadow-blue-500/5 group-hover:-translate-y-1 transform-gpu transition-all duration-300">
                            <div className="absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br from-blue-50 dark:from-blue-900/20 to-transparent rounded-full opacity-50 pointer-events-none"></div>
                            <div className="flex items-center justify-between relative z-10">
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 capitalize tracking-widest mb-1">Total Doctors</p>
                                    <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{doctorCount}</h3>
                                </div>
                                <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-500 to-blue-600 text-white flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300 shadow-md">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Total Patients */}
                    <div className="group cursor-default">
                        <div className="relative h-full overflow-hidden bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-4 group-hover:shadow-xl group-hover:shadow-teal-500/5 group-hover:-translate-y-1 transform-gpu transition-all duration-300">
                            <div className="absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br from-teal-50 dark:from-teal-900/20 to-transparent rounded-full opacity-50 pointer-events-none"></div>
                            <div className="flex items-center justify-between relative z-10">
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 capitalize tracking-widest mb-1">Total Patients</p>
                                    <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{patientCount}</h3>
                                </div>
                                <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-teal-400 to-emerald-500 dark:from-teal-600 dark:to-emerald-700 text-white flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300 shadow-md">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Total Appointments */}
                    <div className="group cursor-default">
                        <div className="relative h-full overflow-hidden bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-4 group-hover:shadow-xl group-hover:shadow-purple-500/5 group-hover:-translate-y-1 transform-gpu transition-all duration-300">
                            <div className="absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br from-purple-50 dark:from-purple-900/20 to-transparent rounded-full opacity-50 pointer-events-none"></div>
                            <div className="flex items-center justify-between relative z-10">
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 capitalize tracking-widest mb-1">Appointments</p>
                                    <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{appointmentCount}</h3>
                                </div>
                                <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-600 text-white flex items-center justify-center transform group-hover:-rotate-12 transition-transform duration-300 shadow-md">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Total Schedules */}
                    <div className="group cursor-default">
                        <div className="relative h-full overflow-hidden bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-4 group-hover:shadow-xl group-hover:shadow-amber-500/5 group-hover:-translate-y-1 transform-gpu transition-all duration-300">
                            <div className="absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br from-amber-50 dark:from-amber-900/20 to-transparent rounded-full opacity-50 pointer-events-none"></div>
                            <div className="flex items-center justify-between relative z-10">
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 capitalize tracking-widest mb-1">Active Schedules</p>
                                    <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{scheduleCount}</h3>
                                </div>
                                <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 text-white flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300 shadow-md">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Dashboard layout: Recent appointments & Info */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:flex-1 lg:min-h-0">
                    {/* Recent Bookings & Status Overview */}
                    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden flex flex-col lg:col-span-2 lg:h-full lg:min-h-0 transition-all">
                        <div className="px-6 py-3.5 border-b border-gray-100 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-gradient-to-r from-gray-50 dark:from-slate-800 to-white dark:to-slate-900 flex-shrink-0">
                            <div>
                                <h3 className="font-bold text-gray-800 dark:text-slate-100 text-base">Recent Booking Submissions</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Monitor and validate patient arrivals</p>
                            </div>
                            <Link href={route('admin.appointments.index')} className="w-full sm:w-auto text-center text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-900/30 px-4 py-2 rounded-xl transition-all hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-transparent dark:border-blue-800/50">
                                Manage All
                            </Link>
                        </div>
                        
                        <div className="flex flex-col lg:flex-1 lg:overflow-y-auto custom-scrollbar lg:min-h-0">
                            {appointments.length === 0 ? (
                                <div className="flex-1 flex flex-col justify-center items-center p-6 text-center">
                                    <div className="w-16 h-16 bg-slate-50 dark:bg-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100 dark:border-slate-700 text-gray-400 dark:text-gray-500">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
                                    </div>
                                    <h4 className="font-bold text-gray-800 dark:text-slate-200">No Recent Bookings</h4>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">There are no patient appointment submissions logged in the system today.</p>
                                </div>
                            ) : (
                                <div className="px-6 py-1 divide-y divide-gray-100 dark:divide-slate-700">
                                    {appointments.filter((apt: any) => !pendingDeleteIds.includes(apt.id)).map((apt: any) => (
                                        <div 
                                            key={apt.id} 
                                            onClick={() => {
                                                setViewPatient(apt.patient);
                                                setShowPatientModal(true);
                                            }}
                                            className="py-3 px-2 -mx-2 first:pt-1.5 last:pb-1.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/50 rounded-xl transition-all"
                                        >
                                            <div className="flex items-center space-x-3.5">
                                                <div className="h-9 w-9 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm shadow-sm border border-transparent dark:border-blue-800/50">
                                                    {apt.patient?.user?.name?.charAt(0) || 'P'}
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-bold text-gray-900 dark:text-slate-100">{apt.patient?.user?.name || 'Unknown Patient'}</h4>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold mt-0.5">
                                                        Dr. {apt.schedule?.doctor?.user?.name || 'Unknown Doctor'} • Apt #{apt.appointment_number}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between sm:justify-end gap-2.5 w-full sm:w-auto mt-1 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-0 border-gray-50 dark:border-slate-700/50">
                                                <div className="flex items-center gap-1.5">
                                                    {!!apt.checked_in && (
                                                        <span className="inline-flex items-center px-2 py-1 rounded text-[10px] font-black bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 border border-teal-200/50 dark:border-teal-800/50 shadow-sm">
                                                            Arrived
                                                        </span>
                                                    )}
                                                    <span className={`px-2 py-1 rounded text-[10px] font-black border shadow-sm inline-flex ${
                                                        apt.status === 'pending' ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200/50 dark:border-amber-800/50' :
                                                        apt.status === 'confirmed' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200/50 dark:border-blue-800/50' :
                                                        apt.status === 'rejected' ? 'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border-rose-200/50 dark:border-rose-800/50' :
                                                        'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-800/50'
                                                    }`}>
                                                        {apt.status ? apt.status.charAt(0).toUpperCase() + apt.status.slice(1) : 'Pending'}
                                                    </span>

                                                    {apt.status === 'pending' && (
                                                        <div className="flex items-center gap-1.5 ml-1">                                                            <Link
                                                                href={route('admin.appointments.status.update', apt.id)}
                                                                method="patch"
                                                                data={{ status: 'confirmed' }}
                                                                preserveScroll
                                                                onClick={(e: any) => e.stopPropagation()}
                                                                className="p-1.5 bg-white dark:bg-slate-800 text-gray-400 dark:text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 transition-all hover:-translate-y-0.5"
                                                                title="Approve"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                                                            </Link>
                                                            <Link
                                                                href={route('admin.appointments.status.update', apt.id)}
                                                                method="patch"
                                                                data={{ status: 'rejected' }}
                                                                preserveScroll
                                                                onClick={(e: any) => e.stopPropagation()}
                                                                className="p-1.5 bg-white dark:bg-slate-800 text-gray-400 dark:text-gray-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 transition-all hover:-translate-y-0.5"
                                                                title="Reject"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                                                            </Link>
                                                            <button
                                                                onClick={(e: any) => { e.stopPropagation(); setAppointmentToCancel(apt); }}
                                                                className="px-3 py-1.5 text-[10px] font-black bg-rose-50 dark:bg-rose-900/30 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-400 border border-rose-200/50 dark:border-rose-800/50 rounded-lg shadow-sm transition-all cursor-pointer"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>

                                                {apt.status !== 'pending' && apt.status !== 'rejected' && apt.status !== 'completed' && !apt.checked_in && (
                                                    <Link
                                                        href={route('admin.appointments.check-in')}
                                                        method="post"
                                                        data={{ code: `APT-${apt.id}` }}
                                                        as="button"
                                                        preserveScroll
                                                        onClick={(e: any) => e.stopPropagation()}
                                                        className="px-3 py-1.5 text-[10px] font-black bg-teal-50 dark:bg-teal-900/30 hover:bg-teal-100 dark:hover:bg-teal-900/50 text-teal-700 dark:text-teal-400 border border-teal-200/50 dark:border-teal-800/50 rounded-lg shadow-sm transition-all cursor-pointer"
                                                    >
                                                        Check In
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* System Announcement & Queue Status */}
                    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 p-5 flex flex-col justify-between lg:h-full lg:min-h-0 transition-all">
                        <div className="flex-1 pr-1">
                            <h4 className="font-bold text-gray-800 dark:text-white mb-1.5 text-base">Check-in Guidelines</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-3">
                                Check in arriving patients using the direct list buttons or lookup tool.
                            </p>
                            <ul className="text-xs text-gray-600 dark:text-gray-300 font-medium space-y-2">
                                <li className="flex items-center">
                                    <svg className="w-4 h-4 text-emerald-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                                    Verifies appointment details
                                </li>
                                <li className="flex items-center">
                                    <svg className="w-4 h-4 text-emerald-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                                    Logs arrival timestamps
                                </li>
                                <li className="flex items-center">
                                    <svg className="w-4 h-4 text-emerald-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                                    Routes patients to Doctor lobby
                                </li>
                            </ul>
                        </div>
                        <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-100 dark:border-teal-800 rounded-2xl p-4 flex items-center space-x-3 mt-4 flex-shrink-0">
                            <div className="p-2 bg-teal-500 dark:bg-teal-600 text-white rounded-xl">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            </div>
                            <div>
                                <h5 className="text-xs font-bold text-teal-800 dark:text-teal-300">Check-in Server Online</h5>
                                <p className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold mt-0.5">Direct arrivals check-in enabled.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Manual Code Check-in Modal */}
            <Modal show={showCodeCheckIn} onClose={() => setShowCodeCheckIn(false)} maxWidth="md" overflowVisible={true}>
                <div className="p-4 sm:p-6 md:p-8 dark:bg-slate-800">
                    
                    {/* Header */}
                    <div className="w-full text-center relative mb-6">
                        <button 
                            onClick={() => setShowCodeCheckIn(false)}
                            className="absolute -top-2 right-0 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-all p-1.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Manual Patient Check-in</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Lookup and check in patient by Name, IC/NIC, or Code</p>
                    </div>

                    {/* Manual Submission Form */}
                    <form onSubmit={handleCheckInSubmit} className="space-y-4">
                        <div className="relative z-30" ref={dropdownRef}>
                            <label className="block text-[10px] font-bold text-gray-500 capitalize tracking-wider mb-1.5 text-left">
                                Patient Search (Name, IC/NIC, or Code)
                            </label>
                            
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={handleInputChange}
                                    placeholder="Type Name, IC/NIC, or APT-X..."
                                    className="w-full h-11 px-4 border border-gray-200 dark:border-slate-700  rounded-xl text-sm outline-none transition-colors bg-white dark:bg-slate-900/50 dark:text-slate-100 placeholder-gray-400 dark:placeholder-gray-500 placeholder:font-normal"
                                />
                                {isSearching && (
                                    <div className="absolute right-3 top-3.5">
                                        <svg className="animate-spin h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    </div>
                                )}
                            </div>

                            {/* Dropdown Results */}
                            {searchResults.length > 0 && (
                                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl shadow-xl max-h-60 overflow-y-auto custom-scrollbar divide-y divide-gray-50 dark:divide-slate-700">
                                    {searchResults.map((apt) => (
                                        <div
                                            key={apt.id}
                                            onClick={() => handleSelectResult(apt)}
                                            className="px-5 py-4 hover:bg-blue-50/50 dark:hover:bg-slate-700/50 cursor-pointer transition-all text-left flex justify-between items-center"
                                        >
                                            <div>
                                                <h4 className="text-sm font-bold text-gray-900 dark:text-slate-100">{apt.patient_name}</h4>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    IC: {apt.patient_nic} • {apt.code}
                                                </p>
                                                <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mt-1">
                                                    Dr. {apt.doctor_name} • {formatTime(apt.time)}
                                                </p>
                                            </div>
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-800/50 shadow-sm">
                                                Active
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {searchQuery.length >= 2 && searchResults.length === 0 && !isSearching && !selectedAppointment && (
                                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl shadow-xl p-4 text-center text-xs text-gray-400 dark:text-gray-500">
                                    No matching active appointments found.
                                </div>
                            )}
                        </div>

                        {/* Selected Appointment Confirmation Details Card */}
                        {selectedAppointment && (
                            <div className="bg-teal-50/50 dark:bg-teal-900/20 border border-teal-100/50 dark:border-teal-800/50 rounded-2xl p-4 text-left space-y-2 animate-fadeIn">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-[9px] font-black text-teal-800 dark:text-teal-400 capitalize tracking-wider">Selected Patient</p>
                                        <h4 className="text-sm font-black text-gray-900 dark:text-slate-100 mt-0.5">{selectedAppointment.patient_name}</h4>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">IC/NIC: <span className="font-semibold text-gray-700 dark:text-gray-300">{selectedAppointment.patient_nic}</span></p>
                                    </div>
                                    <span className="px-2.5 py-1 text-[9px] font-black bg-teal-500 dark:bg-teal-600 text-white rounded-lg shadow-sm">
                                        Ready
                                    </span>
                                </div>
                                <div className="border-t border-teal-100/50 dark:border-teal-800/50 pt-2 flex justify-between text-xs text-gray-600 dark:text-gray-400 font-medium">
                                    <div>
                                        <span className="text-gray-400 dark:text-gray-500">Doctor:</span> Dr. {selectedAppointment.doctor_name}
                                    </div>
                                    <div>
                                        <span className="text-gray-400 dark:text-gray-500">Time:</span> {formatTime(selectedAppointment.time)}
                                    </div>
                                </div>
                            </div>
                        )}

                        {errors.code && (
                            <p className="text-xs text-rose-600 font-semibold text-left">{errors.code}</p>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowCodeCheckIn(false);
                                    reset();
                                    setSearchQuery('');
                                    setSelectedAppointment(null);
                                    setSearchResults([]);
                                }}
                                className="flex-1 py-3 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-200 font-bold text-sm rounded-xl transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={processing || !data.code}
                                className="flex-1 py-3 bg-gradient-to-r from-teal-500 to-blue-600 text-white font-black text-sm rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:pointer-events-none"
                            >
                                Confirm Check-In
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Cancel Confirmation Modal */}
            <Modal show={appointmentToCancel !== null} onClose={() => setAppointmentToCancel(null)} maxWidth="sm">
                <div className="p-4 sm:p-6 md:p-8 dark:bg-slate-800">
                    <div className="flex items-center justify-center w-16 h-16 mx-auto bg-rose-50 dark:bg-rose-900/30 rounded-2xl mb-6 shadow-inner">
                        <svg className="w-8 h-8 text-rose-500 dark:text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-3">Cancel Appointment?</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-8 leading-relaxed">
                        Are you sure you want to cancel the appointment for <strong>{appointmentToCancel?.patient?.user?.name}</strong>? This action cannot be undone and both parties will be notified.
                    </p>
                    <div className="flex flex-col-reverse sm:flex-row gap-3">
                        <button 
                            onClick={() => setAppointmentToCancel(null)}
                            className="flex-1 px-4 py-3 bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl transition-all shadow-sm"
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

            <PatientDetailsModal 
                show={showPatientModal} 
                onClose={() => setShowPatientModal(false)} 
                patient={viewPatient} 
            />
        </SidebarLayout>
    );
}


