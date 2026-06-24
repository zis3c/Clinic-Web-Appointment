import React from 'react';
import Modal from '@/Components/Modal';
import DoctorProfileCard from '@/Components/DoctorProfileCard';

export default function DoctorDetailsModal({ 
    show, 
    onClose, 
    doctor 
}: { 
    show: boolean; 
    onClose: () => void; 
    doctor: any;
}) {
    return (
        <Modal show={show} onClose={onClose} maxWidth="md">
            {doctor && (
                <div className="max-h-[85vh] overflow-y-auto custom-scrollbar modal-scrollbar">
                    <DoctorProfileCard doctor={doctor} onClose={onClose} />
                </div>
            )}
        </Modal>
    );
}
