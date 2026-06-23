import SidebarLayout from '@/Layouts/SidebarLayout';
import { Head, Link } from '@inertiajs/react';

export default function Doctors({ auth, doctors }) {
    return (
        <SidebarLayout
            user={auth.user}
            header={<h2 className="font-semibold text-2xl text-gray-800 leading-tight">Find a Doctor</h2>}
        >
            <Head title="Find a Doctor" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {doctors.map(doctor => (
                            <div key={doctor.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                <div className="flex items-center space-x-4 mb-4">
                                    <div className="h-16 w-16 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-inner">
                                        {doctor.user?.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">Dr. {doctor.user?.name}</h3>
                                        <p className="text-sm text-blue-600 font-semibold">{doctor.specialty?.name}</p>
                                    </div>
                                </div>
                                <div className="space-y-2 text-sm text-gray-600 mb-6">
                                    <p className="flex items-center"><span className="font-medium w-20">Email:</span> {doctor.user?.email}</p>
                                    <p className="flex items-center"><span className="font-medium w-20">Tel:</span> {doctor.tel}</p>
                                </div>
                                <Link href={route('patient.schedules.index')} className="block text-center w-full py-2 px-4 bg-gray-50 hover:bg-blue-50 text-blue-700 font-semibold rounded-xl border border-blue-100 transition-colors">
                                    View Schedules & Book
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </SidebarLayout>
    );
}
