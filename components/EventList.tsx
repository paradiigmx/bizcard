"use client";
import React, { useState, useEffect } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import type { Contact, Event } from '../types';
import { UsersIcon, DownloadIcon, PlusIcon, XIcon, LinkIcon, ShareIcon } from './icons';
import { useAppContext } from '../app/provider';
import { US_STATES } from '../constants';

interface AddEventModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreateEvent: (eventDetails: Omit<Event, 'id'>) => void;
}

const AddEventModal: React.FC<AddEventModalProps> = ({ isOpen, onClose, onCreateEvent }) => {
    const { companies, handleCreateCompany } = useAppContext();
    const [event, setEvent] = useState<Omit<Event, 'id'>>({ name: '', date: '', location: '', description: '', url: '' });
    const [isParsing, setIsParsing] = useState(false);
    const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
    const [isNewCompanyModalOpen, setIsNewCompanyModalOpen] = useState(false);
    const [newCompanyName, setNewCompanyName] = useState('');

    useEffect(() => {
        if (!isOpen) {
            setEvent({ name: '', date: '', location: '', description: '', url: '' });
            setSelectedCompanyId('');
            setIsParsing(false);
        }
    }, [isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEvent(prev => ({ ...prev, [name]: value }));
    };
    
    const handleCompanySelect = (companyId: string) => {
        setSelectedCompanyId(companyId);
        if (companyId) {
            setEvent(prev => ({ ...prev, companyId }));
        } else {
            setEvent(prev => ({ ...prev, companyId: undefined }));
        }
    };
    
    const handleCreateNewCompany = () => {
        if(newCompanyName.trim()) {
            const newCompany = handleCreateCompany({name: newCompanyName.trim()});
            setSelectedCompanyId(newCompany.id);
            setEvent(prev => ({ ...prev, companyId: newCompany.id }));
            setNewCompanyName('');
            setIsNewCompanyModalOpen(false);
        }
    };

    const handleParseUrl = async () => {
        const apiKey = process.env.NEXT_PUBLIC_API_KEY;
        if (!event.url || !apiKey) {
            alert("Please provide a URL and ensure your API key is set.");
            return;
        }
        setIsParsing(true);
        try {
            const ai = new GoogleGenAI({apiKey});
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: `Analyze the content of the webpage at this URL: ${event.url}. Extract the following information about the event: the official event name, the start date (formatted as YYYY-MM-DD), the location (city and state/country), and a concise one-sentence summary. If a piece of information is not available, return an empty string for that field.`,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING }, date: { type: Type.STRING },
                            location: { type: Type.STRING }, description: { type: Type.STRING }
                        }
                    }
                }
            });
            const parsedJson = JSON.parse(response.text || '{}');
            setEvent(prev => ({
                ...prev, name: parsedJson.name || prev.name, date: parsedJson.date || prev.date,
                location: parsedJson.location || prev.location, description: parsedJson.description || prev.description,
            }));
        } catch (error) {
            console.error("Error parsing URL:", error);
            alert("Failed to parse details from the URL.");
        } finally {
            setIsParsing(false);
        }
    };

    const handleCreate = () => {
        if (event.name.trim()) {
            onCreateEvent(event);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <>
            {isNewCompanyModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-[rgb(var(--color-bg-secondary))] rounded-lg shadow-xl p-6 w-full max-w-sm">
                        <h3 className="text-lg font-bold mb-4">Create New Company</h3>
                        <input type="text" value={newCompanyName} onChange={(e) => setNewCompanyName(e.target.value)} placeholder="Company name..." className="w-full bg-[rgb(var(--color-bg-tertiary))] p-2 rounded mb-4" autoFocus />
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setIsNewCompanyModalOpen(false)} className="px-4 py-2 font-semibold bg-[rgb(var(--color-bg-subtle))] rounded">Cancel</button>
                            <button onClick={handleCreateNewCompany} className="px-4 py-2 font-semibold bg-[rgb(var(--color-primary))] text-[rgb(var(--color-primary-text))] rounded">Create & Add</button>
                        </div>
                    </div>
                </div>
            )}
            
            <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
                <div className="bg-[rgb(var(--color-bg-secondary))] rounded-lg shadow-xl p-6 w-full max-w-lg space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold">Create New Event</h3>
                        <button onClick={onClose}><XIcon className="h-5 w-5"/></button>
                    </div>
                    
                    <div className="relative">
                        <input name="url" value={event.url || ''} onChange={handleChange} placeholder="Parse info from https://..." className="w-full bg-[rgb(var(--color-bg-tertiary))] p-2 rounded pr-36" />
                        <button onClick={handleParseUrl} className="absolute right-1 top-1 bottom-1 flex items-center gap-2 px-3 text-xs font-semibold text-[rgb(var(--color-primary-text))] bg-[rgb(var(--color-primary))] rounded shadow hover:bg-[rgb(var(--color-primary-hover))] disabled:opacity-50" disabled={isParsing}>
                            {isParsing ? <><svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg> Parsing...</> : <><LinkIcon className="h-4 w-4" /> Parse Info</>}
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input name="name" value={event.name} onChange={handleChange} placeholder="Event Name*" className="w-full bg-[rgb(var(--color-bg-tertiary))] p-2 rounded" />
                        <input type="date" name="date" value={event.date || ''} onChange={handleChange} className="w-full bg-[rgb(var(--color-bg-tertiary))] p-2 rounded" />
                    </div>
                    <input name="location" value={event.location || ''} onChange={handleChange} placeholder="Location (e.g., City, Country)" className="w-full bg-[rgb(var(--color-bg-tertiary))] p-2 rounded" />
                    <textarea name="description" value={event.description || ''} onChange={handleChange} placeholder="Event description..." rows={3} className="w-full bg-[rgb(var(--color-bg-tertiary))] p-2 rounded" />

                    <div className="space-y-2 p-3 border border-[rgb(var(--color-border))] rounded-md">
                        <div className="flex justify-between items-center">
                            <h3 className="font-semibold text-[rgb(var(--color-text-secondary))]">Company</h3>
                            <button type="button" onClick={() => setIsNewCompanyModalOpen(true)} className="px-3 py-1 text-xs font-semibold bg-[rgb(var(--color-bg-tertiary))] text-[rgb(var(--color-text-primary))] rounded hover:opacity-80">New Company</button>
                        </div>
                        <select 
                            value={selectedCompanyId} 
                            onChange={(e) => handleCompanySelect(e.target.value)} 
                            className="w-full bg-[rgb(var(--color-bg-tertiary))] p-2 rounded"
                        >
                            <option value="">-- Select Company (optional) --</option>
                            {companies.map(company => (
                                <option key={company.id} value={company.id}>{company.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button onClick={onClose} className="px-4 py-2 font-semibold bg-[rgb(var(--color-bg-subtle))] rounded">Cancel</button>
                        <button onClick={handleCreate} className="px-4 py-2 font-semibold bg-[rgb(var(--color-primary))] text-[rgb(var(--color-primary-text))] rounded" disabled={!event.name.trim()}>Create Event</button>
                    </div>
                </div>
            </div>
        </>
    );
};


interface EventListProps {
    events: Event[];
    contacts: Contact[];
    onSelectEvent: (eventId: string) => void;
    onCreateEvent: (eventDetails: Omit<Event, 'id'>) => void;
    t: (key: string) => string;
}

const EventList: React.FC<EventListProps> = ({ events, contacts, onSelectEvent, onCreateEvent, t }) => {
    const { companies } = useAppContext();
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showHidden, setShowHidden] = useState(false);
    const [locationFilter, setLocationFilter] = useState('');
    
    const getEventContacts = (eventId: string) => {
        return contacts.filter(c => c.eventLinks.some(link => link.eventId === eventId));
    };
    
    const filteredEvents = events.filter(event => {
        // Exclude the sponsored event from the regular list
        if (event.id === 'paradiigm_shift_2025') return false;
        
        // Search filter
        const matchesSearch = searchTerm === '' || 
            event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (event.location && event.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (event.locationCity && event.locationCity.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (event.locationState && event.locationState.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase()));
        
        // Hidden filter
        const matchesHidden = showHidden || !event.hidden;
        
        // Location filter
        const matchesLocation = !locationFilter || 
            (event.locationState && event.locationState === locationFilter);
        
        return matchesSearch && matchesHidden && matchesLocation;
    });

    const generateEventCSV = (event: Event, forSharing: boolean = false) => {
        const eventContacts = getEventContacts(event.id);
        const headers = ["Name", "Role", "Company", "Email", "Phone", "Notes", "Tags", "Contact Type"];
        const rows = eventContacts.map(c => [
            `"${c.name}"`, `"${c.role}"`, `"${c.company}"`, `"${c.email}"`, `"${c.phone}"`,
            `"${c.notes.replace(/"/g, '""')}"`, `"${c.tags.join('; ')}"`, `"${c.contactType}"`,
        ]);

        const csvContent = headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");

        if (forSharing) {
            const fileName = `${event.name.replace(/\s+/g, '_')}_contacts.csv`;
            return new File([csvContent], fileName, { type: "text/csv;charset=utf-8" });
        }
            
        const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${event.name.replace(/\s+/g, '_')}_contacts.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleShare = async (event: Event) => {
        const file = generateEventCSV(event, true) as File;
        if (navigator.share && navigator.canShare({ files: [file] })) {
            try {
                await navigator.share({
                    files: [file],
                    title: `Contacts for ${event.name}`,
                    text: `Here are the contacts from the event: ${event.name}.`,
                });
            } catch (error) {
                console.error('Error sharing:', error);
                alert('Could not share the file.');
            }
        } else {
            alert('Sharing files is not supported on this browser. The file will be downloaded instead.');
            generateEventCSV(event);
        }
    };


    return (
        <div className="space-y-4">
            <AddEventModal 
                isOpen={isEventModalOpen}
                onClose={() => setIsEventModalOpen(false)}
                onCreateEvent={onCreateEvent}
            />
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-[rgb(var(--color-text-primary))]">{t('events.title')}</h2>
                <button onClick={() => setIsEventModalOpen(true)} className="flex items-center gap-2 px-4 py-2 font-semibold text-[rgb(var(--color-primary-text))] bg-[rgb(var(--color-primary))] rounded-lg shadow hover:bg-[rgb(var(--color-primary-hover))] transition-colors">
                    <PlusIcon className="h-5 w-5" />
                    New Event
                </button>
            </div>
            
            <div className="bg-[rgb(var(--color-bg-secondary))] p-4 rounded-lg shadow space-y-3">
                <input 
                    type="text" 
                    placeholder="Search events..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-[rgb(var(--color-bg-tertiary))] p-2 rounded"
                />
                <div className="flex flex-wrap gap-3 items-center">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={showHidden}
                            onChange={(e) => setShowHidden(e.target.checked)}
                            className="w-4 h-4"
                        />
                        <span className="text-sm text-[rgb(var(--color-text-secondary))]">Show Hidden</span>
                    </label>
                    <select 
                        value={locationFilter}
                        onChange={(e) => setLocationFilter(e.target.value)}
                        className="bg-[rgb(var(--color-bg-tertiary))] p-2 rounded text-sm"
                    >
                        <option value="">All States</option>
                        {US_STATES.map(state => (
                            <option key={state} value={state}>{state}</option>
                        ))}
                    </select>
                </div>
            </div>
            
            <ul className="space-y-3">
                {/* Sponsored Event Card */}
                <li className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow border border-blue-200 dark:border-blue-800">
                    <div className="absolute top-0 right-0 w-32 h-32 overflow-hidden z-10">
                        <div className="absolute top-6 -right-8 bg-gradient-to-r from-[#4A90E2] to-[#357ABD] text-white font-bold text-xs py-1 px-10 transform rotate-45 shadow-lg flex items-center justify-center whitespace-nowrap">
                            SPONSORED
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="flex gap-4 items-start">
                            <div className="flex-shrink-0">
                                <img 
                                    src="/bizcard-logo.png" 
                                    alt="BizCard Logo" 
                                    className="w-24 h-24 rounded-full object-cover border-2 border-blue-200 dark:border-blue-700"
                                />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-2xl font-bold text-blue-700 dark:text-blue-400 mb-2">Paradiigm Shift 2025</h3>
                                <p className="text-lg text-blue-600 dark:text-blue-500 mb-3 font-semibold">December 15, 2025 • Las Vegas, NV</p>
                                <p className="text-[rgb(var(--color-text-secondary))] mb-4 leading-relaxed">
                                    Paradiigm is both a mindset and a movement, a gathering of visionaries redefining what&apos;s possible. It&apos;s where ideas shift, perspectives evolve, and bold change begins.
                                </p>
                                <div className="flex justify-end">
                                    <button
                                        onClick={() => onSelectEvent('paradiigm_shift_2025')}
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#4A90E2] to-[#357ABD] text-white font-semibold rounded-full hover:from-[#357ABD] hover:to-[#2868A8] transition-all shadow-md"
                                    >
                                        View Event →
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </li>
                
                {/* User Created Events */}
                {filteredEvents.map(event => {
                    const eventContacts = getEventContacts(event.id);
                    const eventCompany = event.companyId ? companies.find(c => c.id === event.companyId) : null;
                    return (
                        <li 
                            key={event.id} 
                            onClick={() => onSelectEvent(event.id)}
                            className={`bg-[rgb(var(--color-bg-secondary))] rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer p-6 ${event.hidden ? 'opacity-60' : ''}`}
                        >
                            <div className="flex gap-4 items-start">
                                {event.image_url && (
                                    <div className="flex-shrink-0">
                                        <img 
                                            src={event.image_url} 
                                            alt={event.name} 
                                            className="w-20 h-20 rounded-lg object-cover border-2 border-[rgb(var(--color-border))]"
                                        />
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-xl font-bold text-[rgb(var(--color-text-primary))] mb-1">{event.name}</h3>
                                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-[rgb(var(--color-text-secondary))] mb-2">
                                        {event.date && <span>📅 {new Date(event.date).toLocaleDateString(undefined, { timeZone: 'UTC', year: 'numeric', month: 'long', day: 'numeric' })}</span>}
                                        {event.location && <span>📍 {event.location}</span>}
                                        {eventCompany && <span>🏢 {eventCompany.name}</span>}
                                    </div>
                                    {event.description && (
                                        <p className="text-[rgb(var(--color-text-secondary))] line-clamp-2 mb-2">
                                            {event.description}
                                        </p>
                                    )}
                                    <div className="flex items-center gap-2 text-sm text-[rgb(var(--color-text-subtle))]">
                                        <UsersIcon className="h-4 w-4" />
                                        <span>{eventContacts.length} {eventContacts.length === 1 ? 'contact' : 'contacts'}</span>
                                    </div>
                                </div>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default EventList;