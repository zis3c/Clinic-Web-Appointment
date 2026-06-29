import SidebarLayout from '@/Layouts/SidebarLayout';
import { Head } from '@inertiajs/react';

export default function Reports({ auth, metrics, appointments_last_30_days, top_doctors, recent_appointments }: any) {
    
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

    const handlePrint = () => {
        window.print();
    };

    const reportDate = new Date().toLocaleDateString('en-US', { 
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
    });
    const reportTime = new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', minute: '2-digit' 
    });

    return (
        <SidebarLayout
            user={auth.user}
            header={<h2 className="font-semibold text-2xl text-gray-800 dark:text-slate-100 leading-tight print:hidden">System Reports</h2>}
        >
            <Head title="System Reports" />

            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-4 print:max-w-none print:mx-0 print:px-8 print:space-y-0 h-[calc(100vh-140px)] lg:h-[calc(100vh-70px)] flex flex-col overflow-hidden">
                
                {/* ===== SCREEN ONLY: Header Bar ===== */}
                <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 transition-colors print:hidden">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 dark:text-slate-100">Clinic Analytics & Reports</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Overview of system metrics and recent activity.</p>
                    </div>
                    <button 
                        onClick={handlePrint}
                        className="h-11 px-5 flex items-center justify-center gap-2 bg-gradient-to-r from-teal-400 to-blue-600 text-white font-bold rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all whitespace-nowrap"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                        Export to PDF
                    </button>
                </div>

                {/* ===== SCREEN ONLY: KPI Cards ===== */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 print:hidden">
                    {/* Card 1: Doctors */}
                    <div className="relative overflow-hidden bg-gradient-to-br from-blue-500/5 via-white to-white dark:from-blue-900/20 dark:via-slate-800 dark:to-slate-800 rounded-2xl shadow-sm border-t border-r border-b border-gray-100 dark:border-slate-700 border-l-4 border-l-blue-600 p-4 hover:shadow-md hover:-translate-y-0.5 transition-all group flex justify-between items-center">
                        <div className="min-w-0">
                            <p className="text-[10px] font-bold text-blue-500/80 dark:text-blue-400 uppercase tracking-widest truncate">Doctors</p>
                            <h3 className="text-3xl font-black bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-400 dark:to-blue-600 bg-clip-text text-transparent mt-1.5">{metrics.total_doctors}</h3>
                            <p className="text-[10px] text-gray-400 font-semibold mt-1 flex items-center gap-1">
                                <span className="text-emerald-500 font-black">↑</span> Active staff
                            </p>
                        </div>
                        <div className="h-10 w-10 flex-shrink-0 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-800/30 group-hover:scale-110 transition-transform">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </div>
                    </div>

                    {/* Card 2: Patients */}
                    <div className="relative overflow-hidden bg-gradient-to-br from-teal-500/5 via-white to-white dark:from-teal-900/20 dark:via-slate-800 dark:to-slate-800 rounded-2xl shadow-sm border-t border-r border-b border-gray-100 dark:border-slate-700 border-l-4 border-l-teal-600 p-4 hover:shadow-md hover:-translate-y-0.5 transition-all group flex justify-between items-center">
                        <div className="min-w-0">
                            <p className="text-[10px] font-bold text-teal-600/80 dark:text-teal-400 uppercase tracking-widest truncate">Patients</p>
                            <h3 className="text-3xl font-black bg-gradient-to-r from-teal-600 to-teal-800 dark:from-teal-400 dark:to-teal-600 bg-clip-text text-transparent mt-1.5">{metrics.total_patients}</h3>
                            <p className="text-[10px] text-gray-400 font-semibold mt-1 flex items-center gap-1">
                                <span className="text-emerald-500 font-black">↑</span> Registered patients
                            </p>
                        </div>
                        <div className="h-10 w-10 flex-shrink-0 rounded-xl bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 flex items-center justify-center border border-teal-100 dark:border-teal-800/30 group-hover:scale-110 transition-transform">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                        </div>
                    </div>

                    {/* Card 3: Schedules */}
                    <div className="relative overflow-hidden bg-gradient-to-br from-purple-500/5 via-white to-white dark:from-purple-900/20 dark:via-slate-800 dark:to-slate-800 rounded-2xl shadow-sm border-t border-r border-b border-gray-100 dark:border-slate-700 border-l-4 border-l-purple-600 p-4 hover:shadow-md hover:-translate-y-0.5 transition-all group flex justify-between items-center">
                        <div className="min-w-0">
                            <p className="text-[10px] font-bold text-purple-600/80 dark:text-purple-400 uppercase tracking-widest truncate">Schedules</p>
                            <h3 className="text-3xl font-black bg-gradient-to-r from-purple-600 to-purple-800 dark:from-purple-400 dark:to-purple-600 bg-clip-text text-transparent mt-1.5">{metrics.total_schedules}</h3>
                            <p className="text-[10px] text-gray-400 font-semibold mt-1 flex items-center gap-1">
                                <span className="text-indigo-500 font-black">●</span> Total sessions
                            </p>
                        </div>
                        <div className="h-10 w-10 flex-shrink-0 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-100 dark:border-purple-800/30 group-hover:scale-110 transition-transform">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        </div>
                    </div>

                    {/* Card 4: Bookings (30d) */}
                    <div className="relative overflow-hidden bg-gradient-to-br from-rose-500/5 via-white to-white dark:from-rose-900/20 dark:via-slate-800 dark:to-slate-800 rounded-2xl shadow-sm border-t border-r border-b border-gray-100 dark:border-slate-700 border-l-4 border-l-rose-600 p-4 hover:shadow-md hover:-translate-y-0.5 transition-all group flex justify-between items-center">
                        <div className="min-w-0">
                            <p className="text-[10px] font-bold text-rose-500/80 dark:text-rose-400 uppercase tracking-widest truncate">Bookings (30d)</p>
                            <h3 className="text-3xl font-black bg-gradient-to-r from-rose-600 to-rose-800 dark:from-rose-400 dark:to-rose-600 bg-clip-text text-transparent mt-1.5">{appointments_last_30_days}</h3>
                            <p className="text-[10px] text-gray-400 font-semibold mt-1 flex items-center gap-1">
                                <span className="text-emerald-500 font-black">↑</span> Past 30 days
                            </p>
                        </div>
                        <div className="h-10 w-10 flex-shrink-0 rounded-xl bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-100 dark:border-rose-800/30 group-hover:scale-110 transition-transform">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
                        </div>
                    </div>
                </div>

                {/* ===== PRINT ONLY: Formal Document Layout ===== */}
                <div className="hidden print:block">
                    {/* Letterhead */}
                    <div className="border-b-2 border-gray-900 pb-4 mb-6">
                        <div className="flex justify-between items-end">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">JanjiCare</h1>
                                <p className="text-xs text-gray-500 mt-0.5">Clinic Management System</p>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-bold text-gray-900">System Analytics Report</p>
                                <p className="text-xs text-gray-500">{reportDate} · {reportTime}</p>
                            </div>
                        </div>
                    </div>

                    {/* Section 1: Executive Summary */}
                    <div className="mb-6">
                        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest border-b border-gray-300 pb-1 mb-3">1. Executive Summary</h2>
                        <p className="text-xs text-gray-600 mb-3">Overview of key performance indicators for the clinic system as of the report generation date.</p>
                        <table className="w-full text-xs border border-gray-300">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="text-left px-3 py-2 font-bold text-gray-700 border-b border-gray-300">Metric</th>
                                    <th className="text-right px-3 py-2 font-bold text-gray-700 border-b border-gray-300">Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-gray-200">
                                    <td className="px-3 py-1.5 text-gray-700">Total Registered Doctors</td>
                                    <td className="px-3 py-1.5 text-right font-bold text-gray-900">{metrics.total_doctors}</td>
                                </tr>
                                <tr className="border-b border-gray-200 bg-gray-50">
                                    <td className="px-3 py-1.5 text-gray-700">Total Registered Patients</td>
                                    <td className="px-3 py-1.5 text-right font-bold text-gray-900">{metrics.total_patients}</td>
                                </tr>
                                <tr className="border-b border-gray-200">
                                    <td className="px-3 py-1.5 text-gray-700">Total Scheduled Sessions</td>
                                    <td className="px-3 py-1.5 text-right font-bold text-gray-900">{metrics.total_schedules}</td>
                                </tr>
                                <tr className="border-b border-gray-200 bg-gray-50">
                                    <td className="px-3 py-1.5 text-gray-700">Total Appointments (All Time)</td>
                                    <td className="px-3 py-1.5 text-right font-bold text-gray-900">{metrics.total_appointments}</td>
                                </tr>
                                <tr>
                                    <td className="px-3 py-1.5 text-gray-700">Appointments in Last 30 Days</td>
                                    <td className="px-3 py-1.5 text-right font-bold text-gray-900">{appointments_last_30_days}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Section 2: Doctor Performance */}
                    <div className="mb-6">
                        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest border-b border-gray-300 pb-1 mb-3">2. Doctor Activity Ranking</h2>
                        <p className="text-xs text-gray-600 mb-3">Top 5 doctors ranked by number of scheduled availability sessions.</p>
                        <table className="w-full text-xs border border-gray-300">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="text-left px-3 py-2 font-bold text-gray-700 border-b border-gray-300 w-12">No.</th>
                                    <th className="text-left px-3 py-2 font-bold text-gray-700 border-b border-gray-300">Doctor Name</th>
                                    <th className="text-left px-3 py-2 font-bold text-gray-700 border-b border-gray-300">Specialty</th>
                                    <th className="text-right px-3 py-2 font-bold text-gray-700 border-b border-gray-300">Sessions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {top_doctors.map((doctor: any, index: any) => (
                                    <tr key={doctor.id} className={`border-b border-gray-200 ${index % 2 === 1 ? 'bg-gray-50' : ''}`}>
                                        <td className="px-3 py-1.5 text-gray-700">{index + 1}</td>
                                        <td className="px-3 py-1.5 font-semibold text-gray-900">{doctor.user.name}</td>
                                        <td className="px-3 py-1.5 text-gray-700">{doctor.specialty.name}</td>
                                        <td className="px-3 py-1.5 text-right font-bold text-gray-900">{doctor.schedules_count}</td>
                                    </tr>
                                ))}
                                {top_doctors.length === 0 && (
                                    <tr><td colSpan={4} className="px-3 py-3 text-center text-gray-500 italic">No doctor data available.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Section 3: Recent Appointments */}
                    <div className="mb-6">
                        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest border-b border-gray-300 pb-1 mb-3">3. Recent Appointment Records</h2>
                        <p className="text-xs text-gray-600 mb-3">The 10 most recent patient bookings across all departments.</p>
                        <table className="w-full text-xs border border-gray-300">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="text-left px-3 py-2 font-bold text-gray-700 border-b border-gray-300 w-8">No.</th>
                                    <th className="text-left px-3 py-2 font-bold text-gray-700 border-b border-gray-300">Patient</th>
                                    <th className="text-left px-3 py-2 font-bold text-gray-700 border-b border-gray-300">Doctor</th>
                                    <th className="text-left px-3 py-2 font-bold text-gray-700 border-b border-gray-300">Specialty</th>
                                    <th className="text-left px-3 py-2 font-bold text-gray-700 border-b border-gray-300">Date</th>
                                    <th className="text-left px-3 py-2 font-bold text-gray-700 border-b border-gray-300">Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recent_appointments.map((appointment: any, index: any) => (
                                    <tr key={appointment.id} className={`border-b border-gray-200 ${index % 2 === 1 ? 'bg-gray-50' : ''}`}>
                                        <td className="px-3 py-1.5 text-gray-700">{index + 1}</td>
                                        <td className="px-3 py-1.5 font-semibold text-gray-900">{appointment.patient.user.name}</td>
                                        <td className="px-3 py-1.5 text-gray-700">Dr. {appointment.schedule.doctor.user.name}</td>
                                        <td className="px-3 py-1.5 text-gray-700">{appointment.schedule.doctor.specialty.name}</td>
                                        <td className="px-3 py-1.5 text-gray-700">{new Date(appointment.schedule.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                                        <td className="px-3 py-1.5 text-gray-700">{appointment.schedule.time}</td>
                                    </tr>
                                ))}
                                {recent_appointments.length === 0 && (
                                    <tr><td colSpan={6} className="px-3 py-3 text-center text-gray-500 italic">No appointment records available.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Document Footer */}
                    <div className="border-t border-gray-300 pt-3 mt-8 flex justify-between text-[10px] text-gray-400">
                        <span>JanjiCare Clinic Management System — Confidential</span>
                        <span>Report generated by {auth.user.name} on {reportDate}</span>
                    </div>
                </div>

                {/* ===== SCREEN ONLY: Tables ===== */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:hidden flex-1 min-h-0">
                    {/* Most Active Doctors */}
                    <div className="bg-white dark:bg-slate-800 overflow-hidden shadow-sm rounded-2xl border border-gray-100 dark:border-slate-700 flex flex-col h-full min-h-0 transition-colors">
                        <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex-shrink-0">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-slate-100">Most Active Doctors</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Top 5 doctors ranked by scheduled sessions.</p>
                        </div>
                        <div className="overflow-x-auto overflow-y-auto custom-scrollbar flex-1 min-h-0">
                            <table className="min-w-full min-w-[500px] divide-y divide-gray-200 dark:divide-slate-700">
                                <thead className="bg-gray-50 dark:bg-slate-800/80 sticky top-0 z-10 ring-1 ring-gray-200 dark:ring-slate-700">
                                    <tr>
                                        <th className="pl-8 pr-4 py-3.5 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-16">Rank</th>
                                        <th className="px-4 py-3.5 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Doctor</th>
                                        <th className="pl-6 pr-8 py-3.5 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Sessions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                                    {top_doctors.map((doctor: any, index: any) => (
                                        <tr key={doctor.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                                            <td className="pl-8 pr-4 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full font-bold text-[10px] flex-shrink-0
                                                    ${index === 0 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' : 
                                                      index === 1 ? 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300' : 
                                                      index === 2 ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' : 
                                                      'bg-gray-50 dark:bg-slate-800 text-gray-400 dark:text-gray-500'}`}
                                                >
                                                    {index + 1}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-700 dark:text-blue-400 font-bold text-xs flex-shrink-0">
                                                        {doctor.user.name.charAt(0)}
                                                    </div>
                                                    <div className="text-sm font-bold text-gray-900 dark:text-slate-100">{doctor.user.name}</div>
                                                </div>
                                            </td>
                                            <td className="pl-6 pr-8 py-4 whitespace-nowrap text-right">
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                                                    {doctor.schedules_count}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {top_doctors.length === 0 && (
                                <div className="flex-1 flex flex-col justify-center items-center p-10 text-center text-gray-500 dark:text-gray-400">No doctors found.</div>
                            )}
                        </div>
                    </div>

                    {/* Recent Appointments */}
                    <div className="bg-white dark:bg-slate-800 overflow-hidden shadow-sm rounded-2xl border border-gray-100 dark:border-slate-700 flex flex-col h-full min-h-0 transition-colors">
                        <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex-shrink-0">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-slate-100">Recent Appointments</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Latest 10 bookings across the clinic.</p>
                        </div>
                        <div className="overflow-x-auto overflow-y-auto custom-scrollbar flex-1 min-h-0">
                            <table className="min-w-full min-w-[500px] divide-y divide-gray-200 dark:divide-slate-700">
                                <thead className="bg-gray-50 dark:bg-slate-800/80 sticky top-0 z-10 ring-1 ring-gray-200 dark:ring-slate-700">
                                    <tr>
                                        <th className="pl-8 pr-4 py-3.5 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-16">Rank</th>
                                        <th className="px-4 py-3.5 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Patient</th>
                                        <th className="pl-6 pr-8 py-3.5 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Session</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                                    {recent_appointments.map((appointment: any, index: any) => (
                                        <tr key={appointment.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                                            <td className="pl-8 pr-4 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full font-bold text-[10px] flex-shrink-0
                                                    ${index === 0 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' : 
                                                      index === 1 ? 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300' : 
                                                      index === 2 ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' : 
                                                      'bg-gray-50 dark:bg-slate-800 text-gray-400 dark:text-gray-500'}`}
                                                >
                                                    {index + 1}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-700 dark:text-blue-400 font-bold text-xs flex-shrink-0">
                                                        {appointment.patient.user.name.charAt(0)}
                                                    </div>
                                                    <div className="ml-3">
                                                        <div className="text-sm font-bold text-gray-900 dark:text-slate-100">{appointment.patient.user.name}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="pl-6 pr-8 py-4 whitespace-nowrap text-right">
                                                <div className="text-sm font-semibold text-gray-900 dark:text-slate-100">{new Date(appointment.schedule.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{formatTime(appointment.schedule.time)}</div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {recent_appointments.length === 0 && (
                                <div className="flex-1 flex flex-col justify-center items-center p-10 text-center text-gray-500 dark:text-gray-400">No recent appointments found.</div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </SidebarLayout>
    );
}
