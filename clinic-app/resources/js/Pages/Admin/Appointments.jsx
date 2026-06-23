import SidebarLayout from '@/Layouts/SidebarLayout';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';

export default function Appointments({ auth, appointments }) {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredAppointments = appointments.filter(appointment => 
        appointment.appointment_number.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
        appointment.patient.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        appointment.schedule.doctor.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        appointment.date.includes(searchQuery)
    );
    return (
        <SidebarLayout
            user={auth.user}
            header={<h2 className="font-semibold text-2xl text-gray-800 leading-tight">Manage Appointments</h2>}
        >
            <Head title="Manage Appointments" />

            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                
                {/* Header */}
                <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">All Appointments</h3>
                        <p className="text-sm text-gray-500">View and manage all patient bookings across all doctors.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                            </div>
                            <input 
                                type="text" 
                                placeholder="Search appointments..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-11 pl-10 pr-4 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all w-full sm:w-64 bg-gray-50 text-gray-700"
                            />
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white overflow-hidden shadow-sm rounded-2xl border border-gray-100">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Apt No.</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Patient</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Doctor</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date & Time</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredAppointments.map((appointment) => (
                                    <tr key={appointment.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                            #{appointment.appointment_number}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-bold text-gray-900">{appointment.patient.user.name}</div>
                                            <div className="text-sm text-gray-500">{appointment.patient.tel}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-bold text-gray-900">Dr. {appointment.schedule.doctor.user.name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{new Date(appointment.date).toLocaleDateString()}</div>
                                            <div className="text-sm text-gray-500">{appointment.schedule.time}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <Link 
                                                href={route('admin.appointments.destroy', appointment.id)} 
                                                method="delete" 
                                                as="button"
                                                className="text-rose-600 hover:text-rose-900 font-semibold"
                                                preserveScroll
                                            >
                                                Cancel
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredAppointments.length === 0 && (
                            <div className="p-10 text-center text-gray-500">
                                {searchQuery ? 'No appointments found matching your search.' : 'No appointments found.'}
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </SidebarLayout>
    );
}
