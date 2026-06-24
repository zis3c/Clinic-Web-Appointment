import SidebarLayout from '@/Layouts/SidebarLayout';
import { Head } from '@inertiajs/react';

export default function Reports({ auth, metrics, appointments_last_30_days, top_doctors, recent_appointments }: any) {
    
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
            header={<h2 className="font-semibold text-2xl text-gray-800 leading-tight print:hidden">System Reports</h2>}
        >
            <Head title="System Reports" />

            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6 print:max-w-none print:mx-0 print:px-8 print:space-y-0">
                
                {/* ===== SCREEN ONLY: Header Bar ===== */}
                <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 print:hidden">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">Clinic Analytics & Reports</h3>
                        <p className="text-sm text-gray-500">Overview of system metrics and recent activity.</p>
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
                <div className="flex gap-4 print:hidden">
                    <div className="flex-1 min-w-0 bg-gradient-to-br from-blue-50/60 to-white rounded-2xl shadow-sm border border-blue-100/50 p-4 hover:shadow-md hover:-translate-y-0.5 transition-all group flex justify-between items-center">
                        <div className="min-w-0">
                            <p className="text-[11px] font-bold text-blue-500 uppercase tracking-widest truncate">Doctors</p>
                            <h3 className="text-2xl font-black text-gray-900 mt-1">{metrics.total_doctors}</h3>
                        </div>
                        <div className="h-10 w-10 flex-shrink-0 rounded-xl bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/10 group-hover:scale-110 transition-transform">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </div>
                    </div>
                    <div className="flex-1 min-w-0 bg-gradient-to-br from-teal-50/60 to-white rounded-2xl shadow-sm border border-teal-100/50 p-4 hover:shadow-md hover:-translate-y-0.5 transition-all group flex justify-between items-center">
                        <div className="min-w-0">
                            <p className="text-[11px] font-bold text-teal-600 uppercase tracking-widest truncate">Patients</p>
                            <h3 className="text-2xl font-black text-gray-900 mt-1">{metrics.total_patients}</h3>
                        </div>
                        <div className="h-10 w-10 flex-shrink-0 rounded-xl bg-teal-500 flex items-center justify-center shadow-lg shadow-teal-500/10 group-hover:scale-110 transition-transform">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                        </div>
                    </div>
                    <div className="flex-1 min-w-0 bg-gradient-to-br from-purple-50/60 to-white rounded-2xl shadow-sm border border-purple-100/50 p-4 hover:shadow-md hover:-translate-y-0.5 transition-all group flex justify-between items-center">
                        <div className="min-w-0">
                            <p className="text-[11px] font-bold text-purple-600 uppercase tracking-widest truncate">Schedules</p>
                            <h3 className="text-2xl font-black text-gray-900 mt-1">{metrics.total_schedules}</h3>
                        </div>
                        <div className="h-10 w-10 flex-shrink-0 rounded-xl bg-purple-500 flex items-center justify-center shadow-lg shadow-purple-500/10 group-hover:scale-110 transition-transform">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        </div>
                    </div>
                    <div className="flex-1 min-w-0 bg-gradient-to-br from-rose-50/60 to-white rounded-2xl shadow-sm border border-rose-100/50 p-4 hover:shadow-md hover:-translate-y-0.5 transition-all group flex justify-between items-center">
                        <div className="min-w-0">
                            <p className="text-[11px] font-bold text-rose-500 uppercase tracking-widest truncate">Bookings (30d)</p>
                            <h3 className="text-2xl font-black text-gray-900 mt-1">{appointments_last_30_days}</h3>
                        </div>
                        <div className="h-10 w-10 flex-shrink-0 rounded-xl bg-rose-500 flex items-center justify-center shadow-lg shadow-rose-500/10 group-hover:scale-110 transition-transform">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
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
                {/* Most Active Doctors */}
                <div className="bg-white overflow-hidden shadow-sm rounded-2xl border border-gray-100 print:hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h3 className="text-lg font-bold text-gray-800">Most Active Doctors</h3>
                        <p className="text-sm text-gray-500">Top 5 doctors ranked by scheduled sessions.</p>
                    </div>
                    <div className="overflow-x-auto max-h-[calc(100vh-190px)] overflow-y-auto custom-scrollbar">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50 sticky top-0 z-10 ring-1 ring-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Rank</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Doctor</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Specialty</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Sessions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {top_doctors.map((doctor: any, index: any) => (
                                    <tr key={doctor.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm
                                                ${index === 0 ? 'bg-yellow-100 text-yellow-700' : 
                                                  index === 1 ? 'bg-gray-100 text-gray-600' : 
                                                  index === 2 ? 'bg-orange-100 text-orange-700' : 
                                                  'bg-gray-50 text-gray-400'}`}
                                            >
                                                {index + 1}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                                                    {doctor.user.name.charAt(0)}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-bold text-gray-900">{doctor.user.name}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {doctor.specialty.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-blue-50 text-blue-700">
                                                {doctor.schedules_count}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {top_doctors.length === 0 && (
                            <div className="p-10 text-center text-gray-500">No doctors found.</div>
                        )}
                    </div>
                </div>

                {/* Recent Appointments */}
                <div className="bg-white overflow-hidden shadow-sm rounded-2xl border border-gray-100 print:hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h3 className="text-lg font-bold text-gray-800">Recent Appointments</h3>
                        <p className="text-sm text-gray-500">Latest 10 bookings across the clinic.</p>
                    </div>
                    <div className="overflow-x-auto max-h-[calc(100vh-190px)] overflow-y-auto custom-scrollbar">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50 sticky top-0 z-10 ring-1 ring-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Patient</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Doctor</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Specialty</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date & Time</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {recent_appointments.map((appointment: any) => (
                                    <tr key={appointment.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                                                    {appointment.patient.user.name.charAt(0)}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-bold text-gray-900">{appointment.patient.user.name}</div>
                                                    <div className="text-sm text-gray-500">{appointment.patient.user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-bold text-gray-900">Dr. {appointment.schedule.doctor.user.name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {appointment.schedule.doctor.specialty.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-semibold text-gray-900">{new Date(appointment.schedule.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                                            <div className="text-sm text-gray-500">{appointment.schedule.time}</div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {recent_appointments.length === 0 && (
                            <div className="p-10 text-center text-gray-500">No recent appointments found.</div>
                        )}
                    </div>
                </div>

            </div>
        </SidebarLayout>
    );
}
