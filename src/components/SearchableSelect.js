'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

/**
 * SearchableSelect
 *
 * Props:
 *   options      – array of { value, label }
 *   value        – currently selected value (string / number / '')
 *   onChange     – (value) => void
 *   placeholder  – text shown when nothing is selected
 *   className    – extra classes applied to the trigger button
 */
export default function SearchableSelect({
    options = [],
    value,
    onChange,
    placeholder = 'Select…',
    className = '',
}) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const containerRef = useRef(null);
    const searchRef = useRef(null);

    const selected = options.find(o => String(o.value) === String(value));

    const filtered = query.trim()
        ? options.filter(o => o.label.toLowerCase().includes(query.toLowerCase()))
        : options;

    // Close on outside click
    useEffect(() => {
        function onPointerDown(e) {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setOpen(false);
                setQuery('');
            }
        }
        document.addEventListener('pointerdown', onPointerDown);
        return () => document.removeEventListener('pointerdown', onPointerDown);
    }, []);

    // Focus search input when dropdown opens
    useEffect(() => {
        if (open) searchRef.current?.focus();
    }, [open]);

    const handleSelect = useCallback((val) => {
        onChange(val);
        setOpen(false);
        setQuery('');
    }, [onChange]);

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') { setOpen(false); setQuery(''); }
    };

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            {/* Trigger */}
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                onKeyDown={handleKeyDown}
                className="glass-input w-full px-3 py-2 flex items-center justify-between text-left"
            >
                <span className={selected ? 'text-white' : 'text-secondary/60'}>
                    {selected ? selected.label : placeholder}
                </span>
                <span className="flex items-center gap-1 ml-2 shrink-0">
                    {selected && (
                        <span
                            role="button"
                            tabIndex={0}
                            onPointerDown={(e) => { e.stopPropagation(); handleSelect(''); }}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); handleSelect(''); } }}
                            className="text-secondary/60 hover:text-white transition-colors p-0.5 rounded"
                            aria-label="Clear selection"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </span>
                    )}
                    <svg
                        className={`w-4 h-4 text-secondary/60 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </span>
            </button>

            {/* Dropdown */}
            {open && (
                <div className="absolute z-50 mt-1 w-full rounded-lg border border-white/10 bg-[#1a1f2e] shadow-xl overflow-hidden">
                    {/* Search box */}
                    <div className="p-2 border-b border-white/10">
                        <input
                            ref={searchRef}
                            type="text"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Search…"
                            className="w-full bg-white/10 text-white placeholder-white/30 text-sm px-3 py-1.5 rounded-md outline-none focus:ring-1 focus:ring-white/30"
                        />
                    </div>

                    {/* Options list */}
                    <ul className="max-h-52 overflow-y-auto py-1">
                        {/* "All" option */}
                        <li>
                            <button
                                type="button"
                                onClick={() => handleSelect('')}
                                className={`w-full text-left px-3 py-2 text-sm transition-colors hover:bg-white/10 ${!value ? 'text-accent-green font-medium' : 'text-secondary'}`}
                            >
                                {placeholder}
                            </button>
                        </li>

                        {filtered.length === 0 ? (
                            <li className="px-3 py-2 text-sm text-secondary/50 italic">No results found</li>
                        ) : (
                            filtered.map(o => (
                                <li key={o.value}>
                                    <button
                                        type="button"
                                        onClick={() => handleSelect(o.value)}
                                        className={`w-full text-left px-3 py-2 text-sm transition-colors hover:bg-white/10 ${String(value) === String(o.value) ? 'text-accent-green font-medium' : 'text-white'}`}
                                    >
                                        {o.label}
                                    </button>
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}
