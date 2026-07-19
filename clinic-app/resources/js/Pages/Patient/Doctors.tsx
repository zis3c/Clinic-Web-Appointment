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
        <SidebarLayout user={auth.user}>
            <Head title="Find a Doctor" />

            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6 pb-8">
                    
                    {/* Search & Specialty Filter Header */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 space-y-6 transition-all">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h3 className="text-base md:text-lg font-bold text-gray-800 dark:text-slate-100">Our Medical Specialists</h3>
                                <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Find and book appointments with our qualified healthcare professionals.</p>
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
                                    className="pl-10 w-full border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50 dark:bg-slate-900/50 dark:text-slate-200 dark:placeholder-gray-500 placeholder:font-normal h-11 transition-all outline-none"
                                />
                            </div>
                        </div>

                        {/* Specialty Category Pills */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-2 px-2 custom-scrollbar">
                            <button
                                onClick={() => setSelectedSpecialty('')}
                                className={`px-4 py-2 text-xs font-bold rounded-full transition-all shrink-0 border outline-none outline-none focus:ring-0 active:outline-none ${
                                    selectedSpecialty === ''
                                        ? 'bg-blue-600 text-white border-blue-600'
                                        : 'bg-gray-50 dark:bg-slate-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600'
                                }`}
                            >
                                All Specialties
                            </button>
                            {specialties.map((specialty) => (
                                <button
                                    key={specialty}
                                    onClick={() => setSelectedSpecialty(specialty)}
                                    className={`px-4 py-2 text-xs font-bold rounded-full transition-all shrink-0 border outline-none outline-none focus:ring-0 active:outline-none ${
                                        selectedSpecialty === specialty
                                            ? 'bg-blue-600 text-white border-blue-600'
                                            : 'bg-gray-50 dark:bg-slate-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600'
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
                                    <div key={doctor.id} className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col h-full">
                                        <div 
                                            onClick={() => setSelectedDoctorForModal(doctor)}
                                            className="flex items-center space-x-4 mb-4 cursor-pointer group/avatar"
                                        >
                                            <div className="h-16 w-16 shrink-0 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full overflow-hidden flex items-center justify-center text-white text-2xl font-bold shadow-inner group-hover/avatar:scale-105 transition-transform duration-200">
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
                                                <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white group-hover/avatar:text-blue-600 dark:group-hover/avatar:text-blue-400 transition-all">Dr. {doctor.user?.name}</h3>
                                                <p className="text-xs md:text-sm text-blue-600 dark:text-blue-400 font-semibold">{doctor.specialty?.name}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-2 text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-6 flex-grow">
                                            <p className="flex items-center"><span className="font-medium w-20">Email:</span> {doctor.user?.email}</p>
                                            <p className="flex items-center"><span className="font-medium w-20">Tel:</span> {doctor.tel}</p>
                                            <button 
                                                onClick={() => setSelectedDoctorForModal(doctor)}
                                                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-bold transition-all mt-2 block"
                                            >
                                                View Professional Profile Details →
                                            </button>
                                        </div>
                                        <Link href={`${route('patient.schedules.index')}?search=${encodeURIComponent(doctor.user?.name || '')}`} className="flex justify-center items-center w-full py-3 px-4 bg-gray-50 dark:bg-slate-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-bold rounded-xl border border-blue-100 dark:border-blue-800/40 transition-all hover:shadow-md mt-auto">
                                            View Schedules & Book
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-slate-800 rounded-2xl flex flex-col justify-center items-center text-center border border-gray-100 dark:border-slate-700 shadow-sm p-12 min-h-[320px]">
                            <svg className="w-16 h-16 text-gray-300 dark:text-slate-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <h3 className="text-lg font-bold text-gray-700 dark:text-slate-300">No Doctors Found</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">We couldn't find any medical specialists matching your filters.</p>
                            <button 
                                onClick={() => { setSearchQuery(''); setSelectedSpecialty(''); }}
                                className="mt-4 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-400 font-semibold rounded-xl text-xs transition-all"
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
