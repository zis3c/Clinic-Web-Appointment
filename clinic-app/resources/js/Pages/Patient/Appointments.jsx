import SidebarLayout from '@/Layouts/SidebarLayout';
import { Head, Link } from '@inertiajs/react';
import { formatTime12Hour } from '@/Utils/time';

export default function Appointments({ auth, appointments }) {
    return (
        <SidebarLayout
            user={auth.user}
            header={<h2 className="font-semibold text-2xl text-gray-800 leading-tight">My Appointments</h2>}
        >
            <Head title="My Appointments" />

            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                
                {/* Header Actions */}
                <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">Your Booked Appointments</h3>
                        <p className="text-sm text-gray-500">View and manage all your upcoming visits to the clinic.</p>
                    </div>
                    <Link 
                        href={route('patient.schedules.index')}
                        className="px-4 py-2 bg-gradient-to-r from-teal-500 to-blue-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition-all"
                    >
                        + Book New
                    </Link>
                </div>

                {/* Table */}
                <div className="bg-white overflow-hidden shadow-sm rounded-2xl border border-gray-100">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Apt No.</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Doctor</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Session Info</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {appointments.map((appointment) => (
                                    <tr key={appointment.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-4 py-2 inline-flex text-sm leading-5 font-bold rounded-xl bg-blue-100 text-blue-800 border border-blue-200">
                                                #{appointment.appointment_number}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold">
                                                    {appointment.schedule.doctor.user.name.charAt(0)}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-bold text-gray-900">Dr. {appointment.schedule.doctor.user.name}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-bold text-gray-900">{appointment.schedule.title}</div>
                                            <div className="text-sm text-gray-500">{new Date(appointment.date).toLocaleDateString()} at {formatTime12Hour(appointment.schedule.time)}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <Link 
                                                href={route('patient.appointments.destroy', appointment.id)} 
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
                        {(!appointments || appointments.length === 0) && (
                            <div className="p-10 text-center text-gray-500">
                                You don't have any upcoming appointments.
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </SidebarLayout>
    );
}
