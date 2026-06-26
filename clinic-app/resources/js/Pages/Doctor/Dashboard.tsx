import { useState } from 'react';
import SidebarLayout from '@/Layouts/SidebarLayout';
import { Head, Link } from '@inertiajs/react';
import SessionDetailsModal from '@/Components/SessionDetailsModal';
import { formatTime12Hour } from '../../Utils/time';

export default function Dashboard({ auth, schedules = [], stats = { total_appointments: 0, total_schedules: 0, total_patients: 0 }, recent_appointments = [], waiting_room = [] }: any) {
    const [selectedSession, setSelectedSession] = useState(null);

    // Get only future schedules
    const upcomingSchedules = (schedules || []).filter((s: any) => new Date(s.date).getTime() >= new Date().setHours(0,0,0,0));

    return (
        <SidebarLayout
            user={auth.user}
            header={<h2 className="font-semibold text-2xl text-gray-800 leading-tight">Doctor Dashboard</h2>}
        >
            <Head title="Doctor Dashboard" />

            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6 h-[calc(100vh-140px)] lg:h-[calc(100vh-70px)] flex flex-col overflow-hidden">

                {/* Welcome Banner */}
                <div className="relative overflow-hidden bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <div className="relative p-3 bg-blue-50 rounded-2xl text-blue-600 flex-shrink-0">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                                Welcome back, Dr. {auth.user.name}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Manage consultations, schedules, and patient flow from here.
                            </p>
                        </div>
                    </div>
                    <Link
                        href={route('doctor.schedules.index')}
                        className="h-11 px-5 flex items-center justify-center gap-2 bg-gradient-to-r from-teal-400 to-blue-600 text-white font-bold rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all whitespace-nowrap"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                        Manage Schedules
                    </Link>
                </div>
                
                {/* KPI Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-shrink-0">
                    {/* Total Bookings */}
                    <div className="relative overflow-hidden bg-white rounded-2xl shadow-sm border border-gray-100 p-5 group hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-0.5 transition-all duration-300">
                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br from-blue-50 to-transparent rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700 pointer-events-none"></div>
                        <div className="flex items-center justify-between relative z-10">
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total Bookings</p>
                                <h3 className="text-3xl font-black text-gray-900 tracking-tight">{stats?.total_appointments ?? 0}</h3>
                            </div>
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-500 to-blue-600 text-white flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300 shadow-md shadow-blue-500/30">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                            </div>
                        </div>
                    </div>

                    {/* Active Sessions */}
                    <div className="relative overflow-hidden bg-white rounded-2xl shadow-sm border border-gray-100 p-5 group hover:shadow-xl hover:shadow-teal-500/10 hover:-translate-y-0.5 transition-all duration-300">
                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br from-teal-50 to-transparent rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700 pointer-events-none"></div>
                        <div className="flex items-center justify-between relative z-10">
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Active Sessions</p>
                                <h3 className="text-3xl font-black text-gray-900 tracking-tight">{stats?.total_schedules ?? 0}</h3>
                            </div>
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-teal-400 to-emerald-500 text-white flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300 shadow-md shadow-teal-500/30">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                            </div>
                        </div>
                    </div>

                    {/* Unique Patients */}
                    <div className="relative overflow-hidden bg-white rounded-2xl shadow-sm border border-gray-100 p-5 group hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-0.5 transition-all duration-300">
                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br from-purple-50 to-transparent rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700 pointer-events-none"></div>
                        <div className="flex items-center justify-between relative z-10">
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Unique Patients</p>
                                <h3 className="text-3xl font-black text-gray-900 tracking-tight">{stats?.total_patients ?? 0}</h3>
                            </div>
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-600 text-white flex items-center justify-center transform group-hover:-rotate-12 transition-transform duration-300 shadow-md shadow-purple-500/30">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Split layout: Active Waiting Room Queue & schedules */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                    
                    {/* Active Waiting Room Queue */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col lg:col-span-2 h-full min-h-0">
                        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-teal-50 to-white flex-shrink-0">
                            <div>
                                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                                    </span>
                                    Active Waiting Room
                                </h3>
                                <p className="text-xs text-gray-500">Patients arrived and ready for consultation (First-Come, First-Served)</p>
                            </div>
                            <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full">
                                {waiting_room.length} Waiting
                            </span>
                        </div>

                        <div className="divide-y divide-gray-100 flex-1 overflow-y-auto custom-scrollbar min-h-0 flex flex-col">
                            {waiting_room.map((apt: any, index: number) => {
                                const arrivalTime = apt.checked_in_at ? new Date(apt.checked_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
                                return (
                                    <div key={apt.id} className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-50/50 transition-all duration-200">
                                        <div className="flex items-center space-x-3.5">
                                            {/* Queue Number Indicator */}
                                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white font-extrabold text-sm shadow-sm">
                                                #{index + 1}
                                            </div>
                                            <div>
                                                <h5 className="font-bold text-sm text-gray-900 leading-tight">{apt.patient?.user?.name || 'Patient'}</h5>
                                                <p className="text-xs text-gray-400 font-semibold mt-1">
                                                    Checked in at {arrivalTime} • Appt #{apt.appointment_number}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                                            <span className="px-3 py-2 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold rounded-xl flex items-center">
                                                Session: {apt.schedule?.title}
                                            </span>
                                            <Link
                                                href={route('doctor.appointments.complete', apt.id)}
                                                method="patch"
                                                as="button"
                                                preserveScroll
                                                className="px-4 py-2 bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer"
                                            >
                                                Complete Consultation
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })}
                            {waiting_room.length === 0 && (
                                <div className="flex-1 flex flex-col justify-center items-center p-12 text-center">
                                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
                                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                                    </div>
                                    <h4 className="font-bold text-gray-800">Waiting Room Empty</h4>
                                    <p className="text-xs text-gray-400 mt-1">No checked-in patients are waiting at the moment.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Upcoming Schedules */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full min-h-0">
                        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-gray-50 to-white flex-shrink-0">
                            <div>
                                <h3 className="font-bold text-gray-800">Your Sessions</h3>
                                <p className="text-xs text-gray-500">Upcoming schedule list</p>
                            </div>
                            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                                {upcomingSchedules.length} Active
                            </span>
                        </div>
                        
                        <div className="divide-y divide-gray-100 flex-1 overflow-y-auto custom-scrollbar min-h-0 flex flex-col">
                            {upcomingSchedules.map((schedule: any) => (
                                <div key={schedule.id} className="p-4 flex flex-col justify-between hover:bg-blue-50/20 transition-all duration-200 gap-3">
                                    <div>
                                        <h5 className="font-bold text-sm text-gray-900 leading-tight">{schedule.title}</h5>
                                        <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-gray-400 font-medium">
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
                                        <span className={`px-2.5 py-0.5 inline-flex text-xs font-bold rounded-full ${(schedule.appointments?.length || 0) >= schedule.number_of_patients ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}`}>
                                            {schedule.appointments?.length || 0} / {schedule.number_of_patients} Booked
                                        </span>
                                        <button 
                                            onClick={() => setSelectedSession(schedule)}
                                            className="px-3 py-1.5 bg-slate-50 hover:bg-blue-50 text-blue-600 font-bold text-xs rounded-lg transition-colors duration-200"
                                        >
                                            Details
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {upcomingSchedules.length === 0 && (
                                <div className="flex-1 flex flex-col justify-center items-center p-12 text-center">
                                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100 text-gray-400">
                                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                    </div>
                                    <h4 className="font-bold text-gray-800">No Upcoming Schedules</h4>
                                    <p className="text-xs text-gray-400 mt-1">Please create schedules to start receiving appointments.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Session Details Modal */}
                <SessionDetailsModal 
                    selectedSession={selectedSession} 
                    onClose={() => setSelectedSession(null)} 
                />
            </div>
        </SidebarLayout>
    );
}
