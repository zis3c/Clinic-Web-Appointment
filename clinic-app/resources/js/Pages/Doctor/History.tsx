import React, { useState } from 'react';
import { useAutoRefresh } from '@/hooks/useAutoRefresh';
import SidebarLayout from '@/Layouts/SidebarLayout';
import { Head } from '@inertiajs/react';
import CustomDatePicker from '@/Components/CustomDatePicker';
import CustomSelect from '@/Components/CustomSelect';

export default function History({ auth, appointments }: any) {
    useAutoRefresh(['appointments'], { pollingOnly: true });
    const [searchQuery, setSearchQuery] = useState('');
    const [filterDate, setFilterDate] = useState('');
    const [sortOrder, setSortOrder] = useState('newest');

    const filteredAppointments = appointments?.filter((apt: any) => {
        // Text Search
        const query = searchQuery.toLowerCase();
        const patientName = apt.patient?.user?.name?.toLowerCase() || '';
        const diagnosis = apt.diagnosis?.toLowerCase() || '';
        const prescriptions = apt.prescriptions?.toLowerCase() || '';
        const notes = apt.notes?.toLowerCase() || '';

        const matchesText = !query || 
               patientName.includes(query) || 
               diagnosis.includes(query) || 
               prescriptions.includes(query) || 
               notes.includes(query);
               
        // Date Filter (apt.date is usually 'YYYY-MM-DD')
        const matchesDate = !filterDate || apt.date === filterDate;

        return matchesText && matchesDate;
    }).sort((a: any, b: any) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return (
        <SidebarLayout
            user={auth.user}
        >
            <Head title="Consultation History" />

            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                
                {/* Header Actions */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 transition-colors">
                    <div className="w-full text-center md:text-left">
                        <h3 className="text-base md:text-lg font-bold text-gray-800 dark:text-slate-100">Consultation History</h3>
                        <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">View your past completed consultations with patients, diagnoses, and prescriptions.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                        <div className="flex-1 sm:flex-none sm:w-40 z-20 relative h-11">
                            <CustomSelect
                                value={sortOrder}
                                onChange={(val) => setSortOrder(val.toString())}
                                options={[
                                    { value: 'newest', label: 'Newest First' },
                                    { value: 'oldest', label: 'Oldest First' }
                                ]}
                                className="h-11 w-full rounded-xl border border-gray-200 dark:border-slate-700 text-sm px-3 shadow-sm hover:border-gray-300 dark:hover:border-slate-600 transition-colors"
                            />
                        </div>
                        <div className="relative flex-1 sm:flex-none">
                            <CustomDatePicker
                                value={filterDate}
                                onChange={(val: string) => setFilterDate(val)}
                                placeholder="Filter by date"
                                placement="bottom"
                                className="w-full min-w-[200px]"
                            />
                            {filterDate && (
                                <button 
                                    onClick={() => setFilterDate('')}
                                    className="absolute inset-y-0 right-8 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 z-10"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                </button>
                            )}
                        </div>
                        <div className="relative flex-1 sm:flex-none">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                            </div>
                            <input
                                type="text"
                                placeholder="Search history..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-11 pl-10 pr-4 border border-gray-200 dark:border-slate-700 rounded-xl text-sm transition-all w-full sm:w-64 bg-gray-50 dark:bg-slate-900/50 text-gray-700 dark:text-slate-200 placeholder-gray-400 dark:placeholder-gray-500"
                            />
                        </div>
                    </div>
                </div>

                {filteredAppointments && filteredAppointments.length > 0 ? (
                    <div className="relative border-l-[3px] border-blue-500/30 dark:border-blue-500/20 ml-3 md:ml-6 py-2">
                        {filteredAppointments.map((apt: any, _index: number) => {
                            const date = new Date(apt.date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
                            return (
                                <div key={apt.id} className="mb-8 ml-6 md:ml-8 relative group">
                                    {/* Timeline Node */}
                                    <div className="absolute w-6 h-6 bg-blue-500 rounded-full -left-[37px] md:-left-[45px] top-1.5 border-[3px] border-white dark:border-slate-900 flex items-center justify-center shadow-md shadow-blue-500/20 transition-transform duration-300 group-hover:scale-110 transform-gpu origin-center">
                                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                                        </svg>
                                    </div>

                                    {/* Content Card */}
                                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 md:p-6 shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-md transition-all duration-300">
                                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-5">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1.5">
                                                    <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-lg border border-blue-100 dark:border-blue-800/50">
                                                        {date}
                                                    </span>
                                                    <span className="text-gray-500 dark:text-gray-400 text-xs font-medium flex items-center gap-1">
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                                        {apt.time_slot}
                                                    </span>
                                                </div>
                                                <h3 className="text-base md:text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                                    Consultation with {apt.patient?.user?.name || 'Unknown Patient'}
                                                </h3>
                                                <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">Appt #{apt.appointment_number}</p>
                                            </div>
                                            <div className="flex items-center gap-2 self-start md:self-auto">
                                                <div className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 font-bold text-xs rounded-xl whitespace-nowrap border border-emerald-100 dark:border-emerald-800/30 flex items-center gap-1.5">
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                                    Completed
                                                </div>
                                                <a 
                                                    href={route('prescriptions.pdf', apt.id)}
                                                    target="_blank"
                                                    title="Download Prescription PDF"
                                                    className="w-7 h-7 bg-blue-500 hover:bg-blue-600 text-white rounded-xl flex items-center justify-center transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                                </a>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            {/* Diagnosis */}
                                            <div className="bg-rose-50/50 dark:bg-rose-900/10 rounded-xl p-4 border border-rose-100 dark:border-rose-900/30">
                                                <h4 className="text-xs font-bold text-rose-800 dark:text-rose-400 mb-1.5 capitalize tracking-wider flex items-center gap-1.5">
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
                                                    Diagnosis
                                                </h4>
                                                <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap font-medium text-sm">
                                                    {apt.diagnosis || <span className="italic text-gray-500 dark:text-gray-500">No diagnosis recorded.</span>}
                                                </p>
                                            </div>

                                            {/* Prescriptions */}
                                            <div className="bg-amber-50/50 dark:bg-amber-900/10 rounded-xl p-4 border border-amber-100 dark:border-amber-900/30">
                                                <h4 className="text-xs font-bold text-amber-800 dark:text-amber-400 mb-1.5 capitalize tracking-wider flex items-center gap-1.5">
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                                                    Prescriptions
                                                </h4>
                                                <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap font-medium text-sm">
                                                    {apt.prescriptions || <span className="italic text-gray-500 dark:text-gray-500">No prescription written.</span>}
                                                </p>
                                            </div>

                                            {/* Notes */}
                                            {apt.notes && (
                                                <div className="bg-gray-50 dark:bg-slate-900/50 rounded-xl p-4 border border-gray-200 dark:border-slate-700">
                                                    <h4 className="text-xs font-bold text-gray-700 dark:text-gray-400 mb-1.5 capitalize tracking-wider flex items-center gap-1.5">
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                                        Clinical Notes
                                                    </h4>
                                                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap text-sm">
                                                        {apt.notes}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-10 text-center border border-gray-100 dark:border-slate-700 shadow-sm mt-6">
                        <div className="w-20 h-20 bg-gray-50 dark:bg-slate-900/50 rounded-full flex items-center justify-center mx-auto mb-5">
                            <svg className="w-10 h-10 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Consultations Found</h3>
                        <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto text-sm leading-relaxed">
                            {searchQuery ? "No past consultations match your search." : "You haven't completed any patient consultations yet."}
                        </p>
                    </div>
                )}
            </div>
        </SidebarLayout>
    );
}

