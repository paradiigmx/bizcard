"use client";
import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode.react';
import type { Contact, Event, EventRole, EventLink } from '../types';
import { ArrowLeftIcon, SaveIcon, EditIcon, QrCodeIcon, PlusIcon, TrashIcon, LinkIcon, CameraIcon } from './icons';
import TagEditor from './TagEditor';
import QrCodeModal from './QrCodeModal';
import { locationData, countries } from '../locationData';
import { compressImage } from '../utils';

interface MyProfileProps {
    profile: Contact;
    onUpdateProfile: (profile: Contact) => void;
    allTags: string[];
    events: Event[];
    onCreateEvent: (eventDetails: Omit<Event, 'id'>) => Event;
}

const EVENT_ROLES: EventRole[] = ['Attendee', 'Speaker', 'Host', 'Guest', 'Exhibitor'];

const MyProfile: React.FC<MyProfileProps> = ({ profile, onUpdateProfile, allTags, events, onCreateEvent }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedProfile, setEditedProfile] = useState<Contact>(profile);
    const [isQrModalOpen, setIsQrModalOpen] = useState(false);
    const [isNewEventModalOpen, setIsNewEventModalOpen] = useState(false);
    const [newEventName, setNewEventName] = useState('');

    useEffect(() => {
        setEditedProfile(profile);
    }, [profile]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name.startsWith('address.')) {
            const addressField = name.split('.')[1];
            setEditedProfile(prev => ({ ...prev, address: {...prev.address, [addressField]: value } }));
        } else {
            setEditedProfile(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleTagsChange = (newTags: string[]) => {
        setEditedProfile(prev => ({...prev, tags: newTags}));
    };
    
    const handleEventLinkChange = (index: number, field: keyof EventLink, value: string) => {
        const newEventLinks = [...editedProfile.eventLinks];
        newEventLinks[index] = { ...newEventLinks[index], [field]: value };
        setEditedProfile(prev => ({ ...prev, eventLinks: newEventLinks }));
    };

    const addEventLink = () => {
        setEditedProfile(prev => ({
            ...prev,
            eventLinks: [...prev.eventLinks, { eventId: events[0]?.id || '', role: 'Attendee' }]
        }));
    };

    const removeEventLink = (index: number) => {
        setEditedProfile(prev => ({
            ...prev,
            eventLinks: prev.eventLinks.filter((_, i) => i !== index)
        }));
    };

    const handleCreateNewEvent = () => {
        if(newEventName.trim()) {
            const newEvent = onCreateEvent({ name: newEventName.trim() });
            setEditedProfile(prev => ({
                ...prev, 
                eventLinks: [...prev.eventLinks, { eventId: newEvent.id, role: 'Attendee'}]
            }));
            setNewEventName('');
            setIsNewEventModalOpen(false);
        }
    };
    
    const handleWebsiteChange = (index: number, value: string) => {
        const newWebsites = [...(editedProfile.websites || [])];
        newWebsites[index] = value;
        setEditedProfile(prev => ({ ...prev, websites: newWebsites }));
    };

    const addWebsite = () => {
        setEditedProfile(prev => ({ ...prev, websites: [...(prev.websites || []), ''] }));
    };

    const removeWebsite = (index: number) => {
        setEditedProfile(prev => ({ ...prev, websites: (prev.websites || []).filter((_, i) => i !== index) }));
    };

    const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const compressedImage = await compressImage(file, 200, 200, 0.8);
                setEditedProfile(prev => ({ ...prev, image_url: compressedImage }));
            } catch (error) {
                console.error('Failed to compress image:', error);
                alert('Failed to upload image. Please try again.');
            }
        }
    };

    const removeProfilePicture = () => {
        setEditedProfile(prev => ({ ...prev, image_url: undefined }));
    };

    const handleSave = () => {
        const finalProfile = {
            ...editedProfile,
            websites: (editedProfile.websites || []).filter(w => w && w.trim() !== '')
        };
        onUpdateProfile(finalProfile);
        setIsEditing(false);
    };
        
    const formatAddress = (address: Contact['address']) => {
        if (!address) return '';
        const parts = [address.street, address.city, address.state, address.postal_code, address.country];
        return parts.filter(Boolean).join(', ');
    };
    
    const states = locationData[editedProfile.address.country] || [];
    const getEventName = (eventId: string) => events.find(e => e.id === eventId)?.name;
    
    return (
        <>
             {isQrModalOpen && (
                <QrCodeModal contact={profile} onClose={() => setIsQrModalOpen(false)} />
             )}
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
                     <h2 className="text-3xl font-bold text-[rgb(var(--color-text-primary))]">My Profile</h2>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setIsQrModalOpen(true)} className="p-2 text-[rgb(var(--color-text-subtle))] hover:text-[rgb(var(--color-text-primary))]" aria-label="Show QR Code">
                           <QrCodeIcon className="h-5 w-5" />
                        </button>
                        {isEditing ? (
                            <button onClick={handleSave} className="p-2 text-[rgb(var(--color-success))] hover:opacity-80" aria-label="Save Profile">
                               <SaveIcon className="h-5 w-5" />
                            </button>
                        ) : (
                            <button onClick={() => setIsEditing(true)} className="p-2 text-[rgb(var(--color-text-subtle))] hover:text-[rgb(var(--color-text-primary))]" aria-label="Edit Profile">
                                <EditIcon className="h-5 w-5" />
                            </button>
                        )}
                    </div>
                </div>

                {isEditing ? (
                    <div className="space-y-4">
                        <div className="flex flex-col items-center p-4 bg-[rgb(var(--color-bg-tertiary))] rounded-lg">
                            <div className="relative">
                                {editedProfile.image_url ? (
                                    <div className="relative">
                                        <img src={editedProfile.image_url} alt="Profile" className="w-32 h-32 rounded-full object-cover object-center border-4 border-[rgb(var(--color-primary))]" />
                                        <button
                                            onClick={removeProfilePicture}
                                            className="absolute -top-2 -right-2 bg-[rgb(var(--color-danger))] text-white rounded-full p-1.5 hover:opacity-90"
                                            type="button"
                                        >
                                            <TrashIcon className="h-4 w-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="w-32 h-32 rounded-full bg-[rgb(var(--color-bg-subtle))] flex items-center justify-center border-4 border-dashed border-[rgb(var(--color-border))]">
                                        <CameraIcon className="h-12 w-12 text-[rgb(var(--color-text-subtle))]" />
                                    </div>
                                )}
                            </div>
                            <label className="mt-4 px-4 py-2 bg-[rgb(var(--color-primary))] text-[rgb(var(--color-primary-text))] rounded-lg font-semibold cursor-pointer hover:opacity-90 transition-opacity">
                                {editedProfile.image_url ? 'Change Photo' : 'Upload Photo'}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleProfilePictureUpload}
                                    className="hidden"
                                />
                            </label>
                            <p className="text-xs text-[rgb(var(--color-text-subtle))] mt-2">Image will be compressed for optimal storage</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input name="name" value={editedProfile.name} onChange={handleChange} placeholder="Name" className="w-full bg-[rgb(var(--color-bg-tertiary))] p-2 rounded" />
                            <input name="role" value={editedProfile.role} onChange={handleChange} placeholder="Role" className="w-full bg-[rgb(var(--color-bg-tertiary))] p-2 rounded" />
                            <input name="company" value={editedProfile.company} onChange={handleChange} placeholder="Company" className="w-full bg-[rgb(var(--color-bg-tertiary))] p-2 rounded" />
                            <input name="email" type="email" value={editedProfile.email} onChange={handleChange} placeholder="Email" className="w-full bg-[rgb(var(--color-bg-tertiary))] p-2 rounded" />
                            <input name="phone" type="tel" value={editedProfile.phone} onChange={handleChange} placeholder="Phone" className="w-full bg-[rgb(var(--color-bg-tertiary))] p-2 rounded" />
                            <input name="handle" value={editedProfile.handle} onChange={handleChange} placeholder="Public Handle (e.g., alex-doe)" className="w-full bg-[rgb(var(--color-bg-tertiary))] p-2 rounded" />
                        </div>
                        <div className="space-y-2 p-3 border border-[rgb(var(--color-border))] rounded-md">
                            <h3 className="font-semibold text-[rgb(var(--color-text-secondary))]">Websites</h3>
                            {(editedProfile.websites || []).map((website, index) => (
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
                            <h3 className="font-semibold text-[rgb(var(--color-text-secondary))]">Address</h3>
                            <input name="address.street" value={editedProfile.address.street} onChange={handleChange} placeholder="Street" className="w-full bg-[rgb(var(--color-bg-tertiary))] p-2 rounded" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               <input name="address.city" value={editedProfile.address.city} onChange={handleChange} placeholder="City" className="w-full bg-[rgb(var(--color-bg-tertiary))] p-2 rounded" />
                               <input name="address.postal_code" value={editedProfile.address.postal_code} onChange={handleChange} placeholder="Postal Code" className="w-full bg-[rgb(var(--color-bg-tertiary))] p-2 rounded" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <select name="address.country" value={editedProfile.address.country} onChange={(e) => handleChange(e as any)} className="w-full bg-[rgb(var(--color-bg-tertiary))] p-2 rounded mt-2">
                                    {countries.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                <select name="address.state" value={editedProfile.address.state} onChange={(e) => handleChange(e as any)} className="w-full bg-[rgb(var(--color-bg-tertiary))] p-2 rounded mt-2" disabled={states.length === 0}>
                                    <option value="">-- Select State --</option>
                                    {states.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="space-y-3 p-3 border border-[rgb(var(--color-border))] rounded-md">
                            <div className="flex justify-between items-center">
                                <h3 className="font-semibold text-[rgb(var(--color-text-secondary))]">My Events</h3>
                                <button type="button" onClick={() => setIsNewEventModalOpen(true)} className="px-3 py-1 text-xs font-semibold bg-[rgb(var(--color-bg-tertiary))] text-[rgb(var(--color-text-primary))] rounded hover:opacity-80">New Event</button>
                            </div>
                             {editedProfile.eventLinks.map((link, index) => (
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
                        <textarea name="notes" value={editedProfile.notes} onChange={handleChange} rows={3} className="w-full bg-[rgb(var(--color-bg-tertiary))] p-2 rounded" placeholder="Notes..." />
                        <TagEditor tags={editedProfile.tags} setTags={handleTagsChange} allTags={allTags} />
                    </div>
                ) : (
                    <div className="space-y-3">
                        {profile.image_url && (
                            <div className="flex justify-center">
                                <img src={profile.image_url} alt={profile.name} className="w-32 h-32 rounded-full object-cover object-center border-4 border-[rgb(var(--color-primary))]" />
                            </div>
                        )}
                        <div className={profile.image_url ? 'text-center' : ''}>
                            <h2 className="text-2xl font-bold text-[rgb(var(--color-text-primary))]">{profile.name}</h2>
                            <p className="text-lg text-[rgb(var(--color-text-secondary))]">{profile.role} at {profile.company}</p>
                        </div>
                        <div>
                            <p><a href={`mailto:${profile.email}`} className="text-[rgb(var(--color-primary))] hover:underline">{profile.email}</a></p>
                            <p><a href={`tel:${profile.phone}`} className="text-[rgb(var(--color-primary))] hover:underline">{profile.phone}</a></p>
                            {formatAddress(profile.address) && <p className="text-[rgb(var(--color-text-secondary))] pt-1">{formatAddress(profile.address)}</p>}
                        </div>
                         {(profile.websites && profile.websites.length > 0) && (
                            <div className="space-y-1">
                                {profile.websites.map((site, index) => (
                                    <p key={index} className="flex items-center gap-2">
                                        <LinkIcon className="h-4 w-4 text-[rgb(var(--color-text-subtle))]" />
                                        <a href={site} target="_blank" rel="noopener noreferrer" className="text-[rgb(var(--color-primary))] hover:underline truncate">{site}</a>
                                    </p>
                                ))}
                            </div>
                        )}
                        {profile.notes && <p className="whitespace-pre-wrap pt-2 border-t border-[rgb(var(--color-border))]">{profile.notes}</p>}
                        {profile.eventLinks.length > 0 && (
                            <div className="p-3 bg-[rgb(var(--color-bg-tertiary))] rounded-md space-y-1">
                                <p className="font-semibold">My Events:</p>
                                <ul className="list-disc list-inside pl-2">
                                    {profile.eventLinks.map(link => {
                                        const eventName = getEventName(link.eventId);
                                        return eventName ? (<li key={link.eventId}>{eventName} <span className="text-[rgb(var(--color-text-subtle))]">({link.role})</span></li>) : null
                                    })}
                                </ul>
                            </div>
                        )}
                        
                        {profile.handle && (
                            <div className="flex justify-center p-6 bg-[rgb(var(--color-bg-tertiary))] rounded-lg">
                                <div className="text-center">
                                    <p className="text-sm font-semibold text-[rgb(var(--color-text-secondary))] mb-3">My QR Code</p>
                                    <div className="inline-block p-3 bg-white rounded-lg">
                                        <QRCode value={`${typeof window !== 'undefined' ? window.location.origin : ''}/u/${profile.handle}`} size={180} level="H" includeMargin={true} />
                                    </div>
                                    <p className="text-xs text-[rgb(var(--color-text-subtle))] mt-3">Share this code to connect</p>
                                </div>
                            </div>
                        )}
                        
                        <div className="flex flex-wrap gap-2 pt-2">
                            {profile.tags.map(tag => (
                                <span key={tag} className="px-2 py-1 text-xs font-medium bg-[rgb(var(--color-bg-subtle))] text-[rgb(var(--color-text-secondary))] rounded-full">{tag}</span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default MyProfile;