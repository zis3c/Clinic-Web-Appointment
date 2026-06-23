import SidebarLayout from '@/Layouts/SidebarLayout';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';

export default function Patients({ auth, patients }) {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredPatients = patients.filter(patient => 
        patient.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.nic.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.tel.includes(searchQuery)
    );
    return (
        <SidebarLayout
            user={auth.user}
            header={<h2 className="font-semibold text-2xl text-gray-800 leading-tight">Manage Patients</h2>}
        >
            <Head title="Manage Patients" />

            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                
                {/* Header */}
                <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">Patient Directory</h3>
                        <p className="text-sm text-gray-500">View and manage all registered patients.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                            </div>
                            <input 
                                type="text" 
                                placeholder="Search patients..." 
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
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Patient</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">NIC</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Contact</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">DOB</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredPatients.map((patient) => (
                                    <tr key={patient.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                                                    {patient.user.name.charAt(0)}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-bold text-gray-900">{patient.user.name}</div>
                                                    <div className="text-sm text-gray-500">{patient.user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {patient.nic}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {patient.tel}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {patient.dob}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <Link 
                                                href={route('admin.patients.destroy', patient.id)} 
                                                method="delete" 
                                                as="button"
                                                className="text-rose-600 hover:text-rose-900 font-semibold"
                                                preserveScroll
                                            >
                                                Remove
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredPatients.length === 0 && (
                            <div className="p-10 text-center text-gray-500">
                                {searchQuery ? 'No patients found matching your search.' : 'No patients found.'}
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </SidebarLayout>
    );
}
