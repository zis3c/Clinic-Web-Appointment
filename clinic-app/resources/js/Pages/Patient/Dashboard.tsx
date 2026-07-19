import { useState, useEffect, useMemo } from 'react';

import SidebarLayout from '@/Layouts/SidebarLayout';
import { Head, Link, router } from '@inertiajs/react';
import { formatTime12Hour } from '../../Utils/time';
import DoctorDetailsModal from '@/Components/DoctorDetailsModal';
import AppointmentDetailsModal from '@/Components/AppointmentDetailsModal';
import Modal from '@/Components/Modal';

export default function Dashboard({ auth, appointments = [] }: any) {
    const [selectedDoctorForModal, setSelectedDoctorForModal] = useState<any>(null);
    const [selectedAptForDetails, setSelectedAptForDetails] = useState<any>(null);
    const [selectedAptForEHR, setSelectedAptForEHR] = useState<any>(null);

    useEffect(() => {
        // Request browser notification permission
        if ("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") {
            Notification.requestPermission();
        }

        if (window.Echo) {
            const channel = window.Echo.channel('queue');
            channel.listen('AppointmentUpdated', (e: any) => {
                router.reload({ only: ['appointments'] });
                
                // Show a toast message
                window.dispatchEvent(new CustomEvent('show-toast', { 
                    detail: { 
                        message: e.message || "Your appointment status was updated.", 
                        type: 'success' 
                    } 
                }));

                // Try to play a notification beep
                try {
                    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
                    const oscillator = audioCtx.createOscillator();
                    const gainNode = audioCtx.createGain();
                    oscillator.type = 'sine';
                    oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
                    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
                    oscillator.connect(gainNode);
                    gainNode.connect(audioCtx.destination);
                    oscillator.start();
                    oscillator.stop(audioCtx.currentTime + 0.15);
                    
                    setTimeout(() => {
                        const osc2 = audioCtx.createOscillator();
                        const gain2 = audioCtx.createGain();
                        osc2.type = 'sine';
                        osc2.frequency.setValueAtTime(1046.50, audioCtx.currentTime); // C6
                        gain2.gain.setValueAtTime(0.1, audioCtx.currentTime);
                        osc2.connect(gain2);
                        gain2.connect(audioCtx.destination);
                        osc2.start();
                        osc2.stop(audioCtx.currentTime + 0.2);
                    }, 200);
                } catch (err) {
                    console.error('Audio play prevented', err);
                }

                // Show browser notification
                if ("Notification" in window && Notification.permission === "granted") {
                    new Notification("JanjiCare", {
                        body: e.message || "There is an update to your appointment status.",
                    });
                }
            });

            return () => {
                window.Echo.leaveChannel('queue');
            };
        }
    }, []);


    const getLocalDateString = (d: Date) => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const todayStr = getLocalDateString(new Date());

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = getLocalDateString(tomorrow);

    // Calculate metrics
    const upcomingAppointments = (appointments || []).filter((apt: any) => {
        const isActive = apt.status === 'in_progress' || apt.checked_in;
        return (apt.date >= todayStr || isActive) && apt.status !== 'rejected' && apt.status !== 'completed';
    });

    // Find active waiting room queue appointment today
    const activeQueueAppointment = (appointments || []).find((apt: any) => {
        const isTodayOrActive = apt.date === todayStr || apt.status === 'in_progress';
        return isTodayOrActive && apt.checked_in && apt.status === 'confirmed' && apt.queue_info !== null;
    });

    // Sort upcoming appointments ascending (earliest first)
    const sortedUpcoming = [...upcomingAppointments].sort((a: any, b: any) => {
        const dateA = new Date(a.date + 'T' + (a.schedule?.time || '00:00:00')).getTime();
        const dateB = new Date(b.date + 'T' + (b.schedule?.time || '00:00:00')).getTime();
        return dateA - dateB;
    });

    const getGreetingMessage = () => {
        if (sortedUpcoming.length === 0) {
            return (
                <span>
                    You don't have any upcoming appointments scheduled.
                </span>
            );
        }

        const nextApt = sortedUpcoming[0];
        const timeStr = formatTime12Hour(nextApt.schedule?.time);
        const doctorName = nextApt.schedule?.doctor?.user?.name || 'Unknown';

        if (nextApt.status === 'in_progress') {
            return (
                <span>
                    Your doctor is <span className="font-extrabold text-teal-600">ready for you now</span>.
                </span>
            );
        } else if (nextApt.date === todayStr) {
            return (
                <span>
                    You have an appointment <span className="font-extrabold text-blue-600">today at {timeStr}</span> with Dr. {doctorName}.
                </span>
            );
        } else if (nextApt.date === tomorrowStr) {
            return (
                <span>
                    You have an appointment <span className="font-extrabold text-blue-600">tomorrow at {timeStr}</span> with Dr. {doctorName}.
                </span>
            );
        } else {
            const formattedDate = new Date(nextApt.date).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
            });
            return (
                <span>
                    Your next appointment is on <span className="font-extrabold text-blue-600">{formattedDate} at {timeStr}</span> with Dr. {doctorName}.
                </span>
            );
        }
    };

    const totalAppointments = appointments.length;
    const uniqueDoctorsCount = new Set(
        appointments.map((apt: any) => apt.schedule?.doctor?.id).filter(Boolean)
    ).size;

    const sortedAppointments = useMemo(() => {
        if (!appointments || appointments.length === 0) return [];

        const getPriority = (apt: any): number => {
            const isToday = apt.date === todayStr;
            // Tier 1: Active virtual call — patient must join NOW
            if (apt.status === 'in_progress' && apt.schedule?.type === 'virtual') return 0;
            // Tier 2: In-progress clinic consultation
            if (apt.status === 'in_progress') return 1;
            // Tier 3: Checked in today & waiting in queue
            if (isToday && apt.checked_in && apt.status === 'confirmed') return 2;
            // Tier 4: Confirmed upcoming
            if (apt.status === 'confirmed') return 3;
            // Tier 5: Pending (awaiting confirmation)
            if (apt.status === 'pending') return 4;
            // Tier 6: Completed / rejected — sort newest first within this tier
            return 5;
        };

        return [...appointments].sort((a: any, b: any) => {
            const pa = getPriority(a);
            const pb = getPriority(b);
            if (pa !== pb) return pa - pb;

            // Within the same tier, sort by date descending (most recent first)
            // except for tiers 3-4 (upcoming) where we want ascending (soonest first)
            const dateA = new Date(a.date + 'T' + (a.schedule?.time || '00:00:00')).getTime();
            const dateB = new Date(b.date + 'T' + (b.schedule?.time || '00:00:00')).getTime();
            if (pa <= 2) return dateA - dateB; // active/today: soonest first
            if (pa <= 4) return dateA - dateB; // upcoming: soonest first
            return dateB - dateA;              // history: newest first
        });
    }, [appointments, todayStr]);


    return (
        <SidebarLayout
            user={auth.user}
        >
            <Head title="Patient Dashboard" />

            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6 lg:h-[calc(100vh-70px)] flex flex-col lg:overflow-hidden pb-8 lg:pb-0">

                {/* Welcome Banner */}
                <div className="relative overflow-hidden bg-white dark:bg-slate-800 p-5 md:p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col md:flex-row justify-between items-center gap-5 transition-all text-center md:text-left flex-shrink-0">
                    <div className="flex flex-col md:flex-row items-center gap-3 md:gap-4 w-full md:w-auto">
                        {/* Calendar Icon with Badge */}
                        <button
                            onClick={() => {
                                if (sortedUpcoming.length > 0) {
                                    setSelectedAptForDetails(sortedUpcoming[0]);
                                }
                            }}
                            className={`relative p-3 rounded-2xl text-blue-600 dark:text-blue-400 flex-shrink-0 transition-all outline-none outline-none focus:ring-0 active:outline-none group ${sortedUpcoming.length > 0 ? 'bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 cursor-pointer hover:shadow-md hover:-translate-y-0.5' : 'bg-gray-50 dark:bg-slate-700 cursor-default'}`}
                            title={sortedUpcoming.length > 0 ? "View Next Appointment" : "No upcoming appointments"}
                        >
                            <svg className={`w-6 h-6 md:w-7 md:h-7 transition-transform ${sortedUpcoming.length > 0 ? 'group-hover:scale-110 group-active:scale-95' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                            </svg>
                            {upcomingAppointments.length > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-slate-800 animate-bounce">
                                    {upcomingAppointments.length}
                                </span>
                            )}
                        </button>
                        <div>
                            <h3 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                                Welcome back, {auth.user.name}
                            </h3>
                            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1 md:mt-1.5 px-2 md:px-0 leading-relaxed">
                                {getGreetingMessage()}
                            </p>
                        </div>
                    </div>
                    <Link
                        href={route('patient.doctors.index')}
                        className="w-full md:w-auto h-10 md:h-11 px-4 md:px-5 text-sm md:text-base flex items-center justify-center gap-1.5 md:gap-2 bg-gradient-to-r from-teal-400 to-blue-600 dark:from-teal-600 dark:to-blue-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] md:hover:scale-105 transition-all whitespace-nowrap"
                    >
                        <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                        Book New Appointment
                    </Link>
                </div>

                {/* Live Queue Ticket */}
                {activeQueueAppointment && (
                    <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-700 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden flex-shrink-0">
                        {/* Background subtle graphics */}
                        <div className="absolute right-0 bottom-0 opacity-10 translate-x-12 translate-y-12">
                            <svg className="w-80 h-80" fill="currentColor" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="40" />
                            </svg>
                        </div>

                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                    <span className="text-xs font-black tracking-widest text-blue-200 capitalize">Live Queue Board</span>
                                </div>
                                <h3 className="text-xl md:text-2xl font-black tracking-tight">You are checked in & waiting</h3>
                                <p className="text-xs md:text-sm text-blue-100 max-w-md">
                                    Your consultation with <span className="font-bold text-white">Dr. {activeQueueAppointment.schedule?.doctor?.user?.name}</span> is active in the lobby queue.
                                </p>
                            </div>

                            <div className="grid grid-cols-3 gap-2 sm:gap-6 bg-white/10 backdrop-blur-md px-4 sm:px-6 py-4 rounded-2xl border border-white/10 w-full md:w-auto divide-x divide-white/20">
                                <div className="text-center px-2">
                                    <p className="text-[9px] sm:text-[10px] font-bold capitalize tracking-wider text-blue-200 line-clamp-1">Position</p>
                                    <p className="text-xl sm:text-3xl font-black text-white mt-1">#{activeQueueAppointment.queue_info?.position}</p>
                                </div>
                                <div className="text-center px-2">
                                    <p className="text-[9px] sm:text-[10px] font-bold capitalize tracking-wider text-blue-200 line-clamp-1">Ahead</p>
                                    <p className="text-xl sm:text-3xl font-black text-white mt-1">{activeQueueAppointment.queue_info?.patients_ahead}</p>
                                </div>
                                <div className="text-center px-2">
                                    <p className="text-[9px] sm:text-[10px] font-bold capitalize tracking-wider text-blue-200 line-clamp-1">Wait</p>
                                    <p className="text-lg sm:text-2xl font-black text-white mt-1">~{activeQueueAppointment.queue_info?.estimated_wait_minutes}m</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* KPI Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-shrink-0">
                    {/* Upcoming Appointments */}
                    <div className="group cursor-default">
                        <div className="relative h-full overflow-hidden bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-5 group-hover:shadow-xl group-hover:shadow-teal-500/10 group-hover:-translate-y-1 transform-gpu transition-all duration-300">
                            <div className="absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br from-teal-50 to-transparent dark:from-teal-500/10 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700 pointer-events-none"></div>
                            <div className="flex items-center justify-between relative z-10">
                                <div>
                                    <p className="text-[9px] md:text-[10px] font-bold text-gray-400 dark:text-gray-500 capitalize tracking-wider mb-1">Upcoming Consultations</p>
                                    <h3 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight">{upcomingAppointments.length}</h3>
                                </div>
                                <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-teal-400 to-emerald-500 dark:from-teal-600 dark:to-emerald-700 text-white flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300 shadow-md shadow-teal-500/30">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Total Bookings */}
                    <div className="group cursor-default">
                        <div className="relative h-full overflow-hidden bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-5 group-hover:shadow-xl group-hover:shadow-blue-500/10 group-hover:-translate-y-1 transform-gpu transition-all duration-300">
                            <div className="absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br from-blue-50 to-transparent dark:from-blue-500/10 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700 pointer-events-none"></div>
                            <div className="flex items-center justify-between relative z-10">
                                <div>
                                    <p className="text-[9px] md:text-[10px] font-bold text-gray-400 dark:text-gray-500 capitalize tracking-wider mb-1">Total Booked</p>
                                    <h3 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight">{totalAppointments}</h3>
                                </div>
                                <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-500 to-blue-600 text-white flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300 shadow-md shadow-blue-500/30">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Unique Doctors */}
                    <div className="group cursor-default">
                        <div className="relative h-full overflow-hidden bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-5 group-hover:shadow-xl group-hover:shadow-purple-500/10 group-hover:-translate-y-1 transform-gpu transition-all duration-300">
                            <div className="absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br from-purple-50 to-transparent dark:from-purple-500/10 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700 pointer-events-none"></div>
                            <div className="flex items-center justify-between relative z-10">
                                <div>
                                    <p className="text-[9px] md:text-[10px] font-bold text-gray-400 dark:text-gray-500 capitalize tracking-wider mb-1">Doctors Consulted</p>
                                    <h3 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight">{uniqueDoctorsCount}</h3>
                                </div>
                                <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-600 text-white flex items-center justify-center transform group-hover:-rotate-12 transition-transform duration-300 shadow-md shadow-purple-500/30">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Appointments Layout */}
                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden flex flex-col lg:flex-1 min-h-0">
                    <div className="px-6 py-5 border-b border-gray-100 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-gradient-to-r from-gray-50 to-white dark:from-slate-800 dark:to-slate-900">
                        <div>
                            <h3 className="font-bold text-gray-800 dark:text-slate-100">Your Appointment History</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Overview of all active and past consultations</p>
                        </div>
                        <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-full whitespace-nowrap self-start sm:self-auto">
                            {appointments.length} Total
                        </span>
                    </div>

                    <div className="p-4 md:p-6 flex flex-col lg:flex-1 min-h-0">
                        {(!appointments || appointments.length === 0) ? (
                            <div className="text-center h-auto min-h-[300px] flex flex-col justify-center items-center py-10">
                                <div className="mx-auto h-16 w-16 text-gray-300 dark:text-gray-600 mb-4">
                                    <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h4 className="font-bold text-gray-800 dark:text-slate-200">No appointments found</h4>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Book your first appointment to get started.</p>
                            </div>
                        ) : (
                            <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar min-h-0 pr-2 pb-2">
                                {sortedAppointments.map((apt: any) => {
                                    const isVirtualLive = apt.status === 'in_progress' && apt.schedule?.type === 'virtual';
                                    return (
                                        <div
                                            key={apt.id}
                                            onClick={() => setSelectedAptForDetails(apt)}
                                            className={`relative flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl cursor-pointer group/card transition-all duration-200 gap-4 ${
                                                isVirtualLive
                                                    ? 'border-2 border-purple-500/80 dark:border-purple-500/50 bg-gradient-to-r from-purple-50/90 to-indigo-50/80 dark:from-purple-950/20 dark:to-indigo-950/20 shadow-xl shadow-purple-500/10 dark:shadow-purple-950/30 hover:shadow-purple-500/20 dark:hover:shadow-purple-950/40 pt-9 pb-5 px-5'
                                                    : 'border border-gray-100 dark:border-slate-700/50 hover:bg-slate-50/50 dark:hover:bg-slate-700/30 hover:border-blue-200 dark:hover:border-blue-800/50 hover:shadow-md'
                                            }`}
                                            title="Click to view appointment status details"
                                        >
                                            {isVirtualLive && (
                                                <div className="absolute top-2.5 left-4 flex items-center gap-1.5 px-2.5 py-0.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[9px] font-black uppercase tracking-wider rounded-full shadow-md shadow-purple-500/30">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping"></span>
                                                    <span className="pt-[1.5px]">LIVE · Call In Progress</span>
                                                </div>
                                            )}
                                            <div className="flex items-center space-x-4">
                                                <div className="h-12 w-12 rounded-full overflow-hidden bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xl group-hover/card:scale-105 transition-transform duration-200 flex-shrink-0">
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
                                                    <h4 className="text-base font-bold text-gray-900 dark:text-white group-hover/card:text-blue-600 dark:group-hover/card:text-blue-400 transition-all">
                                                        Dr. {apt.schedule?.doctor?.user?.name || 'Unknown'}
                                                    </h4>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">
                                                        {new Date(apt.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at {formatTime12Hour(apt.schedule?.time)}
                                                    </p>
                                                    <div className="flex items-center gap-1.5 mt-1">
                                                        {apt.time_slot && (
                                                            <span className="inline-flex items-center px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-[10px] text-blue-600 dark:text-blue-400 font-bold rounded border border-blue-100 dark:border-blue-800/30">
                                                                Slot: {formatTime12Hour(apt.time_slot)}
                                                            </span>
                                                        )}
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-slate-700">
                                                            Apt #{apt.appointment_number}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col sm:items-end justify-between sm:justify-start gap-2 flex-shrink-0 mt-2 sm:mt-0 pt-3 sm:pt-0 border-t border-gray-100 dark:border-slate-700 sm:border-0 w-full sm:w-auto">
                                                <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto justify-between sm:justify-end">
                                                    <div className="flex flex-wrap items-center gap-1.5">
                                                        {isVirtualLive ? (
                                                            <>
                                                                {!!apt.checked_in && (
                                                                    <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200/50 dark:bg-teal-900/30 dark:text-teal-400 dark:border-teal-800/50">
                                                                        Arrived
                                                                    </span>
                                                                )}
                                                                <a
                                                                    href={route('telehealth.room', apt.id)}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white shadow-md shadow-purple-500/20 transition-all hover:scale-105 active:scale-95 cursor-pointer animate-pulse"
                                                                >
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                                                                    Join Video Call
                                                                </a>
                                                            </>
                                                        ) : (
                                                            <>
                                                                {apt.status === 'completed' && (
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setSelectedAptForEHR(apt);
                                                                        }}
                                                                        className="inline-flex items-center px-2.5 py-1 rounded text-xs font-black bg-teal-600 hover:bg-teal-700 dark:bg-teal-700 dark:hover:bg-teal-600 text-white border border-teal-700 dark:border-teal-500 shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
                                                                    >
                                                                        View Rx/Notes
                                                                    </button>
                                                                )}
                                                                {!!apt.checked_in && (
                                                                    <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-black bg-teal-50 text-teal-700 border border-teal-200/50 dark:bg-teal-900/30 dark:text-teal-400 dark:border-teal-800/50">
                                                                        Arrived
                                                                    </span>
                                                                )}
                                                                <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-black border ${apt.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200/50 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50' :
                                                                        apt.status === 'confirmed' ? 'bg-blue-50 text-blue-700 border-blue-200/50 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/50' :
                                                                            apt.status === 'rejected' ? 'bg-rose-50 text-rose-700 border-rose-200/50 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800/50' :
                                                                                'bg-emerald-50 text-emerald-700 border-emerald-200/50 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/50'
                                                                    }`}>
                                                                    {apt.status ? apt.status.charAt(0).toUpperCase() + apt.status.slice(1) : 'Pending'}
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Doctor Details Modal */}
            <DoctorDetailsModal
                show={selectedDoctorForModal !== null}
                onClose={() => setSelectedDoctorForModal(null)}
                doctor={selectedDoctorForModal}
            />

            {/* Appointment Details Modal */}
            <AppointmentDetailsModal
                show={selectedAptForDetails !== null}
                onClose={() => setSelectedAptForDetails(null)}
                appointment={selectedAptForDetails}
            />

            {/* EHR Details Modal */}
            <Modal
                show={selectedAptForEHR !== null}
                onClose={() => setSelectedAptForEHR(null)}
                maxWidth="md"
            >
                {selectedAptForEHR && (
                    <div className="relative max-h-[90vh] flex flex-col bg-white dark:bg-slate-800 rounded-2xl overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-white dark:from-slate-800 to-transparent z-10 pointer-events-none"></div>

                        <button
                            onClick={() => setSelectedAptForEHR(null)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-rose-500 transition-all duration-300 hover:rotate-90 hover:scale-110 active:scale-95 bg-gray-50 hover:bg-rose-50 dark:bg-slate-700/50 dark:hover:bg-rose-900/30 p-1.5 rounded-full shadow-sm z-20"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>

                        <div className="p-8 overflow-y-auto custom-scrollbar relative z-0">
                            <div className="text-center mb-6">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Consultation EHR Record</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">JanjiCare Completed Consultation Note</p>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 mb-6 space-y-4">
                                <div className="flex flex-col sm:flex-row justify-between text-sm pb-3 border-b border-slate-200/60 dark:border-slate-700/60 gap-2">
                                    <div>
                                        <p className="text-xs text-slate-400 dark:text-slate-500 font-bold">DOCTOR</p>
                                        <p className="font-extrabold text-slate-800 dark:text-slate-200 mt-0.5">Dr. {selectedAptForEHR.schedule?.doctor?.user?.name}</p>
                                        <p className="text-xs text-blue-600 dark:text-blue-400 font-bold">{selectedAptForEHR.schedule?.doctor?.specialty?.name}</p>
                                    </div>
                                    <div className="sm:text-right">
                                        <p className="text-xs text-slate-400 dark:text-slate-500 font-bold">DATE & TIME</p>
                                        <p className="font-extrabold text-slate-800 dark:text-slate-200 mt-0.5">
                                            {new Date(selectedAptForEHR.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{formatTime12Hour(selectedAptForEHR.schedule?.time)}</p>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 capitalize tracking-wider">Diagnosis</h4>
                                    <p className="text-sm font-extrabold text-slate-900 dark:text-white bg-teal-50/50 dark:bg-teal-900/20 border border-teal-100/50 dark:border-teal-800/30 p-3 rounded-xl mt-1.5 leading-relaxed">
                                        {selectedAptForEHR.diagnosis || 'No diagnosis recorded.'}
                                    </p>
                                </div>

                                <div>
                                    <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 capitalize tracking-wider">Prescriptions</h4>
                                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 bg-blue-50/30 dark:bg-blue-900/20 border border-blue-100/30 dark:border-blue-800/30 p-3 rounded-xl mt-1.5 whitespace-pre-line leading-relaxed font-mono">
                                        {selectedAptForEHR.prescriptions || 'No prescription written.'}
                                    </p>
                                </div>

                                <div>
                                    <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 capitalize tracking-wider">Clinical Notes</h4>
                                    <p className="text-sm text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-3 rounded-xl mt-1.5 whitespace-pre-line leading-relaxed">
                                        {selectedAptForEHR.notes || 'No doctor notes.'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </SidebarLayout>
    );
}

