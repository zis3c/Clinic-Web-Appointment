import { useState, Fragment } from 'react';
import SidebarLayout from '@/Layouts/SidebarLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import CustomSelect from '@/Components/CustomSelect';
import { Dialog, Transition } from '@headlessui/react';

export default function Doctors({ auth, doctors, specialties }) {
    const [showAddModal, setShowAddModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        nic: '',
        tel: '',
        specialty_id: specialties.length > 0 ? specialties[0].id : '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.doctors.store'), {
            onSuccess: () => {
                setShowAddModal(false);
                reset();
            },
        });
    };

    const filteredDoctors = doctors.filter(doctor => 
        doctor.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.specialty.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.nic.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.tel.includes(searchQuery)
    );

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
                    <div className="flex items-center gap-4">
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
                <div className="bg-white overflow-hidden shadow-sm rounded-2xl border border-gray-100">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Doctor</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Specialty</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Contact</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">NIC</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredDoctors.map((doctor) => (
                                    <tr key={doctor.id} className="hover:bg-gray-50 transition-colors">
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

                        <div className="fixed inset-0 overflow-y-auto">
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
                                                    onChange={val => setData('specialty_id', val)} 
                                                    options={specialties.map(s => ({ value: s.id, label: s.name }))}
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
        </SidebarLayout>
    );
}
