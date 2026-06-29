import React, { useEffect, useState } from 'react';
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
import { Line, Doughnut, Bar } from 'react-chartjs-2';

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
        plugins: {
            legend: {
                labels: {
                    color: isDark ? '#94a3b8' : '#475569',
                    font: { family: 'sans-serif', weight: 'bold' as const }
                }
            }
        },
        scales: {
            y: {
                grid: { color: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' },
                ticks: { color: isDark ? '#94a3b8' : '#475569' }
            },
            x: {
                grid: { display: false },
                ticks: { color: isDark ? '#94a3b8' : '#475569' }
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
                    padding: 20
                }
            }
        },
        cutout: '70%'
    };

    const trendData = {
        labels: charts.trend.labels,
        datasets: [
            {
                label: 'Appointments',
                data: charts.trend.data,
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 3,
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#3b82f6',
            }
        ]
    };

    const statusData = {
        labels: charts.status.labels.map((l: string) => l.charAt(0).toUpperCase() + l.slice(1)),
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
            }
        ]
    };

    return (
        <SidebarLayout user={auth.user}>
            <Head title="Clinic Analytics" />
            
            <div className="p-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Clinic Analytics</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Comprehensive overview of clinic performance and patient volumes.</p>
                </div>

                {/* Top Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 relative overflow-hidden">
                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-50 dark:bg-blue-900/20 rounded-full blur-xl"></div>
                        <h3 className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">Total Patients</h3>
                        <div className="text-4xl font-black text-gray-900 dark:text-white">{stats.totalPatients}</div>
                    </div>
                    
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 relative overflow-hidden">
                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-50 dark:bg-emerald-900/20 rounded-full blur-xl"></div>
                        <h3 className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">Total Doctors</h3>
                        <div className="text-4xl font-black text-gray-900 dark:text-white">{stats.totalDoctors}</div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 relative overflow-hidden">
                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-indigo-50 dark:bg-indigo-900/20 rounded-full blur-xl"></div>
                        <h3 className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">Total Appointments</h3>
                        <div className="text-4xl font-black text-gray-900 dark:text-white">{stats.totalAppointments}</div>
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
                        <div className="h-[250px] flex-1 flex items-center justify-center">
                            {charts.status.labels.length > 0 ? (
                                <Doughnut data={statusData} options={doughnutOptions} />
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
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-slate-900/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Doctor</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Specialty</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Schedules</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Patients Seen</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                                {charts.topDoctors.map((doctor: any) => (
                                    <tr key={doctor.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
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
                </div>
            </div>
        </SidebarLayout>
    );
}
