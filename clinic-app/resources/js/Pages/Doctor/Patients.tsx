import { useState } from 'react';
import { useAutoRefresh } from '@/hooks/useAutoRefresh';
import SidebarLayout from '@/Layouts/SidebarLayout';
import { Head, Link } from '@inertiajs/react';
import PatientDetailsModal from '@/Components/PatientDetailsModal';

export default function Patients({ auth, patients }: any) {
    useAutoRefresh(['patients'], { pollingOnly: true });
    const [searchQuery, setSearchQuery] = useState('');
    const [viewPatient, setViewPatient] = useState<any>(null);
    const [showPatientModal, setShowPatientModal] = useState(false);

    const filteredPatients = patients.filter((patient: any) => 
        patient.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.nic.includes(searchQuery) ||
        patient.tel.includes(searchQuery)
    );

    return (
        <SidebarLayout
            user={auth.user}
        >
            <Head title="Patients" />

            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                
                {/* Header */}
                <div className="flex justify-between items-center bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100 flex-col md:flex-row gap-4">
                    <div className="w-full text-center md:text-left">
                        <h3 className="text-base md:text-lg font-bold text-gray-800">Your Patients Directory</h3>
                        <p className="text-xs md:text-sm text-gray-500">A list of all unique patients who have booked appointments with you.</p>
                    </div>
                    <div className="relative w-full md:w-auto">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        </div>
                        <input 
                            type="text" 
                            placeholder="Search patients..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 w-full md:w-64 border-gray-200 rounded-xl text-sm focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50 h-11 transition-all outline-none"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white overflow-hidden shadow-sm rounded-2xl border border-gray-100 relative">
                    {/* Patch to cover the scrollbar track gap in the header */}
                    <div className="absolute top-0 right-0 w-[8px] h-[49px] bg-gray-50 border-b border-gray-200 z-20"></div>

                    <div className="overflow-x-auto h-[calc(100vh-190px)] md:overflow-y-auto custom-scrollbar flex flex-col p-4 md:p-0">
                        <table className="min-w-full divide-y divide-gray-200 hidden md:table">
                            <thead className="bg-gray-50/80 dark:bg-slate-800/80 backdrop-blur-md sticky top-0 z-10 ring-1 ring-gray-200 dark:ring-slate-700">
                                <tr>
                                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 capitalize tracking-wider w-12">#</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 capitalize tracking-wider">Patient Name</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 capitalize tracking-wider">NIC</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 capitalize tracking-wider">Contact</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 capitalize tracking-wider">DOB</th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 capitalize tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredPatients.map((patient: any, index: number) => (
                                    <tr 
                                        key={patient.id} 
                                        onClick={() => {
                                            setViewPatient(patient);
                                            setShowPatientModal(true);
                                        }}
                                        className="hover:bg-blue-50 transition-all cursor-pointer group"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold text-gray-400">
                                            {index + 1}
                                        </td>
                                        <td 
                                            className="px-6 py-4 whitespace-nowrap cursor-pointer"
                                            onClick={() => {
                                                setViewPatient(patient);
                                                setShowPatientModal(true);
                                            }}
                                        >
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
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {patient.tel}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {patient.dob}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <Link
                                                href={route('doctor.patients.emr', patient.id)}
                                                className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg shadow font-bold transition-all"
                                            >
                                                View EMR
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        
                        {/* Mobile Card View */}
                        <div className="flex flex-col space-y-4 md:hidden">
                            {filteredPatients.map((patient: any) => (
                                <div 
                                    key={patient.id} 
                                    onClick={() => {
                                        setViewPatient(patient);
                                        setShowPatientModal(true);
                                    }}
                                    className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm active:bg-blue-50 transition-all cursor-pointer"
                                >
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold shrink-0 text-lg">
                                            {patient.user.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-900">{patient.user.name}</h4>
                                            <p className="text-xs text-gray-500">{patient.user.email}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100/50">
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 capitalize tracking-wider mb-0.5">NIC</p>
                                            <p className="text-xs font-semibold text-gray-700">{patient.nic}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 capitalize tracking-wider mb-0.5">Contact</p>
                                            <p className="text-xs font-semibold text-gray-900">{patient.tel}</p>
                                        </div>
                                        <div className="col-span-2 pt-2 border-t border-gray-200/50">
                                            <p className="text-[10px] font-bold text-gray-400 capitalize tracking-wider mb-0.5">Date of Birth</p>
                                            <p className="text-xs font-medium text-gray-500">{patient.dob}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {filteredPatients.length === 0 && (
                            <div className="flex-1 flex flex-col justify-center items-center p-10 text-center text-gray-500">
                                {searchQuery ? "No patients found matching your search." : "You do not have any patients yet."}
                            </div>
                        )}
                    </div>
                </div>

            </div>
            
            <PatientDetailsModal 
                show={showPatientModal} 
                onClose={() => setShowPatientModal(false)} 
                patient={viewPatient} 
            />
        </SidebarLayout>
    );
}


