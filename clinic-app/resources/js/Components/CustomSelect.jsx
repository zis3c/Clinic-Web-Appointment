import { useState, useRef, useEffect } from 'react';
import { Transition } from '@headlessui/react';

export default function CustomSelect({ value, onChange, options, placeholder = "Select an option", className = "" }) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    const selectedOption = options.find(opt => opt.value == value);

    useEffect(() => {
        function handleClickOutside(event) {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative w-full" ref={containerRef}>
            <div 
                onClick={() => setIsOpen(!isOpen)}
                className={`flex justify-between items-center cursor-pointer ${className} ${isOpen ? 'ring-4 ring-blue-500/10 border-blue-500 bg-white' : ''}`}
            >
                <span className={selectedOption ? 'text-gray-700' : 'text-gray-400'}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <svg className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-500' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <div className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden py-1 max-h-60 overflow-y-auto">
                    {options.map((option) => (
                        <div
                            key={option.value}
                            onClick={() => {
                                onChange(option.value);
                                setIsOpen(false);
                            }}
                            className={`px-4 py-3 cursor-pointer hover:bg-blue-50 hover:text-blue-700 transition-colors ${value == option.value ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-700 font-medium'}`}
                        >
                            {option.label}
                        </div>
                    ))}
                </div>
            </Transition>
        </div>
    );
}
