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
    const prevDoctorRef = React.useRef<any>(null);
    if (doctor) {
        prevDoctorRef.current = doctor;
    }
    const displayDoctor = doctor || prevDoctorRef.current;

    return (
        <Modal show={show} onClose={onClose} maxWidth="md">
            {displayDoctor && (
                <div className="max-h-[85vh] overflow-y-auto custom-scrollbar modal-scrollbar">
                    <DoctorProfileCard doctor={displayDoctor} onClose={onClose} />
                </div>
            )}
        </Modal>
    );
}
