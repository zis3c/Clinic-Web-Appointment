import { useState, useEffect } from 'react';
import SidebarLayout from '@/Layouts/SidebarLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import SessionDetailsModal from '@/Components/SessionDetailsModal';
import Modal from '@/Components/Modal';
import CustomSelect from '@/Components/CustomSelect';

import { formatTime12Hour } from '../../Utils/time';

export default function Dashboard({ auth, schedules = [], stats = { total_appointments: 0, total_schedules: 0, total_patients: 0 }, _recent_appointments = [], waiting_room = [], medications = [] }: any) {
    const [selectedSession, setSelectedSession] = useState(null);
    const [selectedAptForComplete, setSelectedAptForComplete] = useState<any>(null);

    const { data, setData, patch, processing, errors, reset, clearErrors } = useForm({
        diagnosis: '',
        prescriptions: '',
        pharmacy_prescriptions: [] as Array<{
            medication_id: string;
            dosage: string;
            frequency: string;
            duration_days: number;
            quantity_dispensed: number;
            instructions: string;
        }>,
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
                window.dispatchEvent(new CustomEvent('show-toast', {
                    detail: {
                        message: 'Consultation completed successfully.',
                        type: 'success',
                    }
                }));
            },
        });
    };

    useEffect(() => {
        if (window.Echo) {
            const channel = window.Echo.channel('queue');
            channel.listen('AppointmentUpdated', (_e: any) => {
                router.reload({ only: ['waiting_room', 'recent_appointments', 'stats', 'schedules'] });
            });

            return () => {
                window.Echo.leaveChannel('queue');
            };
        }
    }, []);


    // Get only future schedules
    const upcomingSchedules = (schedules || []).filter((s: any) => new Date(s.date).getTime() >= new Date().setHours(0,0,0,0));

    return (
        <SidebarLayout
            user={auth.user}
            header={<h2 className="font-semibold text-2xl text-gray-800 dark:text-slate-100 leading-tight">Doctor Dashboard</h2>}
        >
            <Head title="Doctor Dashboard" />

            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6 lg:h-[calc(100vh-70px)] flex flex-col lg:overflow-hidden pb-8 lg:pb-0">

                {/* Welcome Banner */}
                <div className="relative overflow-hidden bg-white dark:bg-slate-800 p-5 md:p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col md:flex-row justify-between items-center gap-5 transition-all text-center md:text-left">
                    <div className="flex flex-col md:flex-row items-center gap-3 md:gap-4 w-full md:w-auto">
                        <div className="relative p-3 bg-blue-50 rounded-2xl text-blue-600 flex-shrink-0">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                                Welcome back, Dr. {auth.user.name}
                            </h3>
                            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1 md:mt-1.5 px-2 md:px-0">
                                Manage consultations, schedules, and patient flow from here.
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto mt-4 md:mt-0">
                        <a
                            href={route('queue.tv')}
                            target="_blank"
                            className="w-full md:w-auto h-10 md:h-11 px-4 md:px-5 flex items-center justify-center gap-1.5 md:gap-2 text-sm md:text-base bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600/90 dark:hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] md:hover:scale-105 transition-all whitespace-nowrap"
                        >
                            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            View Live TV Queue
                        </a>
                        <Link
                            href={route('doctor.schedules.index')}
                            className="w-full md:w-auto h-10 md:h-11 px-4 md:px-5 flex items-center justify-center gap-1.5 md:gap-2 text-sm md:text-base bg-gradient-to-r from-teal-400 to-blue-600 dark:from-teal-600 dark:to-blue-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] md:hover:scale-105 transition-all whitespace-nowrap"
                        >
                            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                            Manage Schedules
                        </Link>
                    </div>
                </div>
                
                {/* KPI Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-shrink-0">
                    {/* Total Bookings */}
                    <div className="group cursor-default">
                        <div className="relative overflow-hidden h-full bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-5 group-hover:shadow-xl group-hover:shadow-blue-500/10 group-hover:-translate-y-1 transition-all duration-300 ease-out antialiased">
                            <div className="absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br from-blue-50 to-transparent dark:from-blue-500/10 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700 pointer-events-none transform-gpu will-change-transform"></div>
                            <div className="flex items-center justify-between relative z-10">
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 capitalize tracking-wider mb-1">Total Bookings</p>
                                    <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{stats?.total_appointments ?? 0}</h3>
                                </div>
                                <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-500 to-blue-600 text-white flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300 ease-out shadow-md shadow-blue-500/30 transform-gpu will-change-transform">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Active Sessions */}
                    <div className="group cursor-default">
                        <div className="relative overflow-hidden h-full bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-5 group-hover:shadow-xl group-hover:shadow-teal-500/10 group-hover:-translate-y-1 transition-all duration-300 ease-out antialiased">
                            <div className="absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br from-teal-50 to-transparent dark:from-teal-500/10 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700 pointer-events-none transform-gpu will-change-transform"></div>
                            <div className="flex items-center justify-between relative z-10">
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 capitalize tracking-wider mb-1">Active Sessions</p>
                                    <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{stats?.total_schedules ?? 0}</h3>
                                </div>
                                <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-teal-400 to-emerald-500 dark:from-teal-600 dark:to-emerald-700 text-white flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300 ease-out shadow-md shadow-teal-500/30 transform-gpu will-change-transform">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Unique Patients */}
                    <div className="group cursor-default">
                        <div className="relative overflow-hidden h-full bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-5 group-hover:shadow-xl group-hover:shadow-purple-500/10 group-hover:-translate-y-1 transition-all duration-300 ease-out antialiased">
                            <div className="absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br from-purple-50 to-transparent dark:from-purple-500/10 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700 pointer-events-none transform-gpu will-change-transform"></div>
                            <div className="flex items-center justify-between relative z-10">
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 capitalize tracking-wider mb-1">Unique Patients</p>
                                    <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{stats?.total_patients ?? 0}</h3>
                                </div>
                                <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-600 text-white flex items-center justify-center transform group-hover:-rotate-12 transition-transform duration-300 ease-out shadow-md shadow-purple-500/30 transform-gpu will-change-transform">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Split layout: Active Waiting Room Queue & schedules */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                    
                    {/* Active Waiting Room Queue */}
                    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden flex flex-col lg:col-span-2 h-[400px] lg:h-full min-h-0">
                        <div className="px-5 py-4 md:px-6 md:py-5 border-b border-gray-100 dark:border-slate-700 flex flex-col gap-1 md:flex-row md:justify-between md:items-center bg-gradient-to-r from-teal-50 to-white dark:from-slate-800 dark:to-slate-900 flex-shrink-0">
                            <div className="w-full">
                                <div className="flex items-center justify-between md:justify-start gap-4">
                                    <h3 className="font-bold text-gray-800 dark:text-slate-100 flex items-center gap-2">
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                                        </span>
                                        Active Waiting Room
                                    </h3>
                                    <span className="text-[10px] md:text-xs font-semibold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 px-2.5 py-1 rounded-full whitespace-nowrap md:ml-auto">
                                        {waiting_room.length} Waiting
                                    </span>
                                </div>
                                <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 mt-1 md:mt-0.5 leading-snug">Patients arrived and ready for consultation (First-Come, First-Served)</p>
                            </div>
                        </div>

                        <div className="divide-y divide-gray-100 dark:divide-slate-700 flex-1 overflow-y-auto custom-scrollbar min-h-0 flex flex-col">
                            {waiting_room.map((apt: any, index: number) => {
                                const arrivalTime = apt.checked_in_at ? new Date(apt.checked_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
                                const isActiveServing = apt.status === 'in_progress';
                                return (
                                    <div
                                        key={apt.id}
                                        className={`p-4 sm:p-5 flex flex-col md:flex-row flex-wrap justify-between items-start md:items-center gap-4 transition-all duration-200 ${
                                            isActiveServing
                                                ? 'border-2 border-emerald-500/60 dark:border-emerald-500/40 bg-gradient-to-r from-emerald-50/60 to-teal-50/40 dark:from-emerald-950/20 dark:to-teal-950/10 shadow-lg shadow-emerald-500/10 dark:shadow-emerald-950/20 rounded-2xl m-2'
                                                : 'hover:bg-slate-50/50 dark:hover:bg-slate-700/50'
                                        }`}
                                    >
                                        <div className="flex items-center space-x-3.5">
                                            {/* Queue Number Indicator */}
                                            <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-white font-extrabold text-sm shadow-sm ${isActiveServing ? 'bg-emerald-500 animate-pulse ring-4 ring-emerald-500/20' : 'bg-gradient-to-br from-teal-400 to-blue-500'}`}>
                                                #{index + 1}
                                            </div>
                                            <div>
                                                <h5 className="font-bold text-sm text-gray-900 dark:text-white leading-tight flex items-center gap-2">
                                                    {apt.patient?.user?.name || 'Patient'}
                                                    {isActiveServing && (
                                                        <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] px-2 py-0.5 rounded-full font-bold border border-emerald-500/20">SERVING</span>
                                                    )}
                                                </h5>
                                                <p className="text-xs text-gray-400 dark:text-gray-500 font-semibold mt-1">
                                                    Checked in at {arrivalTime} • Appt #{apt.appointment_number}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col lg:flex-row lg:items-center gap-3 w-full lg:w-auto shrink-0 flex-wrap justify-end">
                                            <span className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-400 text-xs font-bold rounded-xl flex items-center shrink-0 justify-center">
                                                Session: {apt.schedule?.title}
                                            </span>
                                            {isActiveServing ? (
                                                <div className="flex flex-col sm:flex-row flex-wrap gap-2 shrink-0 w-full lg:w-auto justify-stretch lg:justify-end">
                                                    {apt.schedule?.type === 'virtual' && (
                                                        <a
                                                            href={route('telehealth.room', apt.id)}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer animate-pulse text-center"
                                                        >
                                                            <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                                                            Join Call
                                                        </a>
                                                    )}
                                                    <button
                                                        onClick={() => setSelectedAptForComplete(apt)}
                                                        className="flex-1 sm:flex-initial flex items-center justify-center px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer text-center"
                                                    >
                                                        Complete Consultation
                                                    </button>
                                                </div>
                                            ) : (
                                                <Link
                                                    href={route('doctor.appointments.call', apt.id)}
                                                    method="patch"
                                                    as="button"
                                                    preserveScroll
                                                    className="w-full sm:w-auto justify-center px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1.5"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                                                    Call Patient
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                            {waiting_room.length === 0 && (
                                <div className="flex-1 flex flex-col justify-center items-center p-12 text-center">
                                    <div className="w-16 h-16 bg-slate-50 dark:bg-slate-700/50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100 dark:border-slate-700">
                                        <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                                    </div>
                                    <h4 className="font-bold text-gray-800 dark:text-slate-200">Waiting Room Empty</h4>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">No checked-in patients are waiting at the moment.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Upcoming Schedules */}
                    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden flex flex-col h-[400px] lg:h-full min-h-0">
                        <div className="px-5 py-4 md:px-6 md:py-5 border-b border-gray-100 dark:border-slate-700 flex flex-col gap-1 md:flex-row md:justify-between md:items-center bg-gradient-to-r from-gray-50 to-white dark:from-slate-800 dark:to-slate-900 flex-shrink-0">
                            <div className="w-full">
                                <div className="flex items-center justify-between md:justify-start gap-4">
                                    <h3 className="font-bold text-gray-800 dark:text-slate-100">Your Sessions</h3>
                                    <span className="text-[10px] md:text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2.5 py-1 rounded-full whitespace-nowrap md:ml-auto">
                                        {upcomingSchedules.length} Active
                                    </span>
                                </div>
                                <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 mt-1 md:mt-0.5 leading-snug">Upcoming schedule list</p>
                            </div>
                        </div>
                        
                        <div className="divide-y divide-gray-100 dark:divide-slate-700 flex-1 overflow-y-auto custom-scrollbar min-h-0 flex flex-col">
                            {upcomingSchedules.map((schedule: any) => (
                                <div 
                                    key={schedule.id} 
                                    onClick={() => setSelectedSession(schedule)}
                                    className="p-4 flex flex-col justify-between hover:bg-blue-50/20 dark:hover:bg-slate-700/30 transition-all duration-200 gap-3 cursor-pointer"
                                >
                                    <div>
                                        <h5 className="font-bold text-sm text-gray-900 dark:text-white leading-tight">{schedule.title}</h5>
                                        <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-gray-400 dark:text-gray-500 font-medium">
                                            <span className="flex items-center gap-1">
                                                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                                {new Date(schedule.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                                {formatTime12Hour(schedule.time)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between mt-1">
                                        <span className={`px-2.5 py-0.5 inline-flex text-xs font-bold rounded-full ${(schedule.appointments?.length || 0) >= schedule.number_of_patients ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-800 dark:text-rose-400' : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400'}`}>
                                            {schedule.appointments?.length || 0} / {schedule.number_of_patients} Booked
                                        </span>
                                        <button 
                                            onClick={() => setSelectedSession(schedule)}
                                            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-700 hover:bg-blue-50 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-bold text-xs rounded-lg transition-all duration-200"
                                        >
                                            Details
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {upcomingSchedules.length === 0 && (
                                <div className="flex-1 flex flex-col justify-center items-center p-12 text-center">
                                    <div className="w-16 h-16 bg-slate-50 dark:bg-slate-700/50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100 dark:border-slate-700 text-gray-400 dark:text-gray-500">
                                        <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                    </div>
                                    <h4 className="font-bold text-gray-800 dark:text-slate-200">No Upcoming Schedules</h4>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Please create schedules to start receiving appointments.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

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
                        <form onSubmit={submitCompleteConsultation} className="p-8 relative flex flex-col max-h-[90vh] md:max-h-[85vh]">
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

                                <div className="mt-4 border-t border-gray-100 pt-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 capitalize tracking-wider">Structured Prescriptions</label>
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
                                        <div key={idx} className="bg-gray-50/80 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-600 p-3.5 rounded-xl mb-3 relative">
                                            <button 
                                                type="button" 
                                                onClick={() => {
                                                    const newRx = [...data.pharmacy_prescriptions];
                                                    newRx.splice(idx, 1);
                                                    setData('pharmacy_prescriptions', newRx);
                                                }}
                                                className="absolute top-2.5 right-2.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-900/30 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-all"
                                            >
                                                ✕ Remove
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
                                </div>

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

                {/* Session Details Modal */}
                <SessionDetailsModal 
                    selectedSession={selectedSession} 
                    onClose={() => setSelectedSession(null)} 
                />
            </div>
        </SidebarLayout>
    );
}

