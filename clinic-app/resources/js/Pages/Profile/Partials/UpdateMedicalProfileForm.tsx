import React from 'react';
import { useForm } from '@inertiajs/react';
import CustomSelect from '@/Components/CustomSelect';

export default function UpdateMedicalProfileForm({ patientData }: { patientData: any }) {
    const { data, setData, patch, processing, errors, recentlySuccessful } = useForm({
        gender: patientData?.gender || '',
        blood_group: patientData?.blood_group || '',
        allergies: patientData?.allergies || '',
        medical_conditions: patientData?.medical_conditions || '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(route('patient.profile.update'), {
            preserveScroll: true,
        });
    };

    const genderOptions = [
        { value: 'Male', label: 'Male' },
        { value: 'Female', label: 'Female' },
        { value: 'Other', label: 'Other' },
    ];

    const bloodGroupOptions = [
        { value: 'A+', label: 'A+' },
        { value: 'A-', label: 'A-' },
        { value: 'B+', label: 'B+' },
        { value: 'B-', label: 'B-' },
        { value: 'O+', label: 'O+' },
        { value: 'O-', label: 'O-' },
        { value: 'AB+', label: 'AB+' },
        { value: 'AB-', label: 'AB-' },
    ];

    return (
        <form onSubmit={submit} className="mt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gender</label>
                    <CustomSelect
                        value={data.gender}
                        onChange={value => setData('gender', value.toString())}
                        options={genderOptions}
                        placeholder="Select Gender"
                        className="border border-gray-300 dark:border-slate-700 rounded-lg px-4 py-2"
                    />
                    {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Blood Group</label>
                    <CustomSelect
                        value={data.blood_group}
                        onChange={value => setData('blood_group', value.toString())}
                        options={bloodGroupOptions}
                        placeholder="Select Blood Group"
                        className="border border-gray-300 dark:border-slate-700 rounded-lg px-4 py-2"
                    />
                    {errors.blood_group && <p className="text-red-500 text-sm mt-1">{errors.blood_group}</p>}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Allergies (Optional)</label>
                <textarea
                    value={data.allergies}
                    onChange={e => setData('allergies', e.target.value)}
                    rows={3}
                    className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-300 dark:border-slate-700 rounded-lg px-4 py-2 text-gray-900 dark:text-slate-100 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="E.g. Peanuts, Penicillin..."
                ></textarea>
                {errors.allergies && <p className="text-red-500 text-sm mt-1">{errors.allergies}</p>}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Medical Conditions (Optional)</label>
                <textarea
                    value={data.medical_conditions}
                    onChange={e => setData('medical_conditions', e.target.value)}
                    rows={3}
                    className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-300 dark:border-slate-700 rounded-lg px-4 py-2 text-gray-900 dark:text-slate-100 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="E.g. Asthma, Diabetes..."
                ></textarea>
                {errors.medical_conditions && <p className="text-red-500 text-sm mt-1">{errors.medical_conditions}</p>}
            </div>

            <div className="flex items-center gap-4">
                <button
                    disabled={processing}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white tracking-widest hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-900 outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                >
                    Save Medical Info
                </button>

                {recentlySuccessful && <p className="text-sm text-green-600 dark:text-green-400">Saved.</p>}
            </div>
        </form>
    );
}
