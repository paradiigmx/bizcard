"use client";
import React, { useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import type { Contact, Event } from '../types';
import { UsersIcon, DownloadIcon, PlusIcon, XIcon, LinkIcon, ShareIcon } from './icons';

interface AddEventModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreateEvent: (eventDetails: Omit<Event, 'id'>) => void;
}

const AddEventModal: React.FC<AddEventModalProps> = ({ isOpen, onClose, onCreateEvent }) => {
    const [event, setEvent] = useState<Omit<Event, 'id'>>({ name: '', date: '', location: '', description: '', url: '' });
    const [isParsing, setIsParsing] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEvent(prev => ({ ...prev, [name]: value }));
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

                <div className="flex justify-end gap-3 pt-2">
                    <button onClick={onClose} className="px-4 py-2 font-semibold bg-[rgb(var(--color-bg-subtle))] rounded">Cancel</button>
                    <button onClick={handleCreate} className="px-4 py-2 font-semibold bg-[rgb(var(--color-primary))] text-[rgb(var(--color-primary-text))] rounded" disabled={!event.name.trim()}>Create Event</button>
                </div>
            </div>
        </div>
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
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    
    const getEventContacts = (eventId: string) => {
        return contacts.filter(c => c.eventLinks.some(link => link.eventId === eventId));
    };

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
            {events.length > 0 ? (
                <ul className="space-y-3">
                    {events.map(event => {
                        const eventContactsCount = getEventContacts(event.id).length;
                        return (
                            <li key={event.id} className="p-4 bg-[rgb(var(--color-bg-secondary))] rounded-lg shadow">
                                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                                    <div className="flex-1">
                                        <p className="font-semibold text-lg text-[rgb(var(--color-text-primary))]">{event.name}</p>
                                        <div className="flex items-center gap-2 text-[rgb(var(--color-text-subtle))] mt-1">
                                            <UsersIcon className="h-4 w-4" />
                                            <span>{eventContactsCount} {eventContactsCount === 1 ? 'Contact' : 'Contacts'}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        {typeof navigator !== 'undefined' && 'share' in navigator && (
                                            <button onClick={() => handleShare(event)} className="p-2 text-[rgb(var(--color-text-secondary))] bg-[rgb(var(--color-bg-subtle))] rounded-lg shadow-sm hover:opacity-80 transition-opacity">
                                                <ShareIcon className="h-4 w-4" />
                                            </button>
                                        )}
                                        <button onClick={() => generateEventCSV(event)} className="p-2 text-[rgb(var(--color-text-secondary))] bg-[rgb(var(--color-bg-subtle))] rounded-lg shadow-sm hover:opacity-80 transition-opacity">
                                            <DownloadIcon className="h-4 w-4" />
                                        </button>
                                        <button onClick={() => onSelectEvent(event.id)} className="px-3 py-2 text-xs font-semibold text-[rgb(var(--color-primary-text))] bg-[rgb(var(--color-primary))] rounded-lg shadow-sm hover:bg-[rgb(var(--color-primary-hover))] transition-colors">
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            ) : (
                <p className="text-center text-[rgb(var(--color-text-subtle))] py-8">No events created yet.</p>
            )}
        </div>
    );
};

export default EventList;