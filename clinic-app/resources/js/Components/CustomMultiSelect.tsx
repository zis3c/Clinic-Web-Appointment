import { useState, useRef, useEffect } from 'react';
import { Transition } from '@headlessui/react';

interface Option {
    value: string | number;
    label: string;
}

export default function CustomMultiSelect({ value = [], onChange, options, placeholder = "Select options", className = "" }: {
    value?: (string | number)[];
    onChange: (value: (string | number)[]) => void;
    options: Option[];
    placeholder?: string;
    className?: string;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleOption = (optionValue: string | number) => {
        if (value.includes(optionValue)) {
            onChange(value.filter(v => v !== optionValue));
        } else {
            onChange([...value, optionValue]);
        }
    };

    const getDisplayText = () => {
        if (!value || value.length === 0) return <span className="text-gray-400 dark:text-gray-500 font-normal">{placeholder}</span>;
        if (value.length === 1) {
            const opt = options.find(o => o.value == value[0]);
            return <span className="text-gray-700 dark:text-slate-200">{opt ? opt.label : placeholder}</span>;
        }
        return <span className="text-blue-600 dark:text-blue-400 font-bold">{value.length} selected</span>;
    };

    return (
        <div className="relative w-full" ref={containerRef}>
            <div 
                onClick={() => setIsOpen(!isOpen)}
                className={`flex justify-between items-center cursor-pointer ${className} ${isOpen ? 'ring-2 ring-blue-500/20 dark:ring-blue-500/40 border-blue-500 dark:border-blue-500 bg-white dark:bg-slate-900' : ''}`}
            >
                <div className="truncate pr-4 select-none">
                    {getDisplayText()}
                </div>
                <svg className={`w-5 h-5 text-gray-400 dark:text-gray-500 transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180 text-blue-500 dark:text-blue-400' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <div className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden py-2 max-h-60 overflow-y-auto">
                    {options.length === 0 && (
                        <div className="px-4 py-3 text-gray-500 dark:text-gray-400 text-sm">No options available</div>
                    )}
                    {options.map((option) => {
                        const isSelected = value.includes(option.value);
                        return (
                            <div
                                key={option.value}
                                onClick={() => toggleOption(option.value)}
                                className={`px-4 py-2.5 cursor-pointer flex items-center transition-all hover:bg-gray-50 dark:hover:bg-slate-700/50 select-none`}
                            >
                                <div className={`w-5 h-5 rounded flex items-center justify-center mr-3 border transition-all ${isSelected ? 'bg-blue-600 dark:bg-blue-500 border-blue-600 dark:border-blue-500 text-white' : 'border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900/50'}`}>
                                    {isSelected && <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>}
                                </div>
                                <span className={`text-sm ${isSelected ? 'text-gray-900 dark:text-white font-bold' : 'text-gray-700 dark:text-slate-300 font-medium'}`}>
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
