import { useState, Fragment } from 'react';
import SidebarLayout from '@/Layouts/SidebarLayout';
import { Head, useForm, Link, router } from '@inertiajs/react';
import CustomSelect from '@/Components/CustomSelect';
import { Dialog, Transition } from '@headlessui/react';
import Modal from '@/Components/Modal';

export default function Doctors({ auth, doctors, specialties }: any) {
    const [showAddModal, setShowAddModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [isBulkMode, setIsBulkMode] = useState(false);
    const [showBulkCancelModal, setShowBulkCancelModal] = useState(false);
    const [viewDoctor, setViewDoctor] = useState<any>(null);
    const [showDoctorModal, setShowDoctorModal] = useState(false);
    
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        nic: '',
        tel: '',
        specialty_id: specialties.length > 0 ? specialties[0].id : '',
    });

    const submit = (e: any) => {
        e.preventDefault();
        post(route('admin.doctors.store'), {
            onSuccess: () => {
                setShowAddModal(false);
                reset();
            },
        });
    };

    const filteredDoctors = doctors.filter((doctor: any) => 
        doctor.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.specialty.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.nic.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.tel.includes(searchQuery)
    );

    const handleSelect = (id: number) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const handleBulkCancel = () => {
        router.delete(route('admin.doctors.bulk-destroy'), {
            data: { doctor_ids: selectedIds },
            onSuccess: () => {
                setShowBulkCancelModal(false);
                setSelectedIds([]);
                setIsBulkMode(false);
            },
            preserveScroll: true
        });
    };

    return (
        <SidebarLayout
            user={auth.user}
            header={<h2 className="font-semibold text-2xl text-gray-800 leading-tight">Manage Doctors</h2>}
        >
            <Head title="Manage Doctors" />

            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                
                {/* Header Actions */}
                <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">Doctor Directory</h3>
                        <p className="text-sm text-gray-500">Add, edit, or remove doctors from the system.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto z-20 relative items-center">
                        {!isBulkMode ? (
                            <button
                                onClick={() => setIsBulkMode(true)}
                                className="px-4 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-bold rounded-xl text-sm transition-all whitespace-nowrap h-11 shadow-sm"
                            >
                                Select
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={() => {
                                        if (filteredDoctors.length > 0 && selectedIds.length === filteredDoctors.length) {
                                            setSelectedIds([]);
                                        } else {
                                            setSelectedIds(filteredDoctors.map((d: any) => d.id));
                                        }
                                    }}
                                    className="px-4 py-2 bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 font-bold rounded-xl text-sm transition-all whitespace-nowrap h-11"
                                >
                                    {filteredDoctors.length > 0 && selectedIds.length === filteredDoctors.length ? 'Deselect All' : 'Select All'}
                                </button>
                                {selectedIds.length > 0 && (
                                    <button
                                        onClick={() => setShowBulkCancelModal(true)}
                                        className="px-4 py-2 bg-rose-500 text-white hover:bg-rose-600 font-bold rounded-xl text-sm transition-all whitespace-nowrap h-11 shadow-md hover:shadow-lg hover:-translate-y-0.5"
                                    >
                                        Delete Selected ({selectedIds.length})
                                    </button>
                                )}
                                <button
                                    onClick={() => {
                                        setIsBulkMode(false);
                                        setSelectedIds([]);
                                    }}
                                    className="px-4 py-2 bg-gray-100 text-gray-600 hover:bg-gray-200 font-bold rounded-xl text-sm transition-all whitespace-nowrap h-11"
                                >
                                    Done
                                </button>
                            </>
                        )}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                            </div>
                            <input 
                                type="text" 
                                placeholder="Search doctors..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-11 pl-10 pr-4 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all w-full sm:w-64 bg-gray-50 text-gray-700"
                            />
                        </div>
                        <button 
                            onClick={() => setShowAddModal(true)}
                            className="h-11 px-5 flex items-center justify-center bg-gradient-to-r from-teal-400 to-blue-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all whitespace-nowrap"
                        >
                            + Add New Doctor
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white overflow-hidden shadow-sm rounded-2xl border border-gray-100 relative">
                    {/* Patch to cover the scrollbar track gap in the header */}
                    <div className="absolute top-0 right-0 w-[8px] h-[49px] bg-gray-50 border-b border-gray-200 z-20"></div>

                    <div className="overflow-x-auto max-h-[calc(100vh-190px)] overflow-y-auto custom-scrollbar">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50 sticky top-0 z-10 ring-1 ring-gray-200">
                                <tr>
                                    {isBulkMode && <th className="px-6 py-4 w-10"></th>}
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Doctor</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Specialty</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Contact</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">NIC</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredDoctors.map((doctor: any) => (
                                    <tr 
                                        key={doctor.id} 
                                        onClick={() => {
                                            if (isBulkMode) {
                                                handleSelect(doctor.id);
                                            } else {
                                                setViewDoctor(doctor);
                                                setShowDoctorModal(true);
                                            }
                                        }}
                                        className={`transition-colors cursor-pointer ${selectedIds.includes(doctor.id) ? 'bg-blue-50/50' : 'hover:bg-blue-50'}`}
                                    >
                                        {isBulkMode && (
                                            <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                                <input 
                                                    type="checkbox" 
                                                    checked={selectedIds.includes(doctor.id)}
                                                    onChange={() => handleSelect(doctor.id)}
                                                    className="w-5 h-5 rounded-md border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                                />
                                            </td>
                                        )}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white font-bold">
                                                    {doctor.user.name.charAt(0)}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-bold text-gray-900">{doctor.user.name}</div>
                                                    <div className="text-sm text-gray-500">{doctor.user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-teal-100 text-teal-800">
                                                {doctor.specialty.name}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {doctor.tel}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {doctor.nic}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <Link 
                                                href={route('admin.doctors.destroy', doctor.id)} 
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
                        {filteredDoctors.length === 0 && (
                            <div className="p-10 text-center text-gray-500">
                                {searchQuery ? 'No doctors found matching your search.' : 'No doctors found in the system.'}
                            </div>
                        )}
                    </div>
                </div>

                {/* Add Modal */}
                <Transition appear show={showAddModal} as={Fragment}>
                    <Dialog as="div" className="relative z-[100]" onClose={() => setShowAddModal(false)}>
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm" />
                        </Transition.Child>

                        <div className="fixed inset-0 overflow-hidden">
                            <div className="flex min-h-full items-center justify-center p-4 text-center">
                                <Transition.Child
                                    as={Fragment}
                                    enter="ease-out duration-300"
                                    enterFrom="opacity-0 scale-95"
                                    enterTo="opacity-100 scale-100"
                                    leave="ease-in duration-200"
                                    leaveFrom="opacity-100 scale-100"
                                    leaveTo="opacity-0 scale-95"
                                >
                                    <Dialog.Panel className="w-full max-w-lg transform overflow-visible rounded-3xl bg-white p-8 text-left align-middle shadow-2xl transition-all relative">
                                        <button 
                                            onClick={() => setShowAddModal(false)}
                                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                                        >
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                        </button>
                                        
                                        <Dialog.Title as="h3" className="text-2xl font-bold mb-6 text-gray-900">
                                            Add New Doctor
                                        </Dialog.Title>
                                        
                                        <form onSubmit={submit} className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-1">Name</label>
                                                <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-700 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none shadow-sm font-medium" required />
                                                {errors.name && <div className="text-rose-500 text-sm mt-1">{errors.name}</div>}
                                            </div>
                                            
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
                                                <input type="email" value={data.email} onChange={e => setData('email', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-700 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none shadow-sm font-medium" required />
                                                {errors.email && <div className="text-rose-500 text-sm mt-1">{errors.email}</div>}
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-bold text-gray-700 mb-1">NIC</label>
                                                    <input type="text" value={data.nic} onChange={e => setData('nic', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-700 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none shadow-sm font-medium" required />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-bold text-gray-700 mb-1">Telephone</label>
                                                    <input type="text" value={data.tel} onChange={e => setData('tel', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-700 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none shadow-sm font-medium" required />
                                                </div>
                                            </div>

                                            <div className="relative z-50">
                                                <label className="block text-sm font-bold text-gray-700 mb-1">Specialty</label>
                                                <CustomSelect 
                                                    value={data.specialty_id} 
                                                    onChange={(val: any) => setData('specialty_id', val)} 
                                                    options={specialties.map((s: any) => ({ value: s.id, label: s.name }))}
                                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-700 transition-all outline-none shadow-sm font-medium cursor-pointer"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
                                                    <input type="password" value={data.password} onChange={e => setData('password', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-700 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none shadow-sm font-medium" required />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-bold text-gray-700 mb-1">Confirm Password</label>
                                                    <input type="password" value={data.password_confirmation} onChange={e => setData('password_confirmation', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-700 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none shadow-sm font-medium" required />
                                                </div>
                                            </div>
                                            {errors.password && <div className="text-rose-500 text-sm mt-1">{errors.password}</div>}

                                            <div className="pt-4 flex justify-end">
                                                <button 
                                                    type="button" 
                                                    onClick={() => setShowAddModal(false)}
                                                    className="mr-3 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                                                >
                                                    Cancel
                                                </button>
                                                <button 
                                                    type="submit" 
                                                    disabled={processing}
                                                    className="px-4 py-2 text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm disabled:opacity-50"
                                                >
                                                    Save Doctor
                                                </button>
                                            </div>
                                        </form>
                                    </Dialog.Panel>
                                </Transition.Child>
                            </div>
                        </div>
                    </Dialog>
                </Transition>

            </div>

            {/* Bulk Delete Confirmation Modal */}
            <Modal show={showBulkCancelModal} onClose={() => setShowBulkCancelModal(false)} maxWidth="sm">
                <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Confirm Deletion</h3>
                    <p className="text-gray-500 mb-6">
                        Are you sure you want to delete {selectedIds.length} selected doctor(s)? This action cannot be undone.
                    </p>
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={() => setShowBulkCancelModal(false)}
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleBulkCancel}
                            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition-all shadow-md"
                        >
                            Yes, Delete Doctors
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Doctor Details Modal */}
            <Modal show={showDoctorModal} onClose={() => setShowDoctorModal(false)} maxWidth="md">
                {viewDoctor && (
                    <div className="p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-gray-900">Doctor Profile</h3>
                            <button onClick={() => setShowDoctorModal(false)} className="text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-full p-2 transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>
                        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
                            <div className="flex items-center gap-4 border-b border-gray-100 pb-4 mb-4">
                                <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-teal-400 to-blue-600 flex items-center justify-center text-white font-bold text-2xl shadow-sm">
                                    {viewDoctor.user?.name?.charAt(0) || '?'}
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold text-gray-900">Dr. {viewDoctor.user?.name || 'Unknown'}</h4>
                                    <p className="text-sm text-gray-500">{viewDoctor.user?.email || 'No email'}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-500 font-medium mb-1">Phone Number</p>
                                    {viewDoctor.tel ? (
                                        <a 
                                            href={`https://wa.me/${viewDoctor.tel.replace(/\D/g, '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center font-bold text-gray-900 hover:text-emerald-600 transition-colors group"
                                            title="Chat on WhatsApp"
                                        >
                                            {viewDoctor.tel}
                                            <svg className="w-3.5 h-3.5 ml-1.5 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                                        </a>
                                    ) : (
                                        <p className="font-bold text-gray-900">Not provided</p>
                                    )}
                                </div>
                                <div>
                                    <p className="text-gray-500 font-medium mb-1">Specialty</p>
                                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-teal-100 text-teal-800">
                                        {viewDoctor.specialty?.name || 'Not assigned'}
                                    </span>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-gray-500 font-medium mb-1">National ID (NIC)</p>
                                    <p className="font-bold text-gray-900">{viewDoctor.nic || 'Not provided'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </SidebarLayout>
    );
}
