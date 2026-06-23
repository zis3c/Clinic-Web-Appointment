import { useState } from 'react';
import SidebarLayout from '@/Layouts/SidebarLayout';
import { Head, Link } from '@inertiajs/react';
import { formatTime12Hour } from '@/Utils/time';

export default function Appointments({ auth, appointments }) {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredAppointments = appointments.filter(appointment => 
        appointment.patient.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        appointment.schedule.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        appointment.patient.tel.includes(searchQuery) ||
        appointment.appointment_number.toString().includes(searchQuery)
    );

    return (
        <SidebarLayout
            user={auth.user}
            header={<h2 className="font-semibold text-2xl text-gray-800 leading-tight">My Appointments</h2>}
        >
            <Head title="My Appointments" />

            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                
                {/* Header Actions */}
                <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex-col md:flex-row gap-4">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">Your Upcoming Patient Appointments</h3>
                        <p className="text-sm text-gray-500">View details of patients who have booked your sessions.</p>
                    </div>
                    <div className="relative w-full md:w-auto">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        </div>
                        <input 
                            type="text" 
                            placeholder="Search appointments..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 w-full md:w-64 border-gray-200 rounded-xl text-sm focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50 h-11 transition-all outline-none"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white overflow-hidden shadow-sm rounded-2xl border border-gray-100">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Patient Details</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Session Info</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Apt No.</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredAppointments.map((appointment) => (
                                    <tr key={appointment.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold">
                                                    {appointment.patient.user.name.charAt(0)}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-bold text-gray-900">{appointment.patient.user.name}</div>
                                                    <div className="text-sm text-gray-500">Tel: {appointment.patient.tel}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-bold text-gray-900">{appointment.schedule.title}</div>
                                            <div className="text-sm text-gray-500">{new Date(appointment.date).toLocaleDateString()} at {formatTime12Hour(appointment.schedule.time)}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                #{appointment.appointment_number}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <Link 
                                                href={route('doctor.appointments.destroy', appointment.id)} 
                                                method="delete" 
                                                as="button"
                                                className="text-rose-600 hover:text-rose-900 font-semibold"
                                                preserveScroll
                                            >
                                                Cancel Appointment
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredAppointments.length === 0 && (
                            <div className="p-10 text-center text-gray-500">
                                {searchQuery ? "No appointments found matching your search." : "No appointments have been booked yet."}
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </SidebarLayout>
    );
}
