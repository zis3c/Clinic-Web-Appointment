import React, { useState, useEffect } from 'react';
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
    const [internalDoctor, setInternalDoctor] = useState<any>(null);

    useEffect(() => {
        if (doctor) {
            setInternalDoctor(doctor);
        }
    }, [doctor]);

    return (
        <Modal show={show} onClose={onClose} maxWidth="md">
            {internalDoctor && (
                <div className="max-h-[85vh] overflow-y-auto custom-scrollbar modal-scrollbar">
                    <DoctorProfileCard doctor={internalDoctor} onClose={onClose} />
                </div>
            )}
        </Modal>
    );
}
