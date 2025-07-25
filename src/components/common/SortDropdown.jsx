import React, { useState, useRef, useEffect } from 'react';
import { SortIcon } from '../../icons/sort-icon';

const sortOptions = [
    { label: 'Recommended', value: 'recommended' },
    { label: 'Price ascending', value: 'price-asc' },
    { label: 'Price descending', value: 'price-desc' },
    { label: 'Descending release date', value: 'release-desc' },
    { label: 'Rating', value: 'rating' },
];

const SortDropdown = ({ onChange, initial = 'recommended' }) => {
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState(initial);
    const buttonRef = useRef(null);
    const dropdownRef = useRef(null);

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target)
            ) {
                setOpen(false);
            }
        }
        if (open) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [open]);

    const handleSelect = (value) => {
        setSelected(value);
        setOpen(false);
        if (onChange) onChange(value);
    };

    const selectedLabel = sortOptions.find(opt => opt.value === selected)?.label || 'Recommended';

    return (
        <div className="relative inline-block">
            <button
                ref={buttonRef}
                className="flex items-center gap-2 px-5 py-2 bg-white border border-gray-200 rounded-full shadow-sm hover:shadow-md transition min-w-[180px] text-gray-800 font-medium focus:outline-none"
                onClick={() => setOpen(v => !v)}
                type="button"
            >
                <span className="flex items-center gap-2 justify-center w-6 h-6">
                    <SortIcon />
                </span>
                <span>{selectedLabel}</span>
            </button>
            {open && (
                <div
                    ref={dropdownRef}
                    className="absolute left-0 mt-2 w-full bg-white rounded-2xl shadow-lg border border-gray-100 z-50 min-w-[220px] py-2"
                >
                    {sortOptions.map(option => (
                        <button
                            key={option.value}
                            className={`w-full text-left px-5 py-2 text-gray-800 hover:bg-gray-100 transition rounded-xl ${selected === option.value ? 'font-semibold bg-gray-50' : ''}`}
                            onClick={() => handleSelect(option.value)}
                            type="button"
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SortDropdown; 