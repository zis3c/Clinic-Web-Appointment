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
    Filler
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
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
                label: 'Patients Seen',
                data: charts.trend.data,
                borderColor: '#10b981',
                backgroundColor: (context: any) => {
                    const chart = context.chart;
                    if (!chart || !chart.ctx) return 'rgba(16, 185, 129, 0.1)';
                    const ctx = chart.ctx;
                    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
                    gradient.addColorStop(0, 'rgba(16, 185, 129, 0.4)');
                    gradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)');
                    return gradient;
                },
                borderWidth: 3,
                tension: 0.5,
                fill: true,
                pointBackgroundColor: '#ffffff',
                pointBorderColor: '#10b981',
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
            <Head title="My Analytics" />
            
            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white dark:bg-slate-800 p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 transition-all print:hidden gap-4 md:gap-0 mb-8">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 dark:text-slate-100">My Analytics</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Comprehensive overview of your consultation performance.</p>
                    </div>
                </div>

                {/* Top Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8">
                    <div className="group bg-white dark:bg-slate-800 rounded-2xl p-4 md:p-5 shadow-sm hover:shadow-xl border border-gray-100 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-800 relative overflow-hidden transition-all duration-300 hover:-translate-y-1 flex items-center gap-4">
                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-50 dark:bg-blue-900/20 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500 z-0"></div>
                        <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/40 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 group-hover:rotate-3 transition-transform shrink-0 relative z-10">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        </div>
                        <div className="relative z-10 flex-1">
                            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-semibold mb-0.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-all">Total Appointments</h3>
                            <div className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white leading-tight">{stats.totalAppointments}</div>
                        </div>
                    </div>
                    
                    <div className="group bg-white dark:bg-slate-800 rounded-2xl p-4 md:p-5 shadow-sm hover:shadow-xl border border-gray-100 dark:border-slate-700 hover:border-emerald-200 dark:hover:border-emerald-800 relative overflow-hidden transition-all duration-300 hover:-translate-y-1 flex items-center gap-4">
                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-50 dark:bg-emerald-900/20 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500 z-0"></div>
                        <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/40 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 group-hover:-rotate-3 transition-transform shrink-0 relative z-10">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </div>
                        <div className="relative z-10 flex-1">
                            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-semibold mb-0.5 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-all">Completed Consultations</h3>
                            <div className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white leading-tight">{stats.completedAppointments}</div>
                        </div>
                    </div>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl p-5 md:p-6 shadow-sm border border-gray-100 dark:border-slate-700">
                        <h3 className="text-base md:text-lg font-bold text-gray-900 dark:text-white mb-4 md:mb-6">7-Day Consultation Volume</h3>
                        <div className="h-[250px] md:h-[300px]">
                            <Line data={trendData} options={chartOptions} />
                        </div>
                    </div>
                    
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 md:p-6 shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col">
                        <h3 className="text-base md:text-lg font-bold text-gray-900 dark:text-white mb-4 md:mb-6">Appointment Status</h3>
                        <div className="h-[250px] flex-1 flex items-center justify-center relative">
                            {charts.status.labels.length > 0 ? (
                                <Doughnut data={statusData} options={doughnutOptions} plugins={[centerTextPlugin]} />
                            ) : (
                                <span className="text-gray-400">No data available</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </SidebarLayout>
    );
}
