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
    return (
        <Modal show={show} onClose={onClose} maxWidth="md">
            {patient && (
                <div className="max-h-[85vh] overflow-y-auto custom-scrollbar modal-scrollbar">
                    <PatientProfileCard patient={patient} onClose={onClose} />
                </div>
            )}
        </Modal>
    );
}
