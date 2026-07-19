import React from 'react';
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
    const prevPatientRef = React.useRef<any>(null);
    if (patient) {
        prevPatientRef.current = patient;
    }
    const displayPatient = patient || prevPatientRef.current;

    return (
        <Modal show={show} onClose={onClose} maxWidth="md">
            {displayPatient && (
                <div className="max-h-[85vh] overflow-y-auto custom-scrollbar modal-scrollbar">
                    <PatientProfileCard patient={displayPatient} onClose={onClose} />
                </div>
            )}
        </Modal>
    );
}
