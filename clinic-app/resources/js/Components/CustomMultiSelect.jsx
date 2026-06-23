import { useState, useRef, useEffect } from 'react';
import { Transition } from '@headlessui/react';

export default function CustomMultiSelect({ value = [], onChange, options, placeholder = "Select options", className = "" }) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleOption = (optionValue) => {
        if (value.includes(optionValue)) {
            onChange(value.filter(v => v !== optionValue));
        } else {
            onChange([...value, optionValue]);
        }
    };

    const getDisplayText = () => {
        if (!value || value.length === 0) return <span className="text-gray-400">{placeholder}</span>;
        if (value.length === 1) {
            const opt = options.find(o => o.value == value[0]);
            return <span className="text-gray-700">{opt ? opt.label : placeholder}</span>;
        }
        return <span className="text-blue-600 font-bold">{value.length} selected</span>;
    };

    return (
        <div className="relative w-full" ref={containerRef}>
            <div 
                onClick={() => setIsOpen(!isOpen)}
                className={`flex justify-between items-center cursor-pointer ${className} ${isOpen ? 'ring-4 ring-blue-500/10 border-blue-500 bg-white' : ''}`}
            >
                <div className="truncate pr-4 select-none">
                    {getDisplayText()}
                </div>
                <svg className={`w-5 h-5 text-gray-400 transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180 text-blue-500' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <div className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden py-2 max-h-60 overflow-y-auto">
                    {options.length === 0 && (
                        <div className="px-4 py-3 text-gray-500 text-sm">No options available</div>
                    )}
                    {options.map((option) => {
                        const isSelected = value.includes(option.value);
                        return (
                            <div
                                key={option.value}
                                onClick={() => toggleOption(option.value)}
                                className={`px-4 py-2.5 cursor-pointer flex items-center transition-colors hover:bg-gray-50 select-none`}
                            >
                                <div className={`w-5 h-5 rounded flex items-center justify-center mr-3 border transition-colors ${isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300 bg-white'}`}>
                                    {isSelected && <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>}
                                </div>
                                <span className={`text-sm ${isSelected ? 'text-gray-900 font-bold' : 'text-gray-700 font-medium'}`}>
                                    {option.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </Transition>
        </div>
    );
}
