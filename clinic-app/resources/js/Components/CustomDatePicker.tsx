import { useState, useRef, useEffect, Fragment } from 'react';
import { Transition } from '@headlessui/react';

export default function CustomDatePicker({
    value,
    onChange,
    placeholder = "Select Date",
    required = false,
    className = "", placement = "bottom"
}: {
    value: string;
    onChange: (date: string) => void;
    placeholder?: string;
    required?: boolean;
    className?: string;
    placement?: 'top' | 'bottom';
}) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    
    // Parse initial date or use today
    const initialDate = value ? new Date(value) : new Date();
    const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth());
    const [currentYear, setCurrentYear] = useState(initialDate.getFullYear());

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

    const handlePrevMonth = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(y => y - 1);
        } else {
            setCurrentMonth(m => m - 1);
        }
    };

    const handleNextMonth = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(y => y + 1);
        } else {
            setCurrentMonth(m => m + 1);
        }
    };

    const selectDate = (day: number) => {
        const d = new Date(Date.UTC(currentYear, currentMonth, day));
        onChange(d.toISOString().split('T')[0]);
        setIsOpen(false);
    };

    const renderCalendar = () => {
        const days = [];
        // Empty cells for days before the 1st
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(<div key={`empty-${i}`} className="w-7 h-7 text-xs"></div>);
        }
        // Actual days
        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = new Date(Date.UTC(currentYear, currentMonth, d)).toISOString().split('T')[0];
            const isSelected = value === dateStr;
            const isToday = new Date().toISOString().split('T')[0] === dateStr;
            
            days.push(
                <button
                    key={d}
                    type="button"
                    onClick={(e) => { e.stopPropagation(); selectDate(d); }}
                    className={`w-7 h-7 text-xs flex items-center justify-center rounded-full text-sm transition-all
                        ${isSelected ? 'bg-blue-600 text-white font-bold shadow-md' : 
                          isToday ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold' : 
                          'text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'}`}
                >
                    {d}
                </button>
            );
        }
        return days;
    };

    return (
        <div className={`relative w-full ${className}`} ref={containerRef}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`flex justify-between items-center cursor-pointer w-full h-11 px-4 rounded-xl border transition-colors outline-none shadow-sm font-medium ${
                    isOpen
                        ? 'ring-2 ring-blue-500/20 dark:ring-blue-500/40 border-blue-500 dark:border-blue-500 bg-white dark:bg-slate-900'
                        : 'border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50'
                }`}
            >
                <div className="truncate pr-4 select-none">
                    {value ? <span className="text-gray-900 dark:text-white">{value}</span> : <span className="text-gray-400 dark:text-gray-500 font-normal">{placeholder}</span>}
                </div>
                <svg className={`w-5 h-5 text-gray-400 dark:text-gray-500 transition-transform duration-200 flex-shrink-0 ${isOpen ? 'text-blue-500 dark:text-blue-400' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
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
                <div className={`absolute z-50 ${placement === 'top' ? 'bottom-full mb-1' : 'mt-1'}  bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl shadow-xl p-3 w-64 max-w-[calc(100vw-2rem)] select-none`}>
                    <div className="flex items-center justify-between mb-4">
                        <button type="button" onClick={handlePrevMonth} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-gray-400 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                        </button>
                        <div className="font-bold text-gray-900 dark:text-white">
                            {monthNames[currentMonth]} {currentYear}
                        </div>
                        <button type="button" onClick={handleNextMonth} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-gray-400 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                        </button>
                    </div>
                    
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {dayNames.map(day => (
                            <div key={day} className="text-center text-xs font-bold text-gray-400 dark:text-gray-500">
                                {day}
                            </div>
                        ))}
                    </div>
                    
                    <div className="grid grid-cols-7 gap-1 place-items-center">
                        {renderCalendar()}
                    </div>
                </div>
            </Transition>
            
            {required && <input type="hidden" value={value || ''} required />}
        </div>
    );
}
