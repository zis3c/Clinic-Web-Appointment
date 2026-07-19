import React from 'react';
import { Head } from '@inertiajs/react';
import SidebarLayout from '@/Layouts/SidebarLayout';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    BarElement,
    Filler
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

export default function Analytics({ auth, stats, charts }: any) {
    const isDark = document.documentElement.classList.contains('dark');

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index' as const, intersect: false },
        plugins: {
            legend: {
                display: false // Hide legend for line chart for cleaner look
            },
            tooltip: {
                backgroundColor: isDark ? '#1e293b' : '#ffffff',
                titleColor: isDark ? '#f8fafc' : '#0f172a',
                bodyColor: isDark ? '#cbd5e1' : '#475569',
                borderColor: isDark ? '#334155' : '#e2e8f0',
                borderWidth: 1,
                padding: 12,
                boxPadding: 6,
                usePointStyle: true,
                titleFont: { size: 14, weight: 'bold' as const, family: 'sans-serif' },
                bodyFont: { size: 13, family: 'sans-serif' }
            }
        },
        scales: {
            y: {
                grid: { color: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', borderDash: [5, 5] },
                ticks: { color: isDark ? '#64748b' : '#94a3b8', padding: 10 },
                border: { display: false }
            },
            x: {
                grid: { display: false },
                ticks: { color: isDark ? '#64748b' : '#94a3b8', padding: 10 },
                border: { display: false }
            }
        }
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right' as const,
                labels: {
                    color: isDark ? '#94a3b8' : '#475569',
                    padding: 20,
                    usePointStyle: true,
                    pointStyle: 'circle',
                    font: { family: 'sans-serif', weight: 'bold' as const }
                }
            },
            tooltip: {
                backgroundColor: isDark ? '#1e293b' : '#ffffff',
                titleColor: isDark ? '#f8fafc' : '#0f172a',
                bodyColor: isDark ? '#cbd5e1' : '#475569',
                borderColor: isDark ? '#334155' : '#e2e8f0',
                borderWidth: 1,
                padding: 12,
                boxPadding: 6,
                usePointStyle: true,
                bodyFont: { size: 13, family: 'sans-serif' }
            }
        },
        cutout: '75%',
        hoverOffset: 10
    };

    const centerTextPlugin = {
        id: 'centerText',
        beforeDraw(chart: any) {
            const { ctx, chartArea } = chart;
            if (!chartArea) return;
            const { top, left, width, height } = chartArea;
            ctx.save();
            
            const isDarkMode = document.documentElement.classList.contains('dark');
            
            const text = stats.totalAppointments.toString();
            ctx.font = '900 32px sans-serif';
            ctx.fillStyle = isDarkMode ? '#ffffff' : '#0f172a';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const textX = left + (width / 2);
            const textY = top + (height / 2) - 10;
            ctx.fillText(text, textX, textY);
            
            const subText = 'Total';
            ctx.font = '600 13px sans-serif';
            ctx.fillStyle = isDarkMode ? '#94a3b8' : '#64748b';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(subText, textX, textY + 26);
            
            ctx.restore();
        }
    };

    const trendData = {
        labels: charts.trend.labels,
        datasets: [
            {
                label: 'Appointments',
                data: charts.trend.data,
                borderColor: '#3b82f6',
                backgroundColor: (context: any) => {
                    const chart = context.chart;
                    if (!chart || !chart.ctx) return 'rgba(59, 130, 246, 0.1)';
                    const ctx = chart.ctx;
                    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
                    gradient.addColorStop(0, 'rgba(59, 130, 246, 0.4)');
                    gradient.addColorStop(1, 'rgba(59, 130, 246, 0.0)');
                    return gradient;
                },
                borderWidth: 3,
                tension: 0.5,
                fill: true,
                pointBackgroundColor: '#ffffff',
                pointBorderColor: '#3b82f6',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6,
            }
        ]
    };

    const statusData = {
        labels: charts.status.labels.map((l: string) => l.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')),
        datasets: [
            {
                data: charts.status.data,
                backgroundColor: [
                    '#10b981', // completed (emerald)
                    '#f59e0b', // pending (amber)
                    '#3b82f6', // confirmed (blue)
                    '#ef4444', // cancelled (red)
                    '#8b5cf6', // in_progress (violet)
                ],
                borderWidth: 0,
                hoverBorderColor: isDark ? '#1e293b' : '#ffffff',
                hoverBorderWidth: 4,
            }
        ]
    };

    return (
        <SidebarLayout user={auth.user}>
            <Head title="Clinic Analytics" />
            
            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white dark:bg-slate-800 p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 transition-all print:hidden gap-4 md:gap-0 mb-8">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 dark:text-slate-100">Clinic Analytics &amp; Reports</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Overview of system metrics and recent activity.</p>
                    </div>
                    <button className="h-11 px-5 flex items-center justify-center gap-2 bg-gradient-to-r from-teal-400 to-blue-600 dark:from-teal-600 dark:to-blue-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/40 outline-none w-full md:w-auto whitespace-nowrap">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                        Export to PDF
                    </button>
                </div>

                {/* Top Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
                    <div className="group bg-white dark:bg-slate-800 rounded-2xl p-4 md:p-5 shadow-sm hover:shadow-xl border border-gray-100 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-800 relative overflow-hidden transition-all duration-300 hover:-translate-y-1 flex items-center gap-4">
                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-50 dark:bg-blue-900/20 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500 z-0"></div>
                        <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/40 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 group-hover:rotate-3 transition-transform shrink-0 relative z-10">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                        </div>
                        <div className="relative z-10 flex-1">
                            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-semibold mb-0.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-all">Total Patients</h3>
                            <div className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white leading-tight">{stats.totalPatients}</div>
                        </div>
                    </div>
                    
                    <div className="group bg-white dark:bg-slate-800 rounded-2xl p-4 md:p-5 shadow-sm hover:shadow-xl border border-gray-100 dark:border-slate-700 hover:border-emerald-200 dark:hover:border-emerald-800 relative overflow-hidden transition-all duration-300 hover:-translate-y-1 flex items-center gap-4">
                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-50 dark:bg-emerald-900/20 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500 z-0"></div>
                        <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/40 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 group-hover:-rotate-3 transition-transform shrink-0 relative z-10">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                        </div>
                        <div className="relative z-10 flex-1">
                            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-semibold mb-0.5 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-all">Total Doctors</h3>
                            <div className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white leading-tight">{stats.totalDoctors}</div>
                        </div>
                    </div>

                    <div className="group bg-white dark:bg-slate-800 rounded-2xl p-4 md:p-5 shadow-sm hover:shadow-xl border border-gray-100 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-800 relative overflow-hidden transition-all duration-300 hover:-translate-y-1 flex items-center gap-4">
                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-indigo-50 dark:bg-indigo-900/20 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500 z-0"></div>
                        <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/40 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 group-hover:rotate-3 transition-transform shrink-0 relative z-10">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        </div>
                        <div className="relative z-10 flex-1">
                            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-semibold mb-0.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-all">Total Appointments</h3>
                            <div className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white leading-tight">{stats.totalAppointments}</div>
                        </div>
                    </div>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">7-Day Appointment Volume</h3>
                        <div className="h-[300px]">
                            <Line data={trendData} options={chartOptions} />
                        </div>
                    </div>
                    
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Appointment Status</h3>
                        <div className="h-[250px] flex-1 flex items-center justify-center relative">
                            {charts.status.labels.length > 0 ? (
                                <Doughnut data={statusData} options={doughnutOptions} plugins={[centerTextPlugin]} />
                            ) : (
                                <span className="text-gray-400">No data available</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Top Doctors */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 dark:border-slate-700">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Top Performing Doctors</h3>
                    </div>
                    <div className="overflow-x-auto hidden md:block">
                        <table className="w-full">
                            <thead className="bg-gray-50/80 dark:bg-slate-800/80 backdrop-blur-md sticky top-0 z-10 ring-1 ring-gray-200 dark:ring-slate-700">
                                <tr>
                                    <th className="px-6 py-4 text-center text-sm font-bold text-gray-500 dark:text-gray-400 w-12">#</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-500 dark:text-gray-400">Doctor</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-500 dark:text-gray-400">Specialty</th>
                                    <th className="px-6 py-4 text-right text-sm font-bold text-gray-500 dark:text-gray-400">Total Schedules</th>
                                    <th className="px-6 py-4 text-right text-sm font-bold text-gray-500 dark:text-gray-400">Total Patients Seen</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                                {charts.topDoctors.map((doctor: any, index: number) => (
                                    <tr key={doctor.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-all">
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold text-gray-400 dark:text-gray-500">
                                            {index + 1}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-400 font-bold">
                                                    {doctor.user.name.charAt(0)}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-bold text-gray-900 dark:text-white">Dr. {doctor.user.name}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-3 py-1 inline-flex text-xs font-bold rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400">
                                                {doctor.specialty.name}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-500 dark:text-gray-400">
                                            {doctor.total_schedules}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                                                {doctor.total_appointments}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {charts.topDoctors.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                                            No doctors found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile view for Top Doctors */}
                    <div className="md:hidden flex flex-col gap-3 p-4">
                        {charts.topDoctors.map((doctor: any, _index: any) => (
                            <div key={`mob-topdoc-${doctor.id}`} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/30 rounded-xl border border-gray-100 dark:border-slate-700">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-400 font-bold text-sm flex-shrink-0">
                                        {doctor.user.name.charAt(0)}
                                    </div>
                                    <div className="min-w-0 flex flex-col items-start">
                                        <div className="text-sm font-bold text-gray-900 dark:text-white truncate w-full">Dr. {doctor.user.name}</div>
                                        <span className="px-2 py-0.5 inline-flex text-[10px] font-bold rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 mt-0.5 truncate max-w-full">
                                            {doctor.specialty.name}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Sessions</span>
                                        <span className="font-bold text-gray-900 dark:text-slate-200 text-sm">{doctor.total_schedules}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Patients</span>
                                        <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">{doctor.total_appointments}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {charts.topDoctors.length === 0 && (
                            <div className="p-8 text-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-slate-700/30 rounded-2xl border border-gray-100 dark:border-slate-700">
                                No doctors found.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </SidebarLayout>
    );
}
