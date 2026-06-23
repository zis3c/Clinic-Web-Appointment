import SidebarLayout from '@/Layouts/SidebarLayout';
import { Head, Link } from '@inertiajs/react';
import { formatTime12Hour } from '@/Utils/time';

export default function Dashboard({ auth, appointments }) {
    return (
        <SidebarLayout
            user={auth.user}
            header={<h2 className="font-semibold text-2xl text-gray-800 leading-tight">Patient Dashboard</h2>}
        >
            <Head title="Patient Dashboard" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="mb-6 flex justify-between items-center">
                        <h3 className="text-2xl font-bold text-gray-800">Your Appointments</h3>
                        <Link 
                            href={route('patient.doctors.index')} 
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transform transition hover:-translate-y-0.5"
                        >
                            Book New Appointment
                        </Link>
                    </div>

                    <div className="bg-white/80 backdrop-blur-xl overflow-hidden shadow-xl sm:rounded-2xl border border-white">
                        <div className="p-8">
                            {(!appointments || appointments.length === 0) ? (
                                <div className="text-center py-10">
                                    <div className="mx-auto h-24 w-24 text-gray-300 mb-4">
                                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <p className="text-xl text-gray-500 font-medium">No appointments found.</p>
                                    <p className="text-gray-400 mt-2">Book your first appointment to get started.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {appointments.map(apt => (
                                        <div key={apt.id} className="flex items-center justify-between p-5 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                                            <div className="flex items-center space-x-4">
                                                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl">
                                                    {new Date(apt.date).getDate()}
                                                </div>
                                                <div>
                                                    <h4 className="text-lg font-bold text-gray-900">
                                                        Dr. {apt.schedule?.doctor?.user?.name || 'Unknown'}
                                                    </h4>
                                                    <p className="text-sm text-gray-500">
                                                        {new Date(apt.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at {formatTime12Hour(apt.schedule?.time)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                                    Confirmed
                                                </span>
                                                <p className="text-xs text-gray-400 mt-2">Apt #{apt.appointment_number}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </SidebarLayout>
    );
}
