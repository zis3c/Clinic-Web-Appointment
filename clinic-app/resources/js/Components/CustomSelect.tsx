import { useState, useRef, useEffect, useCallback } from 'react';
import { Transition } from '@headlessui/react';

interface Option {
    value: string | number;
    label: string;
}

export default function CustomSelect({ value, onChange, options, placeholder = "Select an option", className = "" }: {
    value: string | number | null;
    onChange: (value: string | number) => void;
    options: Option[];
    placeholder?: string;
    className?: string;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [dropUp, setDropUp] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(opt => opt.value == value);

    const calculateDirection = useCallback(() => {
        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            setDropUp(spaceBelow < 260);
        }
    }, []);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleToggle = () => {
        if (!isOpen) {
            calculateDirection();
        }
        setIsOpen(!isOpen);
    };

    return (
        <div className="relative w-full" ref={containerRef}>
            <div 
                ref={triggerRef}
                onClick={handleToggle}
                className={`flex justify-between items-center cursor-pointer ${className} ${isOpen ? 'ring-1 ring-blue-500 dark:ring-blue-500 border-blue-500 bg-white dark:bg-slate-800' : 'bg-gray-50 dark:bg-slate-900/50'}`}
            >
                <span className={selectedOption ? 'text-gray-700 dark:text-slate-200' : 'text-gray-400 dark:text-gray-500'}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <svg className={`w-5 h-5 text-gray-400 dark:text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-500' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
            </div>

            <Transition
                show={isOpen}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
            >
                <div className={`absolute z-[200] w-full bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden py-1 max-h-48 overflow-y-auto ${dropUp ? 'bottom-full mb-2' : 'top-full mt-2'}`}>
                    {options.map((option) => (
                        <div
                            key={option.value}
                            onClick={() => {
                                onChange(option.value);
                                setIsOpen(false);
                            }}
                            className={`px-4 py-2.5 text-sm cursor-pointer hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-blue-700 dark:hover:text-blue-400 transition-all ${value == option.value ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-bold' : 'text-gray-700 dark:text-gray-300 font-medium'}`}
                        >
                            {option.label}
                        </div>
                    ))}
                </div>
            </Transition>
        </div>
    );
}
