"use client";
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { GoogleGenAI, Type } from "@google/genai";
import type { Contact, Event, EventRole, EventLink, ContactType, Profession } from '../types';
import { CONTACT_TYPES, PROFESSIONS } from '../types';
import TagEditor from './TagEditor';
import ReminderSetter from './ReminderSetter';
import { locationData, countries } from '../locationData';
import { CameraIcon, XIcon, PlusIcon, TrashIcon, ChevronDownIcon, LinkIcon } from './icons';
import { useAppContext } from '../app/provider';
import { US_STATES } from '../constants';

interface AddContactProps {
    onSaveContact: (contact: Omit<Contact, 'id'>) => Contact;
    onCancel: () => void;
    allTags: string[];
    events: Event[];
    defaultEventId: string | null;
    defaultCompanyId: string | null;
    onCreateEvent: (eventName: Omit<Event, 'id'>) => Event;
    prefillData?: Omit<Contact, 'id'> | null;
    existingContacts: Contact[];
    autoOpenCamera?: boolean;
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

const AddContact: React.FC<AddContactProps> = ({ onSaveContact, onCancel, allTags, events, defaultEventId, defaultCompanyId, onCreateEvent, prefillData, existingContacts, autoOpenCamera = false }) => {
    const { findOrCreateCompanyByName, companies, handleCreateCompany, getCompanyById, settings, handleSaveContact, handleAddContactsToList, canAddContact } = useAppContext();
    const router = useRouter();
    
    // Wrapper to update contact
    const updateContact = (updater: React.SetStateAction<Omit<Contact, 'id'>>) => {
        setContact(updater);
    };
    
    // Initialize contact state with a function to avoid calling hooks during initialization
    const [contact, setContact] = useState<Omit<Contact, 'id'>>(() => {
        if (prefillData) return prefillData;
        
        // Get the most recently created event
        const mostRecentEvent = events.length > 0 
            ? events.reduce((latest, event) => {
                const eventDate = event.date ? new Date(event.date) : new Date(0);
                const latestDate = latest.date ? new Date(latest.date) : new Date(0);
                return eventDate > latestDate ? event : latest;
            }, events[0])
            : null;
        
        const initialEventId = defaultEventId || mostRecentEvent?.id;
        const defaultEventRole = (settings.defaultEventRole || 'Attendee') as EventRole;
        const defaultContactType = settings.defaultContactType || 'Lead';
        
        return {
            name: '', 
            role: '', 
            company: defaultCompanyId ? (getCompanyById(defaultCompanyId)?.name || '') : '', 
            email: '', 
            phone: '', 
            websites: [],
            address: { street: '', city: '', state: '', postal_code: '', country: 'United States' },
            notes: '', 
            tags: [], 
            image_url: undefined, 
            follow_up_date: undefined,
            eventLinks: initialEventId ? [{ eventId: initialEventId, role: defaultEventRole }] : [], 
            companyId: defaultCompanyId || undefined,
            isFavorite: false,
            contactType: defaultContactType as ContactType,
            profession: undefined,
            metAt: '',
            locationState: '',
            locationCity: '',
        };
    });
    
    useEffect(() => {
        if (prefillData) {
            setContact(prefillData);
        } else if (autoOpenCamera) {
             // Automatically open camera if autoOpenCamera is true
            openCamera();
        }
        
        // Cleanup camera on unmount
        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [prefillData, autoOpenCamera]);

    const [isProcessing, setIsProcessing] = useState(false);
    const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isSavingRef = useRef(false);
    
    const [isNewEventModalOpen, setIsNewEventModalOpen] = useState(false);
    const [newEventName, setNewEventName] = useState('');
    
    const [isNewCompanyModalOpen, setIsNewCompanyModalOpen] = useState(false);
    const [newCompanyName, setNewCompanyName] = useState('');
    const [selectedCompanyId, setSelectedCompanyId] = useState<string>(defaultCompanyId || '');
    const [showFullAddress, setShowFullAddress] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name.startsWith('address.')) {
            const addressField = name.split('.')[1];
            updateContact(prev => {
                const newAddress = {...prev.address, [addressField]: value };
                if (addressField === 'country') newAddress.state = '';
                return { ...prev, address: newAddress };
            });
        } else {
            updateContact(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleTagsChange = (newTags: string[]) => {
        updateContact(prev => ({...prev, tags: newTags}));
    };

    const handleReminderChange = (date: string | null) => {
        updateContact(prev => ({...prev, follow_up_date: date || undefined}));
    };
    
    const handleEventLinkChange = (index: number, field: keyof EventLink, value: string) => {
        const newEventLinks = [...contact.eventLinks];
        newEventLinks[index] = { ...newEventLinks[index], [field]: value as EventRole };
        updateContact(prev => ({ ...prev, eventLinks: newEventLinks }));
    };

    const addEventLink = () => {
        const defaultEventRole = (settings.defaultEventRole || 'Attendee') as EventRole;
        updateContact(prev => ({
            ...prev,
            eventLinks: [...prev.eventLinks, { eventId: events[0]?.id || '', role: defaultEventRole }]
        }));
    };

    const removeEventLink = (index: number) => {
        updateContact(prev => ({
            ...prev,
            eventLinks: prev.eventLinks.filter((_, i) => i !== index)
        }));
    };
    
    const handleCreateNewEvent = () => {
        if(newEventName.trim()) {
            const defaultEventRole = (settings.defaultEventRole || 'Attendee') as EventRole;
            const newEvent = onCreateEvent({name: newEventName.trim()});
            updateContact(prev => ({
                ...prev, 
                eventLinks: [...prev.eventLinks, { eventId: newEvent.id, role: defaultEventRole}]
            }));
            setNewEventName('');
            setIsNewEventModalOpen(false);
        }
    };
    
    const handleCreateNewCompany = () => {
        if(newCompanyName.trim()) {
            const newCompany = handleCreateCompany({name: newCompanyName.trim()});
            setSelectedCompanyId(newCompany.id);
            updateContact(prev => ({
                ...prev, 
                company: newCompany.name,
                companyId: newCompany.id
            }));
            setNewCompanyName('');
            setIsNewCompanyModalOpen(false);
        }
    };
    
    const handleCompanySelect = (companyId: string) => {
        setSelectedCompanyId(companyId);
        const selectedCompany = companies.find(c => c.id === companyId);
        if (selectedCompany) {
            updateContact(prev => ({
                ...prev,
                company: selectedCompany.name,
                companyId: selectedCompany.id
            }));
        }
    };
    
    const handleCancel = () => {
        // Close camera if it's open before canceling
        if (isCameraOpen) {
            closeCamera();
        }
        onCancel();
    };
    
    const handleWebsiteChange = (index: number, value: string) => {
        const newWebsites = [...(contact.websites || [])];
        newWebsites[index] = value;
        updateContact(prev => ({ ...prev, websites: newWebsites }));
    };

    const addWebsite = () => {
        updateContact(prev => ({ ...prev, websites: [...(contact.websites || []), ''] }));
    };

    const removeWebsite = (index: number) => {
        updateContact(prev => ({ ...prev, websites: (contact.websites || []).filter((_, i) => i !== index) }));
    };

    const handleSave = () => {
        if(!contact.name) return;
        
        // Check if user can add more contacts (subscription limit)
        const { allowed, reason } = canAddContact();
        if (!allowed) {
            alert(reason);
            return;
        }

        // Prevent race conditions from rapid clicking
        if (isSavingRef.current) {
            return;
        }
        isSavingRef.current = true;

        try {
            // Check for duplicates
            const email = contact.email?.toLowerCase().trim();
            const phone = contact.phone?.replace(/\D/g,'');
            const dup = existingContacts.find(c =>
                (email && c.email?.toLowerCase().trim() === email) ||
                (phone && phone.length > 5 && c.phone?.replace(/\D/g,'') === phone)
            );

            if (dup && !window.confirm(`This looks like a duplicate of ${dup.name}. Save anyway?`)) {
                isSavingRef.current = false;
                return;
            }

            let companyId: string | undefined;
            if (contact.company && contact.company.trim()) {
                const foundOrCreatedCompany = findOrCreateCompanyByName(contact.company);
                companyId = foundOrCreatedCompany.id;
            }

            // This triggers navigation in page.tsx
            onSaveContact({
                ...contact,
                companyId,
                image_url: undefined,
                websites: (contact.websites || []).filter(w => w.trim() !== '')
            });
        } finally {
            // Reset flag in case of errors or if component stays mounted
            isSavingRef.current = false;
        }
    };
    
    const processFile = (file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const dataUrl = reader.result as string;
            setImagePreviewUrl(dataUrl);
            updateContact(prev => ({...prev, image_url: dataUrl}));
            parseImage(file);
        };
        reader.readAsDataURL(file);
    }
    
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            processFile(e.target.files[0]);
        }
    };
    
    const openCamera = async () => {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
                setIsCameraOpen(true);
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    await videoRef.current.play();
                }
            } catch (err) {
                console.error("Error accessing camera: ", err);
                alert("Could not access camera. Please ensure permissions are granted.");
            }
        }
    };
    
    const snapPhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            context?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
            canvas.toBlob((blob) => {
                if (blob) {
                    const file = new File([blob], "business-card.jpg", { type: "image/jpeg" });
                    processFile(file);
                }
            }, 'image/jpeg');
            closeCamera();
        }
    };
    
    const closeCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }
        setIsCameraOpen(false);
    };

    const fileToGenerativePart = async (file: File) => {
        const base64EncodedDataPromise = new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
            reader.readAsDataURL(file);
        });
        return { inlineData: { data: await base64EncodedDataPromise, mimeType: file.type } };
    }
    
    const parseImage = async (file: File) => {
        const apiKey = process.env.NEXT_PUBLIC_API_KEY;
        if (!apiKey) {
            alert("API Key not found.");
            return;
        }
        setIsProcessing(true);
        try {
            const ai = new GoogleGenAI({apiKey});
            const imagePart = await fileToGenerativePart(file);

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-pro',
                contents: { parts: [ { text: "Extract the contact information from this business card. Provide the full name, job title/role, company, email, phone, any website URLs, and full address (street, city, state, postal code, country)." } , imagePart] },
                config: {
                    systemInstruction: "You are an expert at parsing business cards. Prioritize finding the main company website. Also extract the full name, job title/role (abbreviating common titles like CEO, CTO, VP), company, email, phone, and full address. Return all websites found.",
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING },
                            role: { type: Type.STRING, description: "The person's job title or role." },
                            company: { type: Type.STRING },
                            email: { type: Type.STRING },
                            phone: { type: Type.STRING },
                            websites: { type: Type.ARRAY, items: { type: Type.STRING } },
                            address: {
                                type: Type.OBJECT,
                                properties: {
                                    street: { type: Type.STRING },
                                    city: { type: Type.STRING },
                                    state: { type: Type.STRING },
                                    postal_code: { type: Type.STRING },
                                    country: { type: Type.STRING }
                                }
                            }
                        }
                    }
                }
            });
            
            const responseText = response.text || '{}';
            const parsedJson = JSON.parse(responseText);
            
            const freeEmailDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'aol.com', 'outlook.com', 'icloud.com', 'live.com', 'msn.com', 'protonmail.com'];

            if ((!parsedJson.websites || parsedJson.websites.length === 0) && parsedJson.email) {
                const emailDomain = parsedJson.email.split('@')[1];
                if (emailDomain && !freeEmailDomains.includes(emailDomain.toLowerCase())) {
                    parsedJson.websites = [`https://${emailDomain}`];
                }
            }

            const newTags = new Set(contact.tags);
            if (parsedJson.role) newTags.add(parsedJson.role);
            if (parsedJson.company) newTags.add(parsedJson.company);
            if (parsedJson.address?.state) newTags.add(parsedJson.address.state);
            
            // Apply default camera tag from settings
            if (settings.filterPreferences?.defaultCameraTag) {
                newTags.add(settings.filterPreferences.defaultCameraTag);
            }

            // Smart company matching - check if parsed company matches an existing company
            let matchedCompanyId: string | undefined = undefined;
            if (parsedJson.company && parsedJson.company.trim()) {
                const matchedCompany = companies.find(c => 
                    c.name.toLowerCase().trim() === parsedJson.company.toLowerCase().trim()
                );
                if (matchedCompany) {
                    matchedCompanyId = matchedCompany.id;
                    setSelectedCompanyId(matchedCompany.id);
                }
            }

            updateContact(prev => {
                const updatedContact = {
                    ...prev,
                    name: parsedJson.name || prev.name,
                    role: parsedJson.role || prev.role,
                    company: parsedJson.company || prev.company,
                    companyId: matchedCompanyId || prev.companyId,
                    email: parsedJson.email || prev.email,
                    phone: parsedJson.phone || prev.phone,
                    websites: parsedJson.websites || prev.websites,
                    address: {
                        street: parsedJson.address?.street || prev.address.street,
                        city: parsedJson.address?.city || prev.address.city,
                        state: parsedJson.address?.state || prev.address.state,
                        postal_code: parsedJson.address?.postal_code || prev.address.postal_code,
                        country: parsedJson.address?.country || prev.address.country || 'United States',
                    },
                    tags: Array.from(newTags)
                };

                // If Snap-and-Go is enabled, auto-save the contact
                if (settings.snapAndGo && parsedJson.name && !isSavingRef.current) {
                    isSavingRef.current = true;
                    
                    // Use setTimeout to ensure state update completes before saving
                    setTimeout(() => {
                        // Check if user can add more contacts (subscription limit)
                        const { allowed, reason } = canAddContact();
                        if (!allowed) {
                            alert(reason);
                            isSavingRef.current = false;
                            return;
                        }
                        
                        let companyId: string | undefined;
                        if (updatedContact.company && updatedContact.company.trim()) {
                            const foundOrCreatedCompany = findOrCreateCompanyByName(updatedContact.company);
                            companyId = foundOrCreatedCompany.id;
                        }

                        // Apply default camera event from settings
                        let eventLinks = updatedContact.eventLinks || [];
                        if (settings.filterPreferences?.defaultCameraEvent) {
                            const defaultEventLink = {
                                eventId: settings.filterPreferences.defaultCameraEvent,
                                role: (settings.defaultEventRole ?? 'Attendee') as any
                            };
                            // Only add if not already linked
                            if (!eventLinks.some(link => link.eventId === settings.filterPreferences?.defaultCameraEvent)) {
                                eventLinks = [...eventLinks, defaultEventLink];
                            }
                        }

                        // Save and navigate immediately to contacts page
                        const savedContact = handleSaveContact({
                            ...updatedContact,
                            companyId,
                            eventLinks,
                            image_url: undefined,
                            websites: (updatedContact.websites || []).filter((w: string) => w.trim() !== '')
                        });
                        
                        // Apply default camera list from settings
                        if (settings.filterPreferences?.defaultCameraList && savedContact) {
                            handleAddContactsToList(settings.filterPreferences.defaultCameraList, [savedContact.id]);
                        }
                        
                        // Show success message briefly before navigating
                        setShowSuccessMessage(true);
                        
                        // Navigate to contacts page after a short delay to show success message
                        setTimeout(() => {
                            router.push('/');
                        }, 800);
                    }, 0);
                }

                return updatedContact;
            });

        } catch (error) {
            console.error("Error parsing image:", error);
            alert("Failed to parse contact details from image. Please enter them manually.");
        } finally {
            setIsProcessing(false);
        }
    };
    
    const states = locationData[contact.address.country] || [];

    const SkeletonLoader = () => (
        <div className="space-y-4 animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="h-10 bg-[rgb(var(--color-bg-tertiary))] rounded-md"></div>
                <div className="h-10 bg-[rgb(var(--color-bg-tertiary))] rounded-md"></div>
                <div className="h-10 bg-[rgb(var(--color-bg-tertiary))] rounded-md"></div>
                <div className="h-10 bg-[rgb(var(--color-bg-tertiary))] rounded-md"></div>
            </div>
            <div className="h-24 bg-[rgb(var(--color-bg-tertiary))] rounded-md"></div>
            <div className="h-32 bg-[rgb(var(--color-bg-tertiary))] rounded-md"></div>
        </div>
    );

    return (
        <>
            {isCameraOpen && (
                <div className="fixed inset-0 bg-black z-50 flex flex-col">
                    <div className="flex justify-between items-center p-4 bg-black/80">
                        <h3 className="text-white font-semibold">Scan Business Card</h3>
                        <button onClick={handleCancel} className="text-white">
                            <XIcon className="h-6 w-6" />
                        </button>
                    </div>
                    <div className="flex-1 relative flex items-center justify-center overflow-hidden">
                        <video 
                            ref={videoRef} 
                            autoPlay 
                            playsInline 
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                        {/* Business card aspect ratio guide (7:4 ratio like a real business card) */}
                        <div className="relative z-10 w-[92%] max-w-[850px]" style={{ aspectRatio: '7/4' }}>
                            <div className="absolute inset-0">
                                <div className="absolute top-0 left-0 w-16 h-16 border-t-[6px] border-l-[6px] border-[rgb(var(--color-primary))]"></div>
                                <div className="absolute top-0 right-0 w-16 h-16 border-t-[6px] border-r-[6px] border-[rgb(var(--color-primary))]"></div>
                                <div className="absolute bottom-0 left-0 w-16 h-16 border-b-[6px] border-l-[6px] border-[rgb(var(--color-primary))]"></div>
                                <div className="absolute bottom-0 right-0 w-16 h-16 border-b-[6px] border-r-[6px] border-[rgb(var(--color-primary))]"></div>
                            </div>
                        </div>
                        <canvas ref={canvasRef} style={{ display: 'none' }} />
                    </div>
                    <div className="p-6 bg-black/80 flex flex-col gap-3">
                        <button 
                            onClick={snapPhoto} 
                            className="w-full py-4 bg-[rgb(var(--color-primary))] text-white rounded-lg font-semibold text-lg hover:bg-opacity-90 transition-opacity"
                        >
                            Capture business card
                        </button>
                        <button 
                            onClick={closeCamera} 
                            className="w-full py-3 text-white bg-slate-700/80 rounded-lg font-semibold hover:bg-slate-800 transition-colors"
                        >
                            Add Manually
                        </button>
                    </div>
                </div>
            )}
            
            {isNewEventModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
                    <div className="bg-[rgb(var(--color-bg-secondary))] rounded-lg shadow-xl p-6 w-full max-w-sm">
                        <h3 className="text-lg font-bold mb-4">Create New Event</h3>
                        <input type="text" value={newEventName} onChange={(e) => setNewEventName(e.target.value)} placeholder="Event name..." className="w-full bg-[rgb(var(--color-bg-tertiary))] p-2 rounded mb-4" autoFocus />
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setIsNewEventModalOpen(false)} className="px-4 py-2 font-semibold bg-[rgb(var(--color-bg-subtle))] rounded">Cancel</button>
                            <button onClick={handleCreateNewEvent} className="px-4 py-2 font-semibold bg-[rgb(var(--color-primary))] text-[rgb(var(--color-primary-text))] rounded">Create & Add</button>
                        </div>
                    </div>
                </div>
            )}
            
            {isNewCompanyModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
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

            {showSuccessMessage && (
                <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in">
                    <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-xl flex items-center gap-3">
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="font-semibold">Contact Saved!</span>
                    </div>
                </div>
            )}

            <div className="p-4 sm:p-6 bg-[rgb(var(--color-bg-secondary))] rounded-lg shadow space-y-6">
                <div>
                    <h2 className="text-2xl font-bold text-[rgb(var(--color-text-primary))]">Add New Contact</h2>
                    <p className="text-[rgb(var(--color-text-subtle))]">{prefillData ? "Review and save the contact information below." : "Fill in details or scan a business card."}</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2">
                    <label htmlFor="card-upload" className="flex-1 w-full text-center px-4 py-2 font-semibold text-[rgb(var(--color-primary-text))] bg-[rgb(var(--color-primary))] rounded-lg shadow hover:bg-[rgb(var(--color-primary-hover))] transition-colors cursor-pointer">
                        Upload Card
                        <input id="card-upload" type="file" accept="image/*" onChange={handleImageChange} className="hidden"/>
                    </label>
                    <button onClick={openCamera} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 font-semibold text-[rgb(var(--color-primary-text))] bg-slate-600 rounded-lg shadow hover:bg-slate-700 transition-colors">
                        <CameraIcon className="h-5 w-5" />
                        Use Camera
                    </button>
                </div>
                
                {imagePreviewUrl && <Image unoptimized src={imagePreviewUrl} alt="Business card preview" width={400} height={250} className="rounded-lg max-w-sm w-full mx-auto shadow-md" />}

                {isProcessing ? <SkeletonLoader /> : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input name="name" value={contact.name} onChange={handleChange} placeholder="Name*" className="w-full bg-[rgb(var(--color-bg-tertiary))] p-2 rounded" />
                            <CustomSelect options={CONTACT_TYPES} value={contact.contactType} onChange={(v) => updateContact(p => ({...p, contactType: v as ContactType}))} />
                            <input name="role" value={contact.role} onChange={handleChange} placeholder="Role / Position" className="w-full bg-[rgb(var(--color-bg-tertiary))] p-2 rounded" />
                            <div>
                                <select 
                                    value={contact.profession || ''} 
                                    onChange={(e) => updateContact(p => ({...p, profession: e.target.value as Profession || undefined}))}
                                    className="w-full bg-[rgb(var(--color-bg-tertiary))] p-2 rounded text-[rgb(var(--color-text-primary))]"
                                >
                                    <option value="">Select Profession (Optional)</option>
                                    {PROFESSIONS.map(profession => (
                                        <option key={profession} value={profession}>{profession}</option>
                                    ))}
                                </select>
                            </div>
                            <input name="email" type="email" value={contact.email} onChange={handleChange} placeholder="Email" className="w-full bg-[rgb(var(--color-bg-tertiary))] p-2 rounded" />
                            <input name="phone" type="tel" value={contact.phone} onChange={handleChange} placeholder="Phone" className="w-full bg-[rgb(var(--color-bg-tertiary))] p-2 rounded" />
                        </div>
                        
                        <div className="space-y-2 p-3 border border-[rgb(var(--color-border))] rounded-md">
                            <h3 className="font-semibold text-[rgb(var(--color-text-secondary))]">Company</h3>
                            <select 
                                value={selectedCompanyId} 
                                onChange={(e) => handleCompanySelect(e.target.value)} 
                                className="w-full bg-[rgb(var(--color-bg-tertiary))] p-2 rounded"
                            >
                                <option value="">-- Select Company (or type below) --</option>
                                {companies.map(company => (
                                    <option key={company.id} value={company.id}>{company.name}</option>
                                ))}
                            </select>
                            <input name="company" value={contact.company} onChange={handleChange} placeholder="Or type company name manually" className="w-full bg-[rgb(var(--color-bg-tertiary))] p-2 rounded" />
                            <button type="button" onClick={() => setIsNewCompanyModalOpen(true)} className="w-full flex items-center justify-center gap-2 px-3 py-2 font-semibold text-[rgb(var(--color-text-secondary))] bg-[rgb(var(--color-bg-subtle))] rounded hover:opacity-80">
                                <PlusIcon className="h-4 w-4"/> Add Company
                            </button>
                        </div>

                        <div className="space-y-2 p-3 border border-[rgb(var(--color-border))] rounded-md">
                            <h3 className="font-semibold text-[rgb(var(--color-text-secondary))]">Websites</h3>
                            {(contact.websites || []).map((website, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <LinkIcon className="h-5 w-5 text-[rgb(var(--color-text-subtle))]" />
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
                                    value={contact.locationState || ''} 
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
                                    value={contact.locationCity || ''} 
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
                                        <input name="address.street" value={contact.address.street} onChange={handleChange} placeholder="Street Number" className="w-full bg-[rgb(var(--color-bg-tertiary))] p-2 rounded" />
                                        <input name="address.city" value={contact.address.city} onChange={handleChange} placeholder="Suite Number" className="w-full bg-[rgb(var(--color-bg-tertiary))] p-2 rounded" />
                                    </div>
                                    <input name="address.postal_code" value={contact.address.postal_code} onChange={handleChange} placeholder="Zip Code" className="w-full bg-[rgb(var(--color-bg-tertiary))] p-2 rounded" />
                                </div>
                            )}
                        </div>

                         <div className="space-y-3 p-3 border border-[rgb(var(--color-border))] rounded-md">
                            <div className="flex justify-between items-center">
                                <h3 className="font-semibold text-[rgb(var(--color-text-secondary))]">Events</h3>
                                <button type="button" onClick={() => setIsNewEventModalOpen(true)} className="px-3 py-1 text-xs font-semibold bg-[rgb(var(--color-bg-tertiary))] text-[rgb(var(--color-text-primary))] rounded hover:opacity-80">New Event</button>
                            </div>
                             {contact.eventLinks.map((link, index) => (
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

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))]">
                                Met at (Location)
                            </label>
                            <input 
                                name="metAt" 
                                value={contact.metAt || ''} 
                                onChange={handleChange} 
                                placeholder="e.g., AWS Summit Las Vegas, Downtown Coffee Shop" 
                                className="w-full bg-[rgb(var(--color-bg-tertiary))] p-2 rounded" 
                            />
                        </div>

                        <textarea name="notes" value={contact.notes} onChange={handleChange} placeholder="Notes..." rows={4} className="w-full bg-[rgb(var(--color-bg-tertiary))] p-2 rounded" />
                        <TagEditor tags={contact.tags} setTags={handleTagsChange} allTags={allTags} />
                        <ReminderSetter 
                            currentDate={contact.follow_up_date} 
                            onDateChange={handleReminderChange}
                            contactName={contact.name}
                        />
                    </>
                )}


                <div className="flex justify-end gap-3 pt-4">
                    <button onClick={handleCancel} className="px-4 py-2 font-semibold bg-[rgb(var(--color-bg-subtle))] text-[rgb(var(--color-text-primary))] rounded-md hover:opacity-80">Cancel</button>
                    <button onClick={handleSave} className="px-4 py-2 font-semibold bg-[rgb(var(--color-primary))] text-[rgb(var(--color-primary-text))] rounded-md hover:bg-[rgb(var(--color-primary-hover))] disabled:opacity-50" disabled={!contact.name || isProcessing}>
                        {isProcessing ? 'Processing...' : 'Save Contact'}
                    </button>
                </div>
            </div>
        </>
    );
};

export default AddContact;