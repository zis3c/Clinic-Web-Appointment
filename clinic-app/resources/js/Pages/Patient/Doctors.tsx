import { useState } from 'react';
import SidebarLayout from '@/Layouts/SidebarLayout';
import { Head, Link } from '@inertiajs/react';
import DoctorDetailsModal from '@/Components/DoctorDetailsModal';

declare const route: any;

export default function Doctors({ auth, doctors }: any) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSpecialty, setSelectedSpecialty] = useState('');
    const [selectedDoctorForModal, setSelectedDoctorForModal] = useState<any>(null);

    // Dynamically extract unique specialties from the doctors list
    const specialties = Array.from(
        new Set(doctors.map((d: any) => d.specialty?.name))
    ).filter(Boolean) as string[];

    // Filter doctors based on search query and category pill selection
    const filteredDoctors = doctors.filter((doctor: any) => {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
            doctor.user?.name.toLowerCase().includes(query) || 
            doctor.user?.email.toLowerCase().includes(query) ||
            doctor.specialty?.name.toLowerCase().includes(query);
        
        const matchesSpecialty = 
            selectedSpecialty === '' || 
            doctor.specialty?.name === selectedSpecialty;
        
        return matchesSearch && matchesSpecialty;
    });

    return (
        <SidebarLayout
            user={auth.user}
            header={<h2 className="font-semibold text-2xl text-gray-800 leading-tight">Find a Doctor</h2>}
        >
            <Head title="Find a Doctor" />

            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6 pb-8">
                    
                    {/* Search & Specialty Filter Header */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">Our Medical Specialists</h3>
                                <p className="text-sm text-gray-500">Find and book appointments with our qualified healthcare professionals.</p>
                            </div>
                            
                            <div className="relative w-full md:w-80">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                    </svg>
                                </div>
                                <input 
                                    type="text" 
                                    placeholder="Search doctor by name or specialty..." 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 w-full border-gray-200 rounded-xl text-sm focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50 h-11 transition-all outline-none"
                                />
                            </div>
                        </div>

                        {/* Specialty Category Pills */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-2 px-2 no-scrollbar">
                            <button
                                onClick={() => setSelectedSpecialty('')}
                                className={`px-4 py-2 text-xs font-bold rounded-full transition-all shrink-0 border ${
                                    selectedSpecialty === ''
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20'
                                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                                }`}
                            >
                                All Specialties
                            </button>
                            {specialties.map((specialty) => (
                                <button
                                    key={specialty}
                                    onClick={() => setSelectedSpecialty(specialty)}
                                    className={`px-4 py-2 text-xs font-bold rounded-full transition-all shrink-0 border ${
                                        selectedSpecialty === specialty
                                            ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20'
                                            : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                                    }`}
                                >
                                    {specialty}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Doctors Grid */}
                    {filteredDoctors.length > 0 ? (
                        <div className="pr-2 pb-6">
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 p-1">
                                {filteredDoctors.map((doctor: any) => (
                                    <div key={doctor.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col h-full">
                                        <div 
                                            onClick={() => setSelectedDoctorForModal(doctor)}
                                            className="flex items-center space-x-4 mb-4 cursor-pointer group/avatar"
                                        >
                                            <div className="h-16 w-16 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full overflow-hidden flex items-center justify-center text-white text-2xl font-bold shadow-inner group-hover/avatar:scale-105 transition-transform duration-200">
                                                {doctor.user?.avatar ? (
                                                    <img 
                                                        src={`/storage/${doctor.user.avatar}`} 
                                                        alt={doctor.user.name} 
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    doctor.user?.name.charAt(0)
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900 group-hover/avatar:text-blue-600 transition-colors">Dr. {doctor.user?.name}</h3>
                                                <p className="text-sm text-blue-600 font-semibold">{doctor.specialty?.name}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-2 text-sm text-gray-600 mb-6 flex-grow">
                                            <p className="flex items-center"><span className="font-medium w-20">Email:</span> {doctor.user?.email}</p>
                                            <p className="flex items-center"><span className="font-medium w-20">Tel:</span> {doctor.tel}</p>
                                            <button 
                                                onClick={() => setSelectedDoctorForModal(doctor)}
                                                className="text-xs text-blue-600 hover:text-blue-800 font-bold transition-colors mt-2 block"
                                            >
                                                View Professional Profile Details →
                                            </button>
                                        </div>
                                        <Link href={route('patient.schedules.index')} className="block text-center w-full py-2 px-4 bg-gray-50 hover:bg-blue-50 text-blue-700 font-semibold rounded-xl border border-blue-100 transition-colors mt-auto">
                                            View Schedules & Book
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl flex flex-col justify-center items-center text-center border border-gray-100 shadow-sm p-12 min-h-[320px]">
                            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <h3 className="text-lg font-bold text-gray-700">No Doctors Found</h3>
                            <p className="text-sm text-gray-500 mt-1">We couldn't find any medical specialists matching your filters.</p>
                            <button 
                                onClick={() => { setSearchQuery(''); setSelectedSpecialty(''); }}
                                className="mt-4 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-xl text-xs transition-colors"
                            >
                                Clear Filters
                            </button>
                        </div>
                    )}
                </div>

            {/* Doctor Profile Details Modal */}
            <DoctorDetailsModal 
                show={selectedDoctorForModal !== null} 
                onClose={() => setSelectedDoctorForModal(null)} 
                doctor={selectedDoctorForModal} 
            />
        </SidebarLayout>
    );
}
