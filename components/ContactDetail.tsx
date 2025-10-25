"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import type { Contact, Event, EventRole, EventLink, ContactType, Profession } from '../types';
import { CONTACT_TYPES, PROFESSIONS } from '../types';
import { ArrowLeftIcon, TrashIcon, EditIcon, SaveIcon, DownloadIcon, ShareIcon, StarIcon, PlusIcon, IdentificationIcon, ChevronDownIcon, LinkIcon, QrCodeIcon } from './icons';
import TagEditor from './TagEditor';
import ReminderSetter from './ReminderSetter';
import QrCodeModal from './QrCodeModal';
import { locationData, countries } from '../locationData';
import { US_STATES } from '../constants';
import { useAppContext } from '../app/provider';


interface ContactDetailProps {
    contact: Contact;
    onBack: () => void;
    onUpdateContact: (contact: Contact) => void;
    onDelete: (id: string) => void;
    onToggleFavorite: (id: string) => void;
    onToggleHide?: (id: string) => void;
    allTags: string[];
    events: Event[];
    onCreateEvent: (eventName: Omit<Event, 'id'>) => Event;
}

const EVENT_ROLES: EventRole[] = ['Attendee', 'Speaker', 'Host', 'Guest', 'Exhibitor'];

interface CustomSelectProps {
    options: readonly string[];
    value: string;
    onChange: (newValue: string) => void;
}

const CustomSelect: React.FC<CustomSelectProps> = ({ options, value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="relative">
            <button type="button" onClick={() => setIsOpen(!isOpen)} className="w-full bg-[rgb(var(--color-bg-tertiary))] p-2 rounded text-left flex justify-between items-center">
                <span>{value}</span>
                <ChevronDownIcon className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="absolute z-20 w-full mt-1 bg-[rgb(var(--color-bg-secondary))] border border-[rgb(var(--color-border))] rounded-md shadow-lg max-h-60 overflow-auto">
                    <ul>
                        {options.map(option => (
                            <li key={option}
                                className="px-3 py-2 cursor-pointer hover:bg-[rgb(var(--color-bg-tertiary))]"
                                onClick={() => { onChange(option); setIsOpen(false); }}>
                                {option}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};


const generateVCF = (contact: Contact) => {
    const { name, role, company, email, phone, address, websites } = contact;
    const [firstName, ...lastNameParts] = name.split(' ');
    const lastName = lastNameParts.join(' ');
    
    let vcf = `BEGIN:VCARD
VERSION:3.0
N:${lastName};${firstName};;;
FN:${name}
ORG:${company}
TITLE:${role}
TEL;TYPE=WORK,VOICE:${phone}
EMAIL:${email}
ADR;TYPE=WORK:;;${address.street};${address.city};${address.state};${address.postal_code};${address.country}
`;
    (websites || []).forEach(url => {
        if(url) vcf += `URL:${url}\n`;
    });
    vcf += `END:VCARD`;

    return vcf;
};

const ContactDetail: React.FC<ContactDetailProps> = ({ contact, onBack, onUpdateContact, onDelete, onToggleFavorite, onToggleHide, allTags, events, onCreateEvent }) => {
    const { settings } = useAppContext();
    const [isEditing, setIsEditing] = useState(false);
    const [editedContact, setEditedContact] = useState<Contact>(contact);
    
    const [isNewEventModalOpen, setIsNewEventModalOpen] = useState(false);
    const [newEventName, setNewEventName] = useState('');
    const [isQrModalOpen, setIsQrModalOpen] = useState(false);
    const [showFullAddress, setShowFullAddress] = useState(false);
    
    const isParadiigmContact = contact.id === 'paradiigm_contact_id';
    const isFeaturedContact = contact.featured === true;

    useEffect(() => {
        setEditedContact(contact);
    }, [contact]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name.startsWith('address.')) {
            const addressField = name.split('.')[1];
            setEditedContact(prev => ({ ...prev, address: {...prev.address, [addressField]: value } }));
        } else {
            setEditedContact(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleTagsChange = (newTags: string[]) => {
        setEditedContact(prev => ({...prev, tags: newTags}));
    };
    
    const handleEventLinkChange = (index: number, field: keyof EventLink, value: string) => {
        const newEventLinks = [...editedContact.eventLinks];
        newEventLinks[index] = { ...newEventLinks[index], [field]: value };
        setEditedContact(prev => ({ ...prev, eventLinks: newEventLinks }));
    };

    const addEventLink = () => {
        const defaultEventRole = (settings.defaultEventRole || 'Attendee') as EventRole;
        setEditedContact(prev => ({
            ...prev,
            eventLinks: [...prev.eventLinks, { eventId: events[0]?.id || '', role: defaultEventRole }]
        }));
    };

    const removeEventLink = (index: number) => {
        setEditedContact(prev => ({
            ...prev,
            eventLinks: prev.eventLinks.filter((_, i) => i !== index)
        }));
    };
    
    const handleCreateNewEvent = () => {
        if(newEventName.trim()) {
            const defaultEventRole = (settings.defaultEventRole || 'Attendee') as EventRole;
            const newEvent = onCreateEvent({name: newEventName.trim()});
            setEditedContact(prev => ({
                ...prev, 
                eventLinks: [...prev.eventLinks, { eventId: newEvent.id, role: defaultEventRole}]
            }));
            setNewEventName('');
            setIsNewEventModalOpen(false);
        }
    };

    const handleReminderChange = (date: string | null) => {
        setEditedContact(prev => ({...prev, follow_up_date: date || undefined}));
    };
    
    const handleWebsiteChange = (index: number, value: string) => {
        const newWebsites = [...(editedContact.websites || [])];
        newWebsites[index] = value;
        setEditedContact(prev => ({ ...prev, websites: newWebsites }));
    };

    const addWebsite = () => {
        setEditedContact(prev => ({ ...prev, websites: [...(prev.websites || []), ''] }));
    };

    const removeWebsite = (index: number) => {
        setEditedContact(prev => ({ ...prev, websites: (prev.websites || []).filter((_, i) => i !== index) }));
    };

    const handleSave = () => {
        const finalContact = {
            ...editedContact,
            websites: (editedContact.websites || []).filter(w => w && w.trim() !== ''),
        };
        onUpdateContact(finalContact);
        setIsEditing(false);
    };
    
    const handleDelete = () => {
        if(window.confirm(`Are you sure you want to delete ${contact.name}?`)) {
            onDelete(contact.id);
        }
    };
    
    const getVcfFile = () => {
        const vcfData = generateVCF(contact);
        return new File([vcfData], `${contact.name.replace(/\s/g, '_')}.vcf`, { type: 'text/vcard;charset=utf-8' });
    };

    const handleDownloadVCF = () => {
        const file = getVcfFile();
        const url = URL.createObjectURL(file);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', file.name);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };
    
    const handleShare = async () => {
        if (typeof navigator === 'undefined' || !navigator.share) {
            alert('Sharing is not supported on this device. Please use the download button instead.');
            return;
        }

        const shareData: ShareData = {
            title: `Contact: ${contact.name}`,
            text: `${contact.name} - ${contact.role} at ${contact.company}`,
        };

        const vcfFile = getVcfFile();

        if (navigator.canShare && navigator.canShare({ files: [vcfFile] })) {
            shareData.files = [vcfFile];
        } else if (contact.handle && typeof window !== 'undefined') {
             shareData.url = `${window.location.origin}/u/${contact.handle}`;
        }
        
        try {
            await navigator.share(shareData);
        } catch (err: any) {
            if (err.name !== 'AbortError') {
                console.error('Error sharing contact:', err);
            }
        }
    };
    
    const formatAddress = (address: Contact['address']) => {
        if (!address) return '';
        const parts = [address.street, address.city, address.state, address.postal_code, address.country];
        return parts.filter(Boolean).join(', ');
    };
    
    const states = locationData[editedContact.address.country] || [];
    
    const getEventName = (eventId: string) => events.find(e => e.id === eventId)?.name;
    
    return (
        <>
            {isNewEventModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
                    <div className="bg-[rgb(var(--color-bg-secondary))] rounded-lg shadow-xl p-6 w-full max-w-sm">
                        <h3 className="text-lg font-bold mb-4">Create New Event</h3>
                        <input type="text" value={newEventName} onChange={(e) => setNewEventName(e.target.value)} placeholder="Event name..." className="w-full bg-[rgb(var(--color-bg-tertiary))] p-2 rounded mb-4" autoFocus />
                        <div className="flex justify-end gap-3"><button onClick={() => setIsNewEventModalOpen(false)} className="px-4 py-2 font-semibold bg-[rgb(var(--color-bg-subtle))] rounded">Cancel</button><button onClick={handleCreateNewEvent} className="px-4 py-2 font-semibold bg-[rgb(var(--color-primary))] text-[rgb(var(--color-primary-text))] rounded">Create & Add</button></div>
                    </div>
                </div>
            )}
            <div className="p-4 sm:p-6 bg-[rgb(var(--color-bg-secondary))] rounded-lg shadow space-y-4">
                <div className="flex items-center justify-between">
                    <button onClick={onBack} className="flex items-center gap-2 text-[rgb(var(--color-primary))] hover:underline">
                        <ArrowLeftIcon className="h-4 w-4" />
                        Back
                    </button>
                    <div className="flex items-center gap-2">
                        <button onClick={() => onToggleFavorite(contact.id)} className={`p-2 transition-colors ${contact.isFavorite ? 'text-yellow-400 hover:text-yellow-500' : 'text-[rgb(var(--color-text-subtle))] hover:text-yellow-400'}`} aria-label="Toggle Favorite">
                            <StarIcon className="h-5 w-5" />
                        </button>
                        <button onClick={() => setIsQrModalOpen(true)} className="p-2 text-[rgb(var(--color-text-subtle))] hover:text-[rgb(var(--color-text-primary))]" aria-label="Show QR Code">
                            <QrCodeIcon className="h-5 w-5" />
                        </button>
                        {typeof navigator !== 'undefined' && 'share' in navigator && (
                            <button onClick={handleShare} className="p-2 text-[rgb(var(--color-text-subtle))] hover:text-[rgb(var(--color-text-primary))]" aria-label="Share Contact">
                                <ShareIcon className="h-5 w-5" />
                            </button>
                        )}
                        <button onClick={handleDownloadVCF} className="p-2 text-[rgb(var(--color-text-subtle))] hover:text-[rgb(var(--color-text-primary))]" aria-label="Download vCard">
                            <DownloadIcon className="h-5 w-5" />
                        </button>
                        {!isFeaturedContact && (
                           isEditing ? (
                                <button onClick={handleSave} className="p-2 text-[rgb(var(--color-success))] hover:opacity-80">
                                   <SaveIcon className="h-5 w-5" />
                                </button>
                            ) : (
                                <button onClick={() => setIsEditing(true)} className="p-2 text-[rgb(var(--color-text-subtle))] hover:text-[rgb(var(--color-text-primary))]">
                                    <EditIcon className="h-5 w-5" />
                                </button>
                            )
                        )}
                        {isFeaturedContact ? (
                            onToggleHide && (
                                <button 
                                    onClick={() => onToggleHide(contact.id)} 
                                    className="px-3 py-1.5 text-sm font-semibold bg-[rgb(var(--color-bg-subtle))] text-[rgb(var(--color-text-primary))] rounded hover:opacity-80"
                                    title={contact.hidden ? "Unhide Contact" : "Hide Contact"}
                                >
                                    {contact.hidden ? 'Unhide' : 'Hide'}
                                </button>
                            )
                        ) : (
                            <button onClick={handleDelete} className="p-2 text-[rgb(var(--color-danger))] hover:opacity-80" title="Delete Contact">
                                <TrashIcon className="h-5 w-5" />
                            </button>
                        )}
                    </div>
                </div>

                {isEditing ? (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-[rgb(var(--color-text-subtle))]">Name</label>
                                <input name="name" value={editedContact.name} onChange={handleChange} placeholder="Name" className="w-full bg-[rgb(var(--color-bg-tertiary))] p-2 rounded" />
                            </div>
                            <div>
                                <label className="text-xs text-[rgb(var(--color-text-subtle))]">Contact Type</label>
                                <CustomSelect options={CONTACT_TYPES} value={editedContact.contactType} onChange={(v) => setEditedContact(p => ({...p, contactType: v as ContactType}))} />
                            </div>
                            <div>
                                <label className="text-xs text-[rgb(var(--color-text-subtle))]">Role</label>
                                <input name="role" value={editedContact.role} onChange={handleChange} placeholder="Role" className="w-full bg-[rgb(var(--color-bg-tertiary))] p-2 rounded" />
                            </div>
                            <div>
                                <label className="text-xs text-[rgb(var(--color-text-subtle))]">Profession</label>
                                <select 
                                    value={editedContact.profession || ''} 
                                    onChange={(e) => setEditedContact(p => ({...p, profession: e.target.value as Profession || undefined}))}
                                    className="w-full bg-[rgb(var(--color-bg-tertiary))] p-2 rounded text-[rgb(var(--color-text-primary))]"
                                >
                                    <option value="">Select Profession (Optional)</option>
                                    {PROFESSIONS.map(profession => (
                                        <option key={profession} value={profession}>{profession}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-[rgb(var(--color-text-subtle))]">Company</label>
                                <input name="company" value={editedContact.company} onChange={handleChange} placeholder="Company" className="w-full bg-[rgb(var(--color-bg-tertiary))] p-2 rounded" />
                            </div>
                             <div>
                                <label className="text-xs text-[rgb(var(--color-text-subtle))]">Email</label>
                                <input name="email" type="email" value={editedContact.email} onChange={handleChange} placeholder="Email" className="w-full bg-[rgb(var(--color-bg-tertiary))] p-2 rounded" />
                             </div>
                             <div>
                                <label className="text-xs text-[rgb(var(--color-text-subtle))]">Phone</label>
                                <input name="phone" type="tel" value={editedContact.phone} onChange={handleChange} placeholder="Phone" className="w-full bg-[rgb(var(--color-bg-tertiary))] p-2 rounded" />
                             </div>
                        </div>
                        <div className="space-y-2 p-3 border border-[rgb(var(--color-border))] rounded-md">
                            <h3 className="font-semibold text-[rgb(var(--color-text-secondary))]">Websites</h3>
                            {(editedContact.websites || []).map((website, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <input
                                        type="url"
                                        value={website}
                                        onChange={(e) => handleWebsiteChange(index, e.target.value)}
                                        placeholder="https://example.com"
                                        className="flex-grow w-full bg-[rgb(var(--color-bg-tertiary))] p-2 rounded"
                                    />
                                    <button type="button" onClick={() => removeWebsite(index)} className="p-2 text-[rgb(var(--color-danger))] hover:opacity-75"><TrashIcon className="h-5 w-5" /></button>
                                </div>
                            ))}
                            <button type="button" onClick={addWebsite} className="w-full flex items-center justify-center gap-2 px-3 py-2 font-semibold text-[rgb(var(--color-text-secondary))] bg-[rgb(var(--color-bg-subtle))] rounded hover:opacity-80">
                                <PlusIcon className="h-4 w-4"/> Add Website
                            </button>
                        </div>
                        <div className="space-y-2 p-3 border border-[rgb(var(--color-border))] rounded-md">
                            <h3 className="font-semibold text-[rgb(var(--color-text-secondary))]">Location (for filtering)</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <select 
                                    name="locationState" 
                                    value={editedContact.locationState || ''} 
                                    onChange={(e) => handleChange(e as any)} 
                                    className="w-full bg-[rgb(var(--color-bg-tertiary))] p-2 rounded"
                                >
                                    <option value="">-- Select State --</option>
                                    {US_STATES.map(state => (
                                        <option key={state} value={`United States - ${state}`}>United States - {state}</option>
                                    ))}
                                </select>
                                <input 
                                    name="locationCity" 
                                    value={editedContact.locationCity || ''} 
                                    onChange={handleChange} 
                                    placeholder="City" 
                                    className="w-full bg-[rgb(var(--color-bg-tertiary))] p-2 rounded" 
                                />
                            </div>
                            <button type="button" onClick={() => setShowFullAddress(!showFullAddress)} className="w-full flex items-center justify-center gap-2 px-3 py-2 font-semibold text-[rgb(var(--color-text-secondary))] bg-[rgb(var(--color-bg-subtle))] rounded hover:opacity-80">
                                <PlusIcon className="h-4 w-4"/> Add Address
                            </button>
                            {showFullAddress && (
                                <div className="space-y-2 pt-2 border-t border-[rgb(var(--color-border))]">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <input name="address.street" value={editedContact.address.street} onChange={handleChange} placeholder="Street Number" className="w-full bg-[rgb(var(--color-bg-tertiary))] p-2 rounded" />
                                        <input name="address.city" value={editedContact.address.city} onChange={handleChange} placeholder="Suite Number" className="w-full bg-[rgb(var(--color-bg-tertiary))] p-2 rounded" />
                                    </div>
                                    <input name="address.postal_code" value={editedContact.address.postal_code} onChange={handleChange} placeholder="Zip Code" className="w-full bg-[rgb(var(--color-bg-tertiary))] p-2 rounded" />
                                </div>
                            )}
                        </div>
                        <div className="space-y-3 p-3 border border-[rgb(var(--color-border))] rounded-md">
                            <div className="flex justify-between items-center">
                                <h3 className="font-semibold text-[rgb(var(--color-text-secondary))]">Events</h3>
                                <button type="button" onClick={() => setIsNewEventModalOpen(true)} className="px-3 py-1 text-xs font-semibold bg-[rgb(var(--color-bg-tertiary))] text-[rgb(var(--color-text-primary))] rounded hover:opacity-80">New Event</button>
                            </div>
                             {editedContact.eventLinks.map((link, index) => (
                                <div key={index} className="grid grid-cols-[1fr_auto_auto] gap-2 items-center p-2 bg-[rgb(var(--color-bg-tertiary))] rounded">
                                    <select value={link.eventId} onChange={e => handleEventLinkChange(index, 'eventId', e.target.value)} className="w-full bg-[rgb(var(--color-bg-secondary))] p-2 rounded">
                                        <option value="">-- Select Event --</option>
                                        {events.map(event => <option key={event.id} value={event.id}>{event.name}</option>)}
                                    </select>
                                    <select value={link.role} onChange={e => handleEventLinkChange(index, 'role', e.target.value)} className="w-full bg-[rgb(var(--color-bg-secondary))] p-2 rounded">
                                        {EVENT_ROLES.map(role => <option key={role} value={role}>{role}</option>)}
                                    </select>
                                    <button type="button" onClick={() => removeEventLink(index)} className="p-2 text-[rgb(var(--color-danger))] hover:opacity-75"><TrashIcon className="h-5 w-5" /></button>
                                </div>
                            ))}
                            <button type="button" onClick={addEventLink} className="w-full flex items-center justify-center gap-2 px-3 py-2 font-semibold text-[rgb(var(--color-text-secondary))] bg-[rgb(var(--color-bg-subtle))] rounded hover:opacity-80">
                                <PlusIcon className="h-4 w-4"/> Add Event
                            </button>
                        </div>
                        <textarea name="notes" value={editedContact.notes} onChange={handleChange} rows={4} className="w-full bg-[rgb(var(--color-bg-tertiary))] p-2 rounded" placeholder="Notes..." />
                        <TagEditor tags={editedContact.tags} setTags={handleTagsChange} allTags={allTags} />
                        <ReminderSetter 
                            currentDate={editedContact.follow_up_date} 
                            onDateChange={handleReminderChange}
                            contactName={editedContact.name}
                        />
                        
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
                    <div className="space-y-3">
                        {contact.image_url && <Image unoptimized src={contact.image_url} alt={`${contact.name}'s business card`} width={400} height={250} className="rounded-lg max-w-sm w-full mx-auto shadow-md mb-4" />}
                        <div>
                            <h2 className="text-2xl font-bold text-[rgb(var(--color-text-primary))] flex items-center">
                                {contact.name}
                            </h2>
                            <p className="text-lg text-[rgb(var(--color-text-secondary))]">{contact.role} at {contact.company}</p>
                            <div className="flex flex-wrap gap-2 mt-1">
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 font-medium bg-teal-500/10 text-teal-800 dark:text-teal-300 rounded-md">
                                    <IdentificationIcon className="h-4 w-4" />
                                    {contact.contactType}
                                </span>
                                {contact.profession && (
                                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 font-medium bg-purple-500/10 text-purple-800 dark:text-purple-300 rounded-md">
                                        {contact.profession}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div>
                            <p><a href={`mailto:${contact.email}`} className="text-[rgb(var(--color-primary))] hover:underline">{contact.email}</a></p>
                            <p><a href={`tel:${contact.phone}`} className="text-[rgb(var(--color-primary))] hover:underline">{contact.phone}</a></p>
                            {formatAddress(contact.address) && <p className="text-[rgb(var(--color-text-secondary))] pt-1">{formatAddress(contact.address)}</p>}
                        </div>
                        {(contact.websites && contact.websites.length > 0) && (
                            <div className="space-y-1">
                                {contact.websites.map((site, index) => (
                                    <p key={index} className="flex items-center gap-2">
                                        <LinkIcon className="h-4 w-4 text-[rgb(var(--color-text-subtle))]" />
                                        <a href={site} target="_blank" rel="noopener noreferrer" className="text-[rgb(var(--color-primary))] hover:underline truncate">{site}</a>
                                    </p>
                                ))}
                            </div>
                        )}
                        {contact.eventLinks.length > 0 && (
                            <div className="p-3 bg-[rgb(var(--color-bg-tertiary))] rounded-md space-y-1">
                                <p className="font-semibold">Events:</p>
                                <ul className="list-disc list-inside pl-2">
                                    {contact.eventLinks.map(link => {
                                        const eventName = getEventName(link.eventId);
                                        return eventName ? (<li key={link.eventId}>{eventName} <span className="text-[rgb(var(--color-text-subtle))]">({link.role})</span></li>) : null;
                                    })}
                                </ul>
                            </div>
                        )}
                        {contact.follow_up_date && <p className="font-medium text-[rgb(var(--color-primary))]">Follow-up: {new Date(contact.follow_up_date).toLocaleString([], {dateStyle: 'medium', timeStyle: 'short'})}</p>}
                        {contact.notes && <p className="whitespace-pre-wrap pt-2 border-t border-[rgb(var(--color-border))]">{contact.notes}</p>}
                        <div className="flex flex-wrap gap-2 pt-2">
                            {contact.tags.map(tag => (
                                <span key={tag} className="px-2 py-1 text-xs font-medium bg-[rgb(var(--color-bg-subtle))] text-[rgb(var(--color-text-secondary))] rounded-full">{tag}</span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            {isQrModalOpen && (
                <QrCodeModal contact={contact} onClose={() => setIsQrModalOpen(false)} title={`${contact.name}'s QR Code`} />
            )}
        </>
    );
};

export default ContactDetail;