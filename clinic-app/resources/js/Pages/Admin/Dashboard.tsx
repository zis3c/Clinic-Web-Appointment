import SidebarLayout from '@/Layouts/SidebarLayout';
import { Head } from '@inertiajs/react';

export default function Dashboard({ auth, doctorCount, patientCount, appointmentCount }: any) {
    return (
        <SidebarLayout
            user={auth.user}
            header={<h2 className="font-semibold text-2xl text-gray-800 leading-tight">Admin Dashboard</h2>}
        >
            <Head title="Admin Dashboard" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {/* Total Doctors Card */}
                        <div className="relative overflow-hidden bg-white rounded-3xl shadow-sm border border-gray-100 p-8 group hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-300">
                            <div className="absolute -right-10 -top-10 w-40 h-40 bg-gradient-to-br from-blue-50 to-transparent rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700 pointer-events-none"></div>
                            <div className="flex items-center justify-between relative z-10">
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Total Doctors</p>
                                    <h3 className="text-5xl font-black text-gray-900 tracking-tight">{doctorCount}</h3>
                                </div>
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-500 to-blue-600 text-white flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300 shadow-lg shadow-blue-500/30">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                                </div>
                            </div>
                        </div>

                        {/* Total Patients Card */}
                        <div className="relative overflow-hidden bg-white rounded-3xl shadow-sm border border-gray-100 p-8 group hover:shadow-2xl hover:shadow-teal-500/10 hover:-translate-y-1 transition-all duration-300">
                            <div className="absolute -right-10 -top-10 w-40 h-40 bg-gradient-to-br from-teal-50 to-transparent rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700 pointer-events-none"></div>
                            <div className="flex items-center justify-between relative z-10">
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Total Patients</p>
                                    <h3 className="text-5xl font-black text-gray-900 tracking-tight">{patientCount}</h3>
                                </div>
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-400 to-emerald-500 text-white flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300 shadow-lg shadow-teal-500/30">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                                </div>
                            </div>
                        </div>

                        {/* Total Appointments Card */}
                        <div className="relative overflow-hidden bg-white rounded-3xl shadow-sm border border-gray-100 p-8 group hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-1 transition-all duration-300">
                            <div className="absolute -right-10 -top-10 w-40 h-40 bg-gradient-to-br from-purple-50 to-transparent rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700 pointer-events-none"></div>
                            <div className="flex items-center justify-between relative z-10">
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Appointments</p>
                                    <h3 className="text-5xl font-black text-gray-900 tracking-tight">{appointmentCount}</h3>
                                </div>
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-600 text-white flex items-center justify-center transform group-hover:-rotate-12 transition-transform duration-300 shadow-lg shadow-purple-500/30">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/70 backdrop-blur-lg overflow-hidden shadow-sm sm:rounded-lg border border-white/20">
                        <div className="p-6 text-gray-900">
                            <h3 className="text-xl font-bold mb-4">System Overview</h3>
                            <p>Welcome to the premium clinic management system. Here you can oversee all clinical operations with ease.</p>
                        </div>
                    </div>
                </div>
            </div>
        </SidebarLayout>
    );
}
