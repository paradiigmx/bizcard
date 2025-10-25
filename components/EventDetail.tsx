"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import type { Contact, Event, EventRole, ContactType } from '../types';
import { CONTACT_TYPES } from '../types';
import { ArrowLeftIcon, EditIcon, SaveIcon, LinkIcon, IdentificationIcon, StarIcon, InfoIcon, XIcon, ClockIcon, SearchIcon, ChevronDownIcon, ChevronUpIcon, PlusIcon, BuildingOfficeIcon, EyeIcon, EyeOffIcon, MailIcon } from './icons';
import { useAppContext } from '../app/provider';
import { useRouter } from 'next/navigation';
import { sendEmailToContacts } from '../utils';

interface EventDetailProps {
    event: Event;
    contacts: Contact[];
    onBack: () => void;
    onUpdateEvent: (event: Event) => void;
    onSelectContact: (contactId: string) => void;
    onNavigateToAddContact: (eventId: string) => void;
}

const roleColors: Record<EventRole, string> = {
    'Attendee': 'bg-sky-500/10 text-sky-700 dark:text-sky-300',
    'Speaker': 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300',
    'Host': 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    'Guest': 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
    'Exhibitor': 'bg-rose-500/10 text-rose-700 dark:text-rose-300',
};
const EVENT_ROLES: EventRole[] = ['Attendee', 'Speaker', 'Host', 'Guest', 'Exhibitor'];

interface MultiSelectTagFilterProps<T extends string> {
    label: string;
    options: readonly T[];
    selectedOptions: T[];
    onToggle: (option: T) => void;
    colors?: Record<T, string>;
}
const MultiSelectTagFilter = <T extends string>({ label, options, selectedOptions, onToggle, colors }: MultiSelectTagFilterProps<T>) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const availableOptions = options.filter(opt => !selectedOptions.includes(opt) && opt.toLowerCase().includes(search.toLowerCase()));
    return (
        <div className="relative">
            <label className="block font-medium text-[rgb(var(--color-text-secondary))] mb-1">{label}</label>
            <div className="w-full bg-[rgb(var(--color-bg-tertiary))] p-2 rounded flex flex-wrap gap-1 items-center cursor-text min-h-[40px]" onClick={() => setIsOpen(true)}>
                {selectedOptions.map(option => (
                    <span key={option} className={`flex items-center gap-1.5 px-2 py-0.5 text-xs font-semibold rounded-full ${colors?.[option] || 'bg-[rgb(var(--color-primary))] text-[rgb(var(--color-primary-text))]'}`}>
                        {option}
                        <button onClick={(e) => {e.stopPropagation(); onToggle(option)}}><XIcon className="h-3 w-3"/></button>
                    </span>
                ))}
                {selectedOptions.length === 0 && <span className="text-[rgb(var(--color-text-subtle))] ml-1">Filter by {label.toLowerCase()}...</span>}
            </div>
            {isOpen && (
                <div className="absolute z-20 w-full mt-1 bg-[rgb(var(--color-bg-secondary))] border border-[rgb(var(--color-border))] rounded-md shadow-lg">
                    <div className="p-2">
                        <input type="text" placeholder={`Search ${label.toLowerCase()}...`} value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-[rgb(var(--color-bg-tertiary))] p-2 rounded focus:ring-[rgb(var(--color-primary))] focus:border-[rgb(var(--color-primary))]" autoFocus />
                    </div>
                    <ul className="max-h-48 overflow-auto">{availableOptions.map(option => (<li key={option} className="px-3 py-2 cursor-pointer hover:bg-[rgb(var(--color-bg-tertiary))]" onClick={() => { onToggle(option); setSearch(''); }}>{option}</li>))}</ul>
                    <div className="p-2 border-t border-[rgb(var(--color-border))]"><button onClick={() => setIsOpen(false)} className="w-full text-center px-4 py-2 font-semibold bg-[rgb(var(--color-bg-subtle))] rounded">Close</button></div>
                </div>
            )}
        </div>
    );
};


const EventDetail: React.FC<EventDetailProps> = ({ event, contacts, onBack, onUpdateEvent, onSelectContact, onNavigateToAddContact }) => {
    const router = useRouter();
    const { companies, handleCreateCompany, handleToggleHideEvent } = useAppContext();
    const [isEditing, setIsEditing] = useState(false);
    const [editedEvent, setEditedEvent] = useState<Event>(event);
    const [isParsing, setIsParsing] = useState(false);
    const [noteModalContact, setNoteModalContact] = useState<Contact | null>(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [filterTags, setFilterTags] = useState<string[]>([]);
    const [filterEventRoles, setFilterEventRoles] = useState<EventRole[]>([]);
    const [filterContactTypes, setFilterContactTypes] = useState<ContactType[]>([]);
    const [filterFavoritesOnly, setFilterFavoritesOnly] = useState(false);
    const [filterFollowUpsOnly, setFilterFollowUpsOnly] = useState(false);
    const [isFiltersVisible, setIsFiltersVisible] = useState(false);
    const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);
    const [tagSearch, setTagSearch] = useState('');
    
    const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
    const [isNewCompanyModalOpen, setIsNewCompanyModalOpen] = useState(false);
    const [newCompanyName, setNewCompanyName] = useState('');

    useEffect(() => {
        setEditedEvent(event);
        setSelectedCompanyId(event.companyId || '');
    }, [event]);
    
    const allTags = useMemo(() => Array.from(new Set(contacts.flatMap(c => c.tags))), [contacts]);
    
    const filteredContacts = useMemo(() => {
        let filtered = contacts;
        if (filterFavoritesOnly) filtered = filtered.filter(c => c.isFavorite);
        if (filterFollowUpsOnly) filtered = filtered.filter(c => !!c.follow_up_date);
        if (searchQuery) {
            const lowerCaseQuery = searchQuery.toLowerCase();
            filtered = filtered.filter(c => c.name.toLowerCase().includes(lowerCaseQuery) || c.company.toLowerCase().includes(lowerCaseQuery) || c.role.toLowerCase().includes(lowerCaseQuery));
        }
        if (filterEventRoles.length > 0) filtered = filtered.filter(c => c.eventLinks.some(link => link.eventId === event.id && filterEventRoles.includes(link.role)));
        if (filterContactTypes.length > 0) filtered = filtered.filter(c => filterContactTypes.includes(c.contactType));
        if (filterTags.length > 0) filtered = filtered.filter(c => filterTags.every(tag => c.tags.includes(tag)));
        return filtered;
    }, [contacts, searchQuery, filterEventRoles, filterContactTypes, filterTags, filterFavoritesOnly, filterFollowUpsOnly, event.id]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEditedEvent(prev => ({ ...prev, [name]: value }));
    };
    
    const handleCompanySelect = (companyId: string) => {
        setSelectedCompanyId(companyId);
        if (companyId) {
            setEditedEvent(prev => ({ ...prev, companyId }));
        } else {
            setEditedEvent(prev => ({ ...prev, companyId: undefined }));
        }
    };
    
    const handleCreateNewCompany = () => {
        if(newCompanyName.trim()) {
            const newCompany = handleCreateCompany({name: newCompanyName.trim()});
            setSelectedCompanyId(newCompany.id);
            setEditedEvent(prev => ({ ...prev, companyId: newCompany.id }));
            setNewCompanyName('');
            setIsNewCompanyModalOpen(false);
        }
    };

    const handleSave = () => {
        onUpdateEvent(editedEvent);
        setIsEditing(false);
    };

    const handleParseUrl = async () => {
        const apiKey = process.env.NEXT_PUBLIC_API_KEY;
        if (!editedEvent.url || !apiKey) {
            alert("Please provide a URL and ensure your API key is set.");
            return;
        }
        setIsParsing(true);
        try {
            const ai = new GoogleGenAI({apiKey});
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: `Analyze the content of the webpage at this URL: ${editedEvent.url}. Extract the following information about the event: the official event name, the start date (formatted as YYYY-MM-DD), the location (city and state/country), and a concise one-sentence summary. If a piece of information is not available, return an empty string for that field.`,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: { name: { type: Type.STRING }, date: { type: Type.STRING }, location: { type: Type.STRING }, description: { type: Type.STRING }}
                    }
                }
            });
            const parsedJson = JSON.parse(response.text || '{}');
            setEditedEvent(prev => ({...prev, name: parsedJson.name || prev.name, date: parsedJson.date || prev.date, location: parsedJson.location || prev.location, description: parsedJson.description || prev.description, }));
        } catch (error) {
            console.error("Error parsing URL:", error);
            alert("Failed to parse details from the URL. The model may not have been able to access or interpret the content.");
        } finally {
            setIsParsing(false);
        }
    };
    
    const availableTags = useMemo(() => allTags.filter(tag => !filterTags.includes(tag) && tag.toLowerCase().includes(tagSearch.toLowerCase())), [allTags, filterTags, tagSearch]);
    const toggleTag = (tag: string) => { setFilterTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]); setTagSearch(''); };
    const toggleEventRole = (role: EventRole) => setFilterEventRoles(prev => prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]);
    const toggleContactType = (type: ContactType) => setFilterContactTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);

    const isDemoEvent = event.id === 'paradiigm_shift_2025';
    const linkedCompany = event.companyId ? companies.find(c => c.id === event.companyId) : null;

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
            
            <div className="space-y-6">
                <div className="p-4 sm:p-6 bg-[rgb(var(--color-bg-secondary))] rounded-lg shadow space-y-4">
                <div className="flex items-center justify-between">
                    <button onClick={onBack} className="flex items-center gap-2 text-[rgb(var(--color-primary))] hover:underline">
                        <ArrowLeftIcon className="h-4 w-4" />
                        Back to Events
                    </button>
                    <div className="flex items-center gap-2">
                        {!isDemoEvent && (
                            <>
                                <button 
                                    onClick={() => handleToggleHideEvent(event.id)} 
                                    className="p-2 text-[rgb(var(--color-text-subtle))] hover:text-[rgb(var(--color-text-primary))]"
                                    title={event.hidden ? "Show Event" : "Hide Event"}
                                >
                                    {event.hidden ? <EyeIcon className="h-5 w-5" /> : <EyeOffIcon className="h-5 w-5" />}
                                </button>
                                {isEditing ? (
                                    <button onClick={handleSave} className="p-2 text-[rgb(var(--color-success))] hover:opacity-80">
                                        <SaveIcon className="h-5 w-5" />
                                    </button>
                                ) : (
                                    <button onClick={() => setIsEditing(true)} className="p-2 text-[rgb(var(--color-text-subtle))] hover:text-[rgb(var(--color-text-primary))]">
                                        <EditIcon className="h-5 w-5" />
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {isEditing ? (
                    <div className="space-y-4">
                        <input name="name" value={editedEvent.name} onChange={handleChange} placeholder="Event Name" className="w-full text-2xl font-bold bg-[rgb(var(--color-bg-tertiary))] p-2 rounded" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input type="date" name="date" value={editedEvent.date || ''} onChange={handleChange} className="w-full bg-[rgb(var(--color-bg-tertiary))] p-2 rounded" />
                            <input name="location" value={editedEvent.location || ''} onChange={handleChange} placeholder="Location (e.g., City, Country)" className="w-full bg-[rgb(var(--color-bg-tertiary))] p-2 rounded" />
                        </div>
                        <div className="relative">
                            <input name="url" value={editedEvent.url || ''} onChange={handleChange} placeholder="https://example.com/event-page" className="w-full bg-[rgb(var(--color-bg-tertiary))] p-2 rounded pr-36" />
                            <button onClick={handleParseUrl} className="absolute right-1 top-1 bottom-1 flex items-center gap-2 px-3 text-xs font-semibold text-[rgb(var(--color-primary-text))] bg-[rgb(var(--color-primary))] rounded shadow hover:bg-[rgb(var(--color-primary-hover))] disabled:opacity-50" disabled={isParsing}>
                                {isParsing ? <><svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg> Parsing...</> : <><LinkIcon className="h-4 w-4" /> Parse Info</>}
                            </button>
                        </div>
                        <textarea name="description" value={editedEvent.description || ''} onChange={handleChange} placeholder="Event description..." rows={3} className="w-full bg-[rgb(var(--color-bg-tertiary))] p-2 rounded" />
                        
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
                        
                        <div className="flex justify-end gap-3 pt-4 border-t border-[rgb(var(--color-border))]">
                            <button 
                                onClick={() => setIsEditing(false)} 
                                className="px-6 py-2 font-semibold bg-[rgb(var(--color-bg-subtle))] text-[rgb(var(--color-text-primary))] rounded-md hover:opacity-80"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleSave} 
                                className="px-6 py-2 font-semibold bg-[rgb(var(--color-primary))] text-[rgb(var(--color-primary-text))] rounded-md hover:bg-[rgb(var(--color-primary-hover))]"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <div className="flex items-center gap-4">
                            {event.image_url && <img src={event.image_url} alt={event.name} className="w-16 h-16 object-contain rounded-lg" />}
                            <h2 className="text-3xl font-bold text-[rgb(var(--color-text-primary))]">{event.name}</h2>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[rgb(var(--color-text-secondary))]">
                            {event.date && <span>📅 {new Date(event.date).toLocaleDateString(undefined, { timeZone: 'UTC', year: 'numeric', month: 'long', day: 'numeric' })}</span>}
                            {event.location && <span>📍 {event.location}</span>}
                            {linkedCompany && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        router.push(`/companies/${linkedCompany.id}`);
                                    }}
                                    className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-semibold bg-blue-500/10 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-500/20 transition-colors"
                                >
                                    <BuildingOfficeIcon className="h-3 w-3" />
                                    {linkedCompany.name}
                                </button>
                            )}
                        </div>
                        {event.description && <p className="pt-2 text-[rgb(var(--color-text-secondary))]">{event.description}</p>}
                        {event.url && (
                            <div className="pt-3">
                                <a 
                                    href={event.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="inline-flex items-center gap-2 px-6 py-3 font-semibold text-[rgb(var(--color-primary-text))] bg-[rgb(var(--color-primary))] rounded-lg shadow hover:bg-[rgb(var(--color-primary-hover))] transition-colors"
                                >
                                    <LinkIcon className="h-5 w-5" />
                                    Learn More
                                </a>
                            </div>
                        )}
                    </div>
                )}
            </div>
            
            <div className="space-y-4">
                 <div className="relative">
                    <input type="text" placeholder="Search contacts in this event..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-[rgb(var(--color-bg-secondary))] p-3 pl-10 rounded-lg shadow focus:ring-[rgb(var(--color-primary))] focus:border-[rgb(var(--color-primary))]"/>
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[rgb(var(--color-text-subtle))]" />
                </div>
                <div className="bg-[rgb(var(--color-bg-secondary))] rounded-lg shadow">
                    <button onClick={() => setIsFiltersVisible(prev => !prev)} className="w-full flex justify-between items-center p-4">
                        <h2 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">Filters</h2>
                        {isFiltersVisible ? <ChevronUpIcon className="h-5 w-5"/> : <ChevronDownIcon className="h-5 w-5"/>}
                    </button>
                    {isFiltersVisible && (
                        <div className="p-4 border-t border-[rgb(var(--color-border))] space-y-4">
                            <div className="grid grid-cols-2 gap-2"><button onClick={() => setFilterFavoritesOnly(p => !p)} className={`w-full flex items-center justify-center gap-2 px-4 py-2 font-semibold rounded-lg transition-colors ${filterFavoritesOnly ? 'bg-yellow-400 text-yellow-900' : 'bg-[rgb(var(--color-bg-subtle))] hover:opacity-80'}`}><StarIcon className="h-5 w-5" /> Favorites</button><button onClick={() => setFilterFollowUpsOnly(p => !p)} className={`w-full flex items-center justify-center gap-2 px-4 py-2 font-semibold rounded-lg transition-colors ${filterFollowUpsOnly ? 'bg-[rgb(var(--color-primary))] text-[rgb(var(--color-primary-text))]' : 'bg-[rgb(var(--color-bg-subtle))] hover:opacity-80'}`}><ClockIcon className="h-5 w-5"/> Follow-ups</button></div>
                            <MultiSelectTagFilter label="Event Role" options={EVENT_ROLES} selectedOptions={filterEventRoles} onToggle={toggleEventRole} colors={roleColors} />
                            <MultiSelectTagFilter label="Contact Type" options={CONTACT_TYPES} selectedOptions={filterContactTypes} onToggle={toggleContactType} />
                        </div>
                    )}
                </div>
                 <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-bold text-[rgb(var(--color-text-primary))]">Contacts ({filteredContacts.length})</h3>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => sendEmailToContacts(filteredContacts)} 
                            className="flex items-center gap-2 px-4 py-2 font-semibold text-white bg-[rgb(var(--color-success))] rounded-lg shadow hover:opacity-90 transition-opacity"
                            disabled={filteredContacts.length === 0}
                        >
                            <MailIcon className="h-5 w-5" />
                            Email All
                        </button>
                        <button onClick={() => onNavigateToAddContact(event.id)} className="flex items-center gap-2 px-4 py-2 font-semibold text-[rgb(var(--color-primary-text))] bg-[rgb(var(--color-primary))] rounded-lg shadow hover:bg-[rgb(var(--color-primary-hover))] transition-colors">
                            <PlusIcon className="h-5 w-5" />
                            Add Contact to Event
                        </button>
                    </div>
                </div>
                 {filteredContacts.length > 0 ? filteredContacts.map(contact => {
                    const eventLink = contact.eventLinks.find(l => l.eventId === event.id);
                    return (
                        <li key={contact.id} className="list-none p-4 bg-[rgb(var(--color-bg-secondary))] rounded-lg shadow hover:shadow-md transition-shadow group">
                            <div className="flex justify-between items-start gap-3">
                                <div className="flex-1 cursor-pointer" onClick={() => onSelectContact(contact.id)}>
                                    <p className="font-semibold text-[rgb(var(--color-text-primary))]">{contact.name}</p>
                                    <p className="text-[rgb(var(--color-text-secondary))]">{contact.role} at {contact.company}</p>
                                     <span className="mt-1 inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium bg-teal-500/10 text-teal-800 dark:text-teal-300 rounded-md"><IdentificationIcon className="h-3 w-3" />{contact.contactType}</span>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    {eventLink && (<span className={`px-2 py-1 text-xs font-semibold rounded-full ${roleColors[eventLink.role]}`}>{eventLink.role}</span>)}
                                    {contact.follow_up_date && new Date(contact.follow_up_date) < new Date() && (<div className="flex items-center gap-1.5 text-xs font-semibold text-[rgb(var(--color-danger))]"><ClockIcon className="h-4 w-4"/><span>Overdue</span></div>)}
                                </div>
                            </div>
                            <div className="flex items-center justify-end gap-2 mt-2 pt-2 border-t border-[rgb(var(--color-border))]">
                                {contact.isFavorite && <StarIcon className="h-6 w-6 text-yellow-400" />}
                                {contact.notes && <button onClick={() => setNoteModalContact(contact)} className="text-[rgb(var(--color-text-subtle))] hover:text-[rgb(var(--color-primary))]"><InfoIcon className="h-6 w-6" /></button>}
                            </div>
                        </li>
                    )
                 }) : ( <p className="text-center text-[rgb(var(--color-text-subtle))] py-8">No contacts found for this event or filter.</p> )}
                
                {event.companyId && companies.find(c => c.id === event.companyId) && (
                    <div className="mt-6">
                        <h3 className="text-2xl font-bold text-[rgb(var(--color-text-primary))] mb-4">Company</h3>
                        <div 
                            className="p-4 bg-[rgb(var(--color-bg-secondary))] rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => router.push(`/companies/${event.companyId}`)}
                        >
                            <div className="flex items-center gap-4">
                                {companies.find(c => c.id === event.companyId)?.logo_url && (
                                    <img 
                                        src={companies.find(c => c.id === event.companyId)?.logo_url} 
                                        alt="Company Logo" 
                                        className="h-12 w-12 rounded object-contain bg-white p-1"
                                    />
                                )}
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <BuildingOfficeIcon className="h-5 w-5 text-[rgb(var(--color-primary))]" />
                                        <p className="font-semibold text-lg text-[rgb(var(--color-text-primary))]">
                                            {companies.find(c => c.id === event.companyId)?.name}
                                        </p>
                                    </div>
                                    {companies.find(c => c.id === event.companyId)?.description && (
                                        <p className="text-sm text-[rgb(var(--color-text-secondary))] mt-1">
                                            {companies.find(c => c.id === event.companyId)?.description}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            {noteModalContact && (
                 <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4" onClick={() => setNoteModalContact(null)}>
                    <div className="bg-[rgb(var(--color-bg-secondary))] rounded-lg shadow-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-2"><h3 className="text-lg font-bold">Note for {noteModalContact.name}</h3><button onClick={() => setNoteModalContact(null)}><XIcon className="h-5 w-5"/></button></div>
                        <p className="text-[rgb(var(--color-text-secondary))] whitespace-pre-wrap">{noteModalContact.notes}</p>
                    </div>
                </div>
            )}
            </div>
        </>
    );
};

export default EventDetail;