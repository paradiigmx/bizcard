"use client";
import React, { useState, useEffect } from 'react';
import { downloadICS } from '../utils';
import { CalendarIcon } from './icons';

interface ReminderSetterProps {
    currentDate?: string;
    onDateChange: (date: string | null) => void;
    contactName: string;
}

const ReminderSetter: React.FC<ReminderSetterProps> = ({ currentDate, onDateChange, contactName }) => {
    const [mode, setMode] = useState<'relative' | 'specific'>('relative');
    const [relativeValue, setRelativeValue] = useState<number>(2);
    const [relativeUnit, setRelativeUnit] = useState<'days' | 'weeks' | 'months'>('weeks');
    const [specificDate, setSpecificDate] = useState('');
    const [specificTime, setSpecificTime] = useState('09:00');

    useEffect(() => {
        if (currentDate) {
            setMode('specific');
            const dateObj = new Date(currentDate);
            setSpecificDate(dateObj.toISOString().split('T')[0]);
            setSpecificTime(dateObj.toTimeString().substring(0, 5));
        } else {
            setMode('relative');
            setSpecificDate('');
            setSpecificTime('09:00');
        }
    }, [currentDate]);

    const handleSetRelative = () => {
        const now = new Date();
        if (relativeUnit === 'days') {
            now.setDate(now.getDate() + relativeValue);
        } else if (relativeUnit === 'weeks') {
            now.setDate(now.getDate() + relativeValue * 7);
        } else if (relativeUnit === 'months') {
            now.setMonth(now.getMonth() + relativeValue);
        }
        onDateChange(now.toISOString());
    };

    const handleSetSpecific = () => {
        if (specificDate) {
            const [year, month, day] = specificDate.split('-').map(Number);
            const [hours, minutes] = specificTime.split(':').map(Number);
            const combinedDate = new Date(year, month - 1, day, hours, minutes);
            onDateChange(combinedDate.toISOString());
        }
    };
    
    const handleDownloadIcs = () => {
        if (currentDate && contactName) {
            downloadICS(`Follow up with ${contactName}`, currentDate);
        }
    };

    return (
        <div className="space-y-2 p-3 border border-[rgb(var(--color-border))] rounded-md">
            <div className="flex justify-between items-center">
                <h3 className="font-semibold text-[rgb(var(--color-text-secondary))]">Follow-up Reminder</h3>
                {currentDate && (
                    <button onClick={() => onDateChange(null)} className="text-xs text-[rgb(var(--color-danger))] hover:underline">Clear</button>
                )}
            </div>
            {currentDate ? (
                 <div className="flex justify-between items-center flex-wrap gap-2">
                    <p>
                        Reminder: <span className="font-semibold text-[rgb(var(--color-primary))]">{new Date(currentDate).toLocaleString([], {dateStyle: 'medium', timeStyle: 'short'})}</span>
                    </p>
                    <button 
                        onClick={handleDownloadIcs}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[rgb(var(--color-bg-subtle))] text-[rgb(var(--color-text-secondary))] rounded-md hover:opacity-80"
                    >
                        <CalendarIcon className="h-4 w-4" />
                        Add to Calendar
                    </button>
                 </div>
            ) : (
                <>
                    <div className="flex gap-2">
                        <button onClick={() => setMode('relative')} className={`px-3 py-1 rounded-md ${mode === 'relative' ? 'bg-[rgb(var(--color-primary))] text-[rgb(var(--color-primary-text))]' : 'bg-[rgb(var(--color-bg-subtle))]'}`}>Relative</button>
                        <button onClick={() => setMode('specific')} className={`px-3 py-1 rounded-md ${mode === 'specific' ? 'bg-[rgb(var(--color-primary))] text-[rgb(var(--color-primary-text))]' : 'bg-[rgb(var(--color-bg-subtle))]'}`}>Specific Date</button>
                    </div>

                    {mode === 'relative' && (
                        <div className="flex items-center gap-2 flex-wrap">
                            <span>In</span>
                            <input type="number" value={relativeValue} onChange={(e) => setRelativeValue(parseInt(e.target.value, 10))} className="w-16 bg-[rgb(var(--color-bg-tertiary))] p-2 rounded" />
                            <select value={relativeUnit} onChange={(e) => setRelativeUnit(e.target.value as any)} className="bg-[rgb(var(--color-bg-tertiary))] p-2 rounded">
                                <option value="days">Days</option>
                                <option value="weeks">Weeks</option>
                                <option value="months">Months</option>
                            </select>
                            <button onClick={handleSetRelative} className="px-3 py-2 font-semibold bg-[rgb(var(--color-primary))] text-[rgb(var(--color-primary-text))] rounded hover:bg-[rgb(var(--color-primary-hover))]">Set</button>
                        </div>
                    )}

                    {mode === 'specific' && (
                         <div className="flex items-center gap-2 flex-wrap">
                            <input type="date" value={specificDate} onChange={(e) => setSpecificDate(e.target.value)} className="flex-grow bg-[rgb(var(--color-bg-tertiary))] p-2 rounded" />
                            <input type="time" value={specificTime} onChange={(e) => setSpecificTime(e.target.value)} className="bg-[rgb(var(--color-bg-tertiary))] p-2 rounded" />
                            <button onClick={handleSetSpecific} className="px-3 py-2 font-semibold bg-[rgb(var(--color-primary))] text-[rgb(var(--color-primary-text))] rounded hover:bg-[rgb(var(--color-primary-hover))]">Set</button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default ReminderSetter;
