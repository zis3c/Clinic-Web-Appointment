import React, { useState, useEffect } from 'react';
import Modal from '@/Components/Modal';
import PatientProfileCard from '@/Components/PatientProfileCard';

export default function PatientDetailsModal({ 
    show, 
    onClose, 
    patient 
}: { 
    show: boolean; 
    onClose: () => void; 
    patient: any;
}) {
    const [internalPatient, setInternalPatient] = useState<any>(null);

    useEffect(() => {
        if (patient) {
            setInternalPatient(patient);
        }
    }, [patient]);

    return (
        <Modal show={show} onClose={onClose} maxWidth="md">
            {internalPatient && (
                <div className="max-h-[85vh] overflow-y-auto custom-scrollbar modal-scrollbar">
                    <PatientProfileCard patient={internalPatient} onClose={onClose} />
                </div>
            )}
        </Modal>
    );
}
