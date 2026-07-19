import { useState, useRef, useEffect, Fragment } from 'react';
import { Transition } from '@headlessui/react';

export default function CustomTimePicker({
    value,
    onChange,
    placeholder = "Select Time",
    required = false,
    className = "",
    placement = 'bottom'
}: {
    value: string;
    onChange: (time: string) => void;
    placeholder?: string;
    required?: boolean;
    className?: string;
    placement?: 'top' | 'bottom';
}) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Generate time slots every 30 mins
    const generateTimeSlots = () => {
        const slots = [];
        for (let h = 0; h < 24; h++) {
            for (let m = 0; m < 60; m += 30) {
                const hour = h.toString().padStart(2, '0');
                const minute = m.toString().padStart(2, '0');
                const timeString = `${hour}:${minute}`;
                const period = h >= 12 ? 'PM' : 'AM';
                const displayHour = h % 12 === 0 ? 12 : h % 12;
                const label = `${displayHour}:${minute} ${period}`;
                slots.push({ value: timeString, label });
            }
        }
        return slots;
    };

    const timeSlots = generateTimeSlots();

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const getDisplayText = () => {
        if (!value) return <span className="text-gray-400 dark:text-gray-500 font-normal">{placeholder}</span>;
        const slot = timeSlots.find(s => s.value === value);
        if (slot) return <span className="text-gray-700 dark:text-slate-200">{slot.label}</span>;
        
        // Custom time entered somehow
        return <span className="text-gray-700 dark:text-slate-200">{value}</span>;
    };

    return (
        <div className={`relative w-full ${className}`} ref={containerRef}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`flex justify-between items-center cursor-pointer w-full px-4 py-3 rounded-xl border transition-colors outline-none shadow-sm font-medium ${
                    isOpen
                        ? 'ring-2 ring-blue-500/20 dark:ring-blue-500/40 border-blue-500 dark:border-blue-500 bg-white dark:bg-slate-900'
                        : 'border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50'
                }`}
            >
                <div className="truncate pr-4 select-none">
                    {getDisplayText()}
                </div>
                <svg className={`w-5 h-5 text-gray-400 dark:text-gray-500 transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180 text-blue-500 dark:text-blue-400' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
            </div>

            <Transition
                show={isOpen}
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
            >
                <div className={`absolute z-50 w-full ${placement === 'top' ? 'bottom-full mb-1' : 'mt-2'} bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden py-2 max-h-60 overflow-y-auto`}>
                    {timeSlots.map((slot) => {
                        const isSelected = value === slot.value;
                        return (
                            <div
                                key={slot.value}
                                onClick={() => {
                                    onChange(slot.value);
                                    setIsOpen(false);
                                }}
                                className={`px-4 py-2.5 cursor-pointer flex items-center transition-all hover:bg-gray-50 dark:hover:bg-slate-700/50 select-none ${isSelected ? 'bg-blue-50 dark:bg-slate-700/80' : ''}`}
                            >
                                <span className={`text-sm ${isSelected ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-gray-700 dark:text-slate-300 font-medium'}`}>
                                    {slot.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </Transition>
            
            {/* Hidden input for HTML form validation if needed */}
            {required && <input type="hidden" value={value} required />}
        </div>
    );
}
