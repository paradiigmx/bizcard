"use client";
import React, { useState, useMemo } from 'react';
import type { Contact, Event, EventRole, ContactType } from '../types';
import { CONTACT_TYPES } from '../types';
import { ShareIcon, StarIcon, ClockIcon, InfoIcon, XIcon, DownloadIcon, SearchIcon, ChevronDownIcon, ChevronUpIcon, IdentificationIcon, BadgeCheckIcon, PlusIcon, PhoneIcon, MailIcon } from './icons';
import { exportContactsCSV, getDefaultAvatar } from '../utils';
import { useAppContext } from '../app/provider';

interface ContactListProps {
    contacts: Contact[];
    onSelectContact: (id: string) => void;
    onToggleFavorite: (id: string) => void;
    events: Event[];
    filterEventId: string | null;
    onSetFilterEventId: (id: string) => void;
    t: (key: string) => string;
}

const getReminderStatus = (dateString?: string) => {
    if (!dateString) return null;
    
    const now = new Date();
    const reminderDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const reminderDateDayOnly = new Date(dateString);
    reminderDateDayOnly.setHours(0, 0, 0, 0);
    
    const isTodayFlag = today.getTime() === reminderDateDayOnly.getTime();

    const formattedDateTime = new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    }).format(reminderDate);

    if (reminderDate < now) {
        return { text: `Overdue: ${formattedDateTime}`, color: 'bg-[rgb(var(--color-danger)/0.1)] text-[rgb(var(--color-danger))] ring-1 ring-inset ring-[rgb(var(--color-danger)/0.2)]' };
    }
    if (isTodayFlag) {
        return { text: `Today: ${formattedDateTime}`, color: 'bg-[rgb(var(--color-warning)/0.1)] text-[rgb(var(--color-warning))] ring-1 ring-inset ring-[rgb(var(--color-warning)/0.2)]' };
    }
    return { text: `Follow up: ${formattedDateTime}`, color: 'bg-[rgb(var(--color-bg-subtle))] text-[rgb(var(--color-text-primary))] ring-1 ring-inset ring-[rgb(var(--color-border))]' };
};

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

    const availableOptions = options.filter(opt => 
        !selectedOptions.includes(opt) && 
        opt.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="relative">
            <label className="block text-[rgb(var(--color-text-secondary))] mb-1">{label}</label>
            <div 
                className="w-full bg-[rgb(var(--color-bg-tertiary))] p-2 rounded flex flex-wrap gap-1 items-center cursor-text min-h-[40px]"
                onClick={() => setIsOpen(true)}
            >
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
                        <input 
                            type="text"
                            placeholder={`Search ${label.toLowerCase()}...`}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-[rgb(var(--color-bg-tertiary))] p-2 rounded focus:ring-[rgb(var(--color-primary))] focus:border-[rgb(var(--color-primary))]"
                            autoFocus
                        />
                    </div>
                    <ul className="max-h-48 overflow-auto">
                        {availableOptions.map(option => (
                            <li key={option} 
                                className="px-3 py-2 cursor-pointer hover:bg-[rgb(var(--color-bg-tertiary))]"
                                onClick={() => { onToggle(option); setSearch(''); }}
                            >
                                {option}
                            </li>
                        ))}
                    </ul>
                    <div className="p-2 border-t border-[rgb(var(--color-border))]">
                        <button onClick={() => setIsOpen(false)} className="w-full text-center px-4 py-2 font-semibold bg-[rgb(var(--color-bg-subtle))] rounded">Close</button>
                    </div>
                </div>
            )}
        </div>
    );
};

const ContactList: React.FC<ContactListProps> = ({ contacts, onSelectContact, onToggleFavorite, events, filterEventId, onSetFilterEventId, t }) => {
    const { settings } = useAppContext();
    const [searchQuery, setSearchQuery] = useState('');
    const [filterTags, setFilterTags] = useState<string[]>([]);
    const [filterEventRoles, setFilterEventRoles] = useState<EventRole[]>([]);
    const [filterContactTypes, setFilterContactTypes] = useState<ContactType[]>([]);
    const [filterFavoritesOnly, setFilterFavoritesOnly] = useState(false);
    const [filterFollowUpsOnly, setFilterFollowUpsOnly] = useState(false);
    const [isFiltersVisible, setIsFiltersVisible] = useState(false);
    const [noteModalContact, setNoteModalContact] = useState<Contact | null>(null);
    
    const nonProfileContacts = useMemo(() => contacts.filter(c => c.id !== 'my_profile_id'), [contacts]);

    const filteredContacts = useMemo(() => {
        let filtered = nonProfileContacts;

        if (filterFavoritesOnly) {
            filtered = filtered.filter(c => c.isFavorite);
        }
        
        if (filterFollowUpsOnly) {
            filtered = filtered.filter(c => !!c.follow_up_date);
        }

        if (searchQuery) {
            const lowerCaseQuery = searchQuery.toLowerCase();
            filtered = filtered.filter(c =>
                c.name.toLowerCase().includes(lowerCaseQuery) ||
                c.company.toLowerCase().includes(lowerCaseQuery) ||
                c.role.toLowerCase().includes(lowerCaseQuery) ||
                c.email.toLowerCase().includes(lowerCaseQuery)
            );
        }

        if (filterEventId && filterEventId !== '__ALL__') {
             filtered = filtered.filter(c => {
                if (filterEventId === '__NONE__') return c.eventLinks.length === 0;
                return c.eventLinks.some(link => link.eventId === filterEventId);
            });
        }

        if (filterEventRoles.length > 0) {
            filtered = filtered.filter(c => 
                c.eventLinks.some(link => filterEventRoles.includes(link.role))
            );
        }
        
        if (filterContactTypes.length > 0) {
            filtered = filtered.filter(c => filterContactTypes.includes(c.contactType));
        }

        if (filterTags.length > 0) {
            filtered = filtered.filter(c => filterTags.every(tag => c.tags.includes(tag)));
        }

        return filtered;
    }, [nonProfileContacts, searchQuery, filterEventId, filterEventRoles, filterContactTypes, filterTags, filterFavoritesOnly, filterFollowUpsOnly]);

    const allTags = useMemo(() => Array.from(new Set(contacts.flatMap(c => c.tags))), [contacts]);
    
    const toggleTag = (tag: string) => setFilterTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
    const toggleEventRole = (role: EventRole) => setFilterEventRoles(prev => prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]);
    const toggleContactType = (type: ContactType) => setFilterContactTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
    
    const handleExport = () => {
        const blob = exportContactsCSV(filteredContacts);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'contacts.csv'; a.click();
        URL.revokeObjectURL(url);
    };

    const handleShare = async () => {
        const contactCount = filteredContacts.length;
        const shareText = `Check out ${contactCount} contact${contactCount !== 1 ? 's' : ''} from BizCard+`;
        
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'BizCard+ Contacts',
                    text: shareText,
                    url: window.location.origin
                });
            } catch (error) {
                if ((error as Error).name !== 'AbortError') {
                    console.error('Error sharing contacts:', error);
                }
            }
        } else {
            alert('Sharing is not supported on your browser.');
        }
    };

    return (
        <div className="space-y-4">
            <div className="relative">
                <input 
                    type="text"
                    placeholder="Search contacts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[rgb(var(--color-bg-secondary))] p-3 pl-10 rounded-lg shadow focus:ring-[rgb(var(--color-primary))] focus:border-[rgb(var(--color-primary))]"
                />
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[rgb(var(--color-text-subtle))]" />
            </div>

            <div className="bg-[rgb(var(--color-bg-secondary))] rounded-lg shadow">
                 <button onClick={() => setIsFiltersVisible(prev => !prev)} className="w-full flex justify-between items-center p-4">
                    <h2 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">Filters</h2>
                    {isFiltersVisible ? <ChevronUpIcon className="h-5 w-5"/> : <ChevronDownIcon className="h-5 w-5"/>}
                 </button>
                 {isFiltersVisible && (
                    <div className="p-4 border-t border-[rgb(var(--color-border))] space-y-4">
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => setFilterFavoritesOnly(prev => !prev)}
                                className={`w-full flex items-center justify-center gap-2 px-4 py-2 font-semibold rounded-lg transition-colors ${filterFavoritesOnly ? 'bg-[rgb(var(--color-warning)/0.8)] text-white' : 'bg-[rgb(var(--color-bg-subtle))] text-[rgb(var(--color-text-secondary))] hover:opacity-80'}`}
                            >
                                <StarIcon className="h-5 w-5" />
                                Favorites
                            </button>
                            <button
                                onClick={() => setFilterFollowUpsOnly(prev => !prev)}
                                className={`w-full flex items-center justify-center gap-2 px-4 py-2 font-semibold rounded-lg transition-colors ${filterFollowUpsOnly ? 'bg-[rgb(var(--color-primary))] text-[rgb(var(--color-primary-text))]' : 'bg-[rgb(var(--color-bg-subtle))] text-[rgb(var(--color-text-secondary))] hover:opacity-80'}`}
                            >
                                <ClockIcon className="h-5 w-5" />
                                Follow-ups
                            </button>
                         </div>
                         <div>
                            <label className="block text-[rgb(var(--color-text-secondary))] mb-1">Event</label>
                            <div className="relative">
                                <select
                                    value={filterEventId || '__ALL__'}
                                    onChange={(e) => onSetFilterEventId(e.target.value)}
                                    className="flex-grow w-full bg-[rgb(var(--color-bg-tertiary))] p-2 pr-10 rounded focus:ring-[rgb(var(--color-primary))] focus:border-[rgb(var(--color-primary))] appearance-none"
                                >
                                    <option value="__ALL__">All Events</option>
                                    <option value="__NONE__">No Event</option>
                                    {events.map(event => (
                                        <option key={event.id} value={event.id}>{event.name}</option>
                                    ))}
                                </select>
                                <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 h-5 w-5 text-[rgb(var(--color-text-subtle))] pointer-events-none" />
                            </div>
                        </div>
                        <MultiSelectTagFilter label="Event Role" options={EVENT_ROLES} selectedOptions={filterEventRoles} onToggle={toggleEventRole} colors={roleColors} />
                        <MultiSelectTagFilter label="Contact Type" options={CONTACT_TYPES} selectedOptions={filterContactTypes} onToggle={toggleContactType} />
                        <MultiSelectTagFilter label="Tags" options={allTags} selectedOptions={filterTags} onToggle={toggleTag} />
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

            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-[rgb(var(--color-text-primary))]">{t('contacts.title')} ({filteredContacts.length})</h2>
                <div className="flex gap-2">
                    <button onClick={handleShare} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[rgb(var(--color-text-secondary))] bg-[rgb(var(--color-bg-subtle))] rounded-lg shadow hover:opacity-80 transition-opacity">
                        <ShareIcon className="h-5 w-5" />
                    </button>
                    <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[rgb(var(--color-text-secondary))] bg-[rgb(var(--color-bg-subtle))] rounded-lg shadow hover:opacity-80 transition-opacity">
                        <DownloadIcon className="h-5 w-5" />
                        Export
                    </button>
                    <a href="/contacts/add" className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[rgb(var(--color-primary-text))] bg-[rgb(var(--color-primary))] rounded-lg shadow hover:opacity-90 transition-opacity">
                        <PlusIcon className="h-5 w-5" />
                        Add Contact
                    </a>
                </div>
            </div>

            <ul className="space-y-3">
                {filteredContacts.length > 0 ? filteredContacts.map(contact => {
                    const reminder = getReminderStatus(contact.follow_up_date);
                    const isParadiigmContact = contact.id === 'paradiigm_contact_id';
                    const avatarSrc = contact.image_url || getDefaultAvatar(settings.theme.toLowerCase());
                    return (
                    <li key={contact.id} className="relative overflow-hidden bg-[rgb(var(--color-bg-secondary))] rounded-lg shadow hover:shadow-md transition-shadow group">
                         {isParadiigmContact && (
                            <div className="absolute top-0 right-0 w-32 h-32 overflow-hidden z-10">
                                <div className="absolute top-6 -right-8 bg-gradient-to-r from-amber-400 to-amber-500 text-amber-900 font-bold text-[10px] py-1 px-10 transform rotate-45 shadow-lg flex items-center justify-center whitespace-nowrap">
                                    App Developer
                                </div>
                            </div>
                         )}
                         <div onClick={() => onSelectContact(contact.id)} className="cursor-pointer p-4">
                            <div className="flex gap-4">
                                 <div className="flex-shrink-0">
                                    <img 
                                        src={avatarSrc} 
                                        alt={contact.name} 
                                        className="w-20 h-20 rounded-full object-cover object-center border-2 border-[rgb(var(--color-border))]"
                                    />
                                </div>
                                 <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start gap-2">
                                         <div className="flex-1">
                                            <p className="flex items-center text-lg font-bold text-[rgb(var(--color-primary))]">
                                              {contact.name}
                                              {contact.isFavorite && !isParadiigmContact && <BadgeCheckIcon className="h-5 w-5 text-[rgb(var(--color-primary))] ml-2 flex-shrink-0" />}
                                            </p>
                                            <p className="text-[rgb(var(--color-text-secondary))]">{contact.role} at {contact.company}</p>
                                            <span className="mt-1 inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium bg-teal-500/10 text-teal-800 dark:text-teal-300 rounded-md">
                                                <IdentificationIcon className="h-3 w-3" />
                                                {contact.contactType}
                                            </span>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            {reminder && (
                                                <div className={`flex items-center gap-1.5 px-2 py-1 text-xs font-semibold rounded-full ${reminder.color}`}>
                                                    <ClockIcon className="h-4 w-4" />
                                                    <span>{reminder.text}</span>
                                                </div>
                                            )}
                                         </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2 mt-2 items-center">
                                        {contact.eventLinks.map(link => {
                                            const eventName = events.find(e => e.id === link.eventId)?.name;
                                            return eventName ? (
                                            <a 
                                                key={`${link.eventId}-${link.role}`} 
                                                href={`/events/${link.eventId}`}
                                                onClick={(e) => e.stopPropagation()}
                                                className={`px-2 py-1 text-xs font-semibold rounded-full hover:opacity-80 transition-opacity ${roleColors[link.role]}`}
                                            >
                                                {eventName}
                                            </a>
                                            ) : null;
                                        })}
                                    </div>

                                    <div className="flex flex-wrap gap-2 mt-2 items-center">
                                        {contact.tags.slice(0, 5).map(tag => (
                                            <span key={tag} className="px-2 py-1 text-xs font-medium bg-[rgb(var(--color-bg-subtle))] text-[rgb(var(--color-text-secondary))] rounded-full">{tag}</span>
                                        ))}
                                    </div>

                                    <div className="flex gap-4 mt-3 text-sm text-[rgb(var(--color-text-secondary))]">
                                        {contact.email && (
                                            <a href={`mailto:${contact.email}`} className="flex items-center gap-1.5 hover:text-[rgb(var(--color-primary))]" onClick={(e) => e.stopPropagation()}>
                                                <MailIcon className="h-4 w-4" />
                                                <span className="truncate">{contact.email}</span>
                                            </a>
                                        )}
                                        {contact.phone && (
                                            <a href={`tel:${contact.phone}`} className="flex items-center gap-1.5 hover:text-[rgb(var(--color-primary))]" onClick={(e) => e.stopPropagation()}>
                                                <PhoneIcon className="h-4 w-4" />
                                                <span>{contact.phone}</span>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-2 px-4 pb-3 border-t border-[rgb(var(--color-border))] pt-2">
                             <button onClick={(e) => { e.stopPropagation(); onToggleFavorite(contact.id); }} className={`transition-colors ${contact.isFavorite ? 'text-yellow-400 hover:text-yellow-500' : 'text-[rgb(var(--color-text-subtle))] hover:text-yellow-400'}`} aria-label={`Favorite ${contact.name}`}>
                                <StarIcon className="h-6 w-6" />
                            </button>
                            {contact.notes && (
                                <button onClick={(e) => { e.stopPropagation(); setNoteModalContact(contact); }} className="text-[rgb(var(--color-text-subtle))] hover:text-[rgb(var(--color-primary))]" aria-label={`View note for ${contact.name}`}>
                                    <InfoIcon className="h-6 w-6" />
                                </button>
                            )}
                        </div>
                    </li>
                )}) : (
                    <div className="text-center text-[rgb(var(--color-text-subtle))] py-8">
                        {nonProfileContacts.length === 0 ? (
                            <div>
                                <p className="text-lg font-semibold">Your contact list is empty!</p>
                                <p>Click the big &apos;+&apos; button to add your first contact.</p>
                            </div>
                        ) : (
                            <p>No contacts found for the current search or filters.</p>
                        )}
                    </div>
                )}
            </ul>
        </div>
    );
};

export default ContactList;
