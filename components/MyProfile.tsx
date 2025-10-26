"use client";
import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode.react';
import { GoogleGenAI, Type } from "@google/genai";
import type { Contact, Event, EventRole, EventLink } from '../types';
import { ArrowLeftIcon, SaveIcon, EditIcon, QrCodeIcon, PlusIcon, TrashIcon, LinkIcon, CameraIcon, IdentificationIcon, ShareIcon, DownloadIcon, XIcon } from './icons';
import TagEditor from './TagEditor';
import QrCodeModal from './QrCodeModal';
import BusinessCardCreator from './BusinessCardCreator';
import { locationData, countries } from '../locationData';
import { compressImage } from '../utils';
import { useAppContext } from '../app/provider';

interface MyProfileProps {
    profile: Contact;
    onUpdateProfile: (profile: Contact) => void;
    allTags: string[];
    events: Event[];
    onCreateEvent: (eventDetails: Omit<Event, 'id'>) => Event;
}

const EVENT_ROLES: EventRole[] = ['Attendee', 'Speaker', 'Host', 'Guest', 'Exhibitor'];

const MyProfile: React.FC<MyProfileProps> = ({ profile, onUpdateProfile, allTags, events, onCreateEvent }) => {
    const { settings } = useAppContext();
    const [isEditing, setIsEditing] = useState(false);
    const [editedProfile, setEditedProfile] = useState<Contact>(profile);
    const [isQrModalOpen, setIsQrModalOpen] = useState(false);
    const [isNewEventModalOpen, setIsNewEventModalOpen] = useState(false);
    const [newEventName, setNewEventName] = useState('');
    const [isBusinessCardOpen, setIsBusinessCardOpen] = useState(false);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [isBusinessCardCameraOpen, setIsBusinessCardCameraOpen] = useState(false);
    const [isProcessingCard, setIsProcessingCard] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const businessCardVideoRef = useRef<HTMLVideoElement>(null);
    const businessCardCanvasRef = useRef<HTMLCanvasElement>(null);

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
        const defaultEventRole = (settings.defaultEventRole || 'Attendee') as EventRole;
        setEditedProfile(prev => ({
            ...prev,
            eventLinks: [...prev.eventLinks, { eventId: events[0]?.id || '', role: defaultEventRole }]
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
            const defaultEventRole = (settings.defaultEventRole || 'Attendee') as EventRole;
            const newEvent = onCreateEvent({ name: newEventName.trim() });
            setEditedProfile(prev => ({
                ...prev, 
                eventLinks: [...prev.eventLinks, { eventId: newEvent.id, role: defaultEventRole}]
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

    const openCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
            setIsCameraOpen(true);
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Error accessing camera: ", err);
            const error = err as Error;
            if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
                alert('Camera permission denied. Please allow camera access in your browser settings and try again.');
            } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
                alert('No camera found on this device. Please use a device with a camera.');
            } else {
                alert("Could not access camera. Please ensure permissions are granted.");
            }
        }
    };

    const closeCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }
        setIsCameraOpen(false);
    };

    const capturePhoto = async () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            context?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
            
            canvas.toBlob(async (blob) => {
                if (blob) {
                    const file = new File([blob], "profile-photo.jpg", { type: "image/jpeg" });
                    try {
                        const compressedImage = await compressImage(file, 200, 200, 0.8);
                        setEditedProfile(prev => ({ ...prev, image_url: compressedImage }));
                        closeCamera();
                    } catch (error) {
                        console.error('Failed to compress image:', error);
                        alert('Failed to process image. Please try again.');
                    }
                }
            }, 'image/jpeg');
        }
    };

    const openBusinessCardCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            setIsBusinessCardCameraOpen(true);
            if (businessCardVideoRef.current) {
                businessCardVideoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Error accessing camera: ", err);
            const error = err as Error;
            if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
                alert('Camera permission denied. Please allow camera access in your browser settings and try again.');
            } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
                alert('No camera found on this device. Please use a device with a camera.');
            } else {
                alert("Could not access camera. Please ensure permissions are granted.");
            }
        }
    };

    const closeBusinessCardCamera = () => {
        if (businessCardVideoRef.current && businessCardVideoRef.current.srcObject) {
            const stream = businessCardVideoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }
        setIsBusinessCardCameraOpen(false);
    };

    const snapBusinessCard = () => {
        if (businessCardVideoRef.current && businessCardCanvasRef.current) {
            const video = businessCardVideoRef.current;
            const canvas = businessCardCanvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            if (context) {
                context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
                const imageData = canvas.toDataURL('image/jpeg', 0.95);
                closeBusinessCardCamera();
                processBusinessCard(imageData);
            }
        }
    };

    const processBusinessCard = async (imageData: string) => {
        const apiKey = process.env.NEXT_PUBLIC_API_KEY;
        if (!apiKey) {
            alert("AI API key is not configured. Please set it up in your environment.");
            return;
        }

        setIsProcessingCard(true);
        try {
            const ai = new GoogleGenAI({ apiKey });
            const base64Data = imageData.split(',')[1];
            const imagePart = { inlineData: { data: base64Data, mimeType: "image/jpeg" } };
            
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: [
                    {
                        role: "user",
                        parts: [
                            { text: "Extract the contact information from this business card. Provide the person's full name, job title/role, company name, email address, and phone number. If any field is not clearly visible or missing, return an empty string for that field." },
                            imagePart
                        ]
                    }
                ],
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING },
                            role: { type: Type.STRING },
                            company: { type: Type.STRING },
                            email: { type: Type.STRING },
                            phone: { type: Type.STRING },
                        }
                    }
                }
            });

            const responseText = response.text || '{}';
            const parsedData = JSON.parse(responseText);
            
            if (!parsedData.name && !parsedData.email) {
                throw new Error('Could not extract contact information from the image.');
            }

            // Auto-fill the profile fields
            setEditedProfile(prev => ({
                ...prev,
                name: parsedData.name || prev.name,
                role: parsedData.role || prev.role,
                company: parsedData.company || prev.company,
                email: parsedData.email || prev.email,
                phone: parsedData.phone || prev.phone,
            }));

            // Auto-enable edit mode if not already editing
            if (!isEditing) {
                setIsEditing(true);
            }
        } catch (error) {
            console.error("Error processing business card:", error);
            alert("Failed to process business card. Please try again.");
        } finally {
            setIsProcessingCard(false);
        }
    };

    useEffect(() => {
        // Cleanup cameras on unmount
        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
            if (businessCardVideoRef.current && businessCardVideoRef.current.srcObject) {
                const stream = businessCardVideoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

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
    
    const downloadQRCode = () => {
        const canvas = document.querySelector('#qr-code-canvas canvas') as HTMLCanvasElement;
        if (canvas) {
            const url = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = url;
            link.download = `${profile.name}-QR-Code.png`;
            link.click();
        }
    };

    const shareQRCode = async () => {
        const canvas = document.querySelector('#qr-code-canvas canvas') as HTMLCanvasElement;
        if (canvas) {
            canvas.toBlob(async (blob) => {
                if (blob) {
                    const file = new File([blob], `${profile.name}-QR-Code.png`, { type: 'image/png' });
                    if (navigator.share && navigator.canShare({ files: [file] })) {
                        try {
                            await navigator.share({
                                title: `${profile.name} - QR Code`,
                                files: [file],
                            });
                        } catch (error) {
                            if ((error as Error).name !== 'AbortError') {
                                console.error('Error sharing:', error);
                            }
                        }
                    } else {
                        alert('Sharing is not supported on your browser. Please use the download option instead.');
                    }
                }
            });
        }
    };

    const downloadBusinessCard = async () => {
        const cardElement = document.querySelector('#business-card-preview');
        if (cardElement) {
            try {
                const html2canvas = (await import('html2canvas')).default;
                const canvas = await html2canvas(cardElement as HTMLElement, {
                    scale: 2,
                    backgroundColor: '#ffffff',
                    logging: false,
                } as any);
                
                const link = document.createElement('a');
                link.download = `${profile.name.replace(/\s+/g, '-')}-business-card.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
            } catch (error) {
                console.error('Failed to download card:', error);
                alert('Failed to download business card. Please try again.');
            }
        }
    };

    const shareBusinessCard = async () => {
        const cardElement = document.querySelector('#business-card-preview');
        if (cardElement) {
            try {
                const html2canvas = (await import('html2canvas')).default;
                const canvas = await html2canvas(cardElement as HTMLElement, {
                    scale: 2,
                    backgroundColor: '#ffffff',
                    logging: false,
                } as any);
                
                canvas.toBlob(async (blob: Blob | null) => {
                    if (!blob) {
                        alert('Failed to generate business card image. Please try again.');
                        return;
                    }
                    
                    const file = new File([blob], `${profile.name}-business-card.png`, { type: 'image/png' });
                    
                    if (navigator.share && navigator.canShare({ files: [file] })) {
                        try {
                            await navigator.share({
                                title: `${profile.name} - Business Card`,
                                text: `Business card for ${profile.name}`,
                                files: [file],
                            });
                        } catch (error) {
                            if ((error as Error).name !== 'AbortError') {
                                console.error('Error sharing:', error);
                            }
                        }
                    } else {
                        alert('Sharing is not supported on your browser. Please use the download option instead.');
                    }
                });
            } catch (error) {
                console.error('Failed to share card:', error);
                alert('Failed to share business card. Please try again or use the download option.');
            }
        }
    };
    
    return (
        <>
             {isCameraOpen && (
                <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center p-4">
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover"></video>
                    <canvas ref={canvasRef} className="hidden"></canvas>
                    <div className="absolute top-4 right-4 flex flex-col gap-3">
                        <button onClick={closeCamera} className="text-white bg-black bg-opacity-50 rounded-full p-2">
                            <XIcon className="h-8 w-8" />
                        </button>
                    </div>
                    <div className="absolute bottom-6 flex flex-col items-center gap-4 w-full px-4">
                        <button onClick={capturePhoto} className="border-4 border-white rounded-full w-20 h-20 bg-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary-hover))]"></button>
                        <button onClick={closeCamera} className="w-full max-w-xs text-center px-4 py-3 font-semibold text-white bg-slate-700 bg-opacity-80 rounded-lg shadow hover:bg-slate-800 transition-colors">
                            Cancel
                        </button>
                    </div>
                </div>
             )}
             {isBusinessCardCameraOpen && (
                <div className="fixed inset-0 bg-black z-50 flex flex-col">
                    <div className="flex justify-between items-center p-4 bg-black/80">
                        <h3 className="text-white font-semibold">Scan Your Business Card</h3>
                        <button onClick={closeBusinessCardCamera} className="text-white">
                            <XIcon className="h-6 w-6" />
                        </button>
                    </div>
                    <div className="flex-1 relative">
                        <video
                            ref={businessCardVideoRef}
                            autoPlay
                            playsInline
                            className="w-full h-full object-cover"
                        />
                        <canvas ref={businessCardCanvasRef} className="hidden" />
                    </div>
                    <div className="p-6 bg-black/80">
                        <button
                            onClick={snapBusinessCard}
                            className="w-full py-4 bg-[rgb(var(--color-primary))] text-white rounded-lg font-semibold"
                        >
                            Capture Photo
                        </button>
                    </div>
                </div>
             )}
             {isProcessingCard && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                    <div className="bg-[rgb(var(--color-bg-secondary))] rounded-lg p-8 text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[rgb(var(--color-primary))]"></div>
                        <p className="mt-4 text-[rgb(var(--color-text-secondary))]">Processing your business card...</p>
                    </div>
                </div>
             )}
             {isQrModalOpen && (
                <QrCodeModal contact={profile} onClose={() => setIsQrModalOpen(false)} />
             )}
             {isBusinessCardOpen && (
                <BusinessCardCreator 
                    profile={profile} 
                    onUpdateProfile={onUpdateProfile}
                    onClose={() => setIsBusinessCardOpen(false)} 
                />
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
                        <button 
                            onClick={() => setIsBusinessCardOpen(true)} 
                            className="flex items-center gap-2 px-4 py-2 bg-[rgb(var(--color-primary))] text-[rgb(var(--color-primary-text))] rounded-lg font-semibold hover:opacity-90 transition-opacity" 
                            aria-label="Create Business Card"
                        >
                            <IdentificationIcon className="h-5 w-5" />
                            Create Card
                        </button>
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
                        <button
                            onClick={openBusinessCardCamera}
                            className="w-full mb-4 py-4 bg-[rgb(var(--color-primary))] text-white rounded-lg font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                        >
                            <CameraIcon className="h-5 w-5" />
                            Scan Business Card
                        </button>
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
                            <div className="flex gap-2 mt-4">
                                <button
                                    type="button"
                                    onClick={openCamera}
                                    className="flex items-center gap-2 px-4 py-2 bg-[rgb(var(--color-primary))] text-[rgb(var(--color-primary-text))] rounded-lg font-semibold hover:opacity-90 transition-opacity"
                                >
                                    <CameraIcon className="h-5 w-5" />
                                    Take Photo
                                </button>
                                <label className="flex items-center gap-2 px-4 py-2 bg-[rgb(var(--color-bg-subtle))] text-[rgb(var(--color-text-primary))] rounded-lg font-semibold cursor-pointer hover:opacity-90 transition-opacity">
                                    {editedProfile.image_url ? 'Upload New' : 'Upload Photo'}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleProfilePictureUpload}
                                        className="hidden"
                                    />
                                </label>
                            </div>
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
                            <div className="p-6 bg-[rgb(var(--color-bg-tertiary))] rounded-lg">
                                <div className="flex justify-between items-center mb-3">
                                    <p className="text-sm font-semibold text-[rgb(var(--color-text-secondary))]">My QR Code</p>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={shareQRCode} 
                                            className="p-2 text-[rgb(var(--color-text-secondary))] bg-[rgb(var(--color-bg-subtle))] rounded-lg shadow-sm hover:opacity-80 transition-opacity"
                                            aria-label="Share QR Code"
                                        >
                                            <ShareIcon className="h-4 w-4" />
                                        </button>
                                        <button 
                                            onClick={downloadQRCode} 
                                            className="p-2 text-[rgb(var(--color-text-secondary))] bg-[rgb(var(--color-bg-subtle))] rounded-lg shadow-sm hover:opacity-80 transition-opacity"
                                            aria-label="Download QR Code"
                                        >
                                            <DownloadIcon className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex justify-center">
                                    <div className="inline-block p-3 bg-white rounded-lg" id="qr-code-canvas">
                                        <QRCode value={`${typeof window !== 'undefined' ? window.location.origin : ''}/u/${profile.handle}`} size={180} level="H" includeMargin={true} />
                                    </div>
                                </div>
                                <p className="text-xs text-[rgb(var(--color-text-subtle))] mt-3 text-center">Share this code to connect</p>
                            </div>
                        )}

                        <div className="p-6 bg-[rgb(var(--color-bg-tertiary))] rounded-lg">
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <p className="text-sm font-semibold text-[rgb(var(--color-text-secondary))]">My Digital Business Card</p>
                                    <p className="text-xs text-[rgb(var(--color-text-subtle))] mt-1">
                                        {profile.businessCardTemplate || 'Photo'} Template
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={shareBusinessCard} 
                                        className="p-2 text-[rgb(var(--color-text-secondary))] bg-[rgb(var(--color-bg-subtle))] rounded-lg shadow-sm hover:opacity-80 transition-opacity"
                                        aria-label="Share Business Card"
                                    >
                                        <ShareIcon className="h-4 w-4" />
                                    </button>
                                    <button 
                                        onClick={downloadBusinessCard} 
                                        className="p-2 text-[rgb(var(--color-text-secondary))] bg-[rgb(var(--color-bg-subtle))] rounded-lg shadow-sm hover:opacity-80 transition-opacity"
                                        aria-label="Download Business Card"
                                    >
                                        <DownloadIcon className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                            <div className="flex justify-center overflow-x-auto">
                                <div className="transform scale-75 origin-center" id="business-card-preview">
                                    {(!profile.businessCardTemplate || profile.businessCardTemplate === 'Photo') && (
                                        <div 
                                            className="w-[600px] h-[350px] p-8 rounded-2xl shadow-2xl text-white flex gap-6"
                                            style={{
                                                background: profile.businessCardColors 
                                                    ? `linear-gradient(to bottom right, ${profile.businessCardColors.from}, ${profile.businessCardColors.via}, ${profile.businessCardColors.to})`
                                                    : 'linear-gradient(to bottom right, #2563eb, #9333ea, #ec4899)'
                                            }}
                                        >
                                            {profile.image_url && (
                                                <div className="flex-shrink-0 flex items-center">
                                                    <img src={profile.image_url} alt={profile.name} className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg" />
                                                </div>
                                            )}
                                            <div className="flex-1 flex flex-col justify-between">
                                                <div>
                                                    {profile.logo_url && (
                                                        <img src={profile.logo_url} alt="Logo" className="h-12 mb-4 object-contain" style={{ filter: 'brightness(0) invert(1)' }} />
                                                    )}
                                                    <h1 className="text-3xl font-bold mb-1">{profile.name}</h1>
                                                    <p className="text-lg opacity-90">{profile.role}</p>
                                                    <p className="text-md opacity-80">{profile.company}</p>
                                                </div>
                                                <div className="flex justify-between items-end">
                                                    <div className="space-y-1 text-sm">
                                                        <p>{profile.email}</p>
                                                        <p>{profile.phone}</p>
                                                        {profile.websites && profile.websites[0] && <p>{profile.websites[0]}</p>}
                                                    </div>
                                                    {profile.handle && (
                                                        <div className="bg-white p-2 rounded">
                                                            <QRCode value={`${typeof window !== 'undefined' ? window.location.origin : ''}/u/${profile.handle}`} size={60} level="H" />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {profile.businessCardTemplate === 'Modern' && (
                                        <div 
                                            className="w-[600px] h-[350px] p-8 rounded-2xl shadow-2xl text-white flex flex-col justify-between"
                                            style={{
                                                background: profile.businessCardColors 
                                                    ? `linear-gradient(to bottom right, ${profile.businessCardColors.from}, ${profile.businessCardColors.via}, ${profile.businessCardColors.to})`
                                                    : 'linear-gradient(to bottom right, #2563eb, #9333ea, #ec4899)'
                                            }}
                                        >
                                            <div className="flex items-start">
                                                <div className="flex-1">
                                                    {profile.logo_url && (
                                                        <img src={profile.logo_url} alt="Logo" className="h-12 mb-4 object-contain" style={{ filter: 'brightness(0) invert(1)' }} />
                                                    )}
                                                    <h1 className="text-3xl font-bold mb-1">{profile.name}</h1>
                                                    <p className="text-lg opacity-90">{profile.role}</p>
                                                    <p className="text-md opacity-80">{profile.company}</p>
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-end">
                                                <div className="space-y-1 text-sm">
                                                    <p>{profile.email}</p>
                                                    <p>{profile.phone}</p>
                                                    {profile.websites && profile.websites[0] && <p>{profile.websites[0]}</p>}
                                                </div>
                                                {profile.handle && (
                                                    <div className="bg-white p-2 rounded">
                                                        <QRCode value={`${typeof window !== 'undefined' ? window.location.origin : ''}/u/${profile.handle}`} size={60} level="H" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    {profile.businessCardTemplate === 'Classic' && (
                                        <div className="w-[600px] h-[350px] bg-white border-4 border-gray-800 p-8 shadow-2xl flex flex-col justify-between">
                                            <div className="flex items-start border-b-2 border-gray-800 pb-4">
                                                <div className="flex-1">
                                                    {profile.logo_url && (
                                                        <img src={profile.logo_url} alt="Logo" className="h-14 mb-3 object-contain" />
                                                    )}
                                                    <h1 className="text-4xl font-serif font-bold text-gray-900 mb-1">{profile.name}</h1>
                                                    <p className="text-lg text-gray-700 font-semibold">{profile.role}</p>
                                                    <p className="text-md text-gray-600">{profile.company}</p>
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-end">
                                                <div className="space-y-1 text-sm text-gray-700">
                                                    <p className="font-semibold">Email: <span className="font-normal">{profile.email}</span></p>
                                                    <p className="font-semibold">Phone: <span className="font-normal">{profile.phone}</span></p>
                                                    {profile.websites && profile.websites[0] && <p className="font-semibold">Web: <span className="font-normal">{profile.websites[0]}</span></p>}
                                                </div>
                                                {profile.handle && (
                                                    <div className="border-2 border-gray-800 p-2 bg-gray-50">
                                                        <QRCode value={`${typeof window !== 'undefined' ? window.location.origin : ''}/u/${profile.handle}`} size={60} level="H" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    {profile.businessCardTemplate === 'Minimal' && (
                                        <div className="w-[600px] h-[350px] bg-gray-50 p-8 shadow-2xl flex flex-col justify-center items-center text-center">
                                            <div className="space-y-6">
                                                {profile.logo_url && (
                                                    <img src={profile.logo_url} alt="Logo" className="h-10 mx-auto object-contain" />
                                                )}
                                                <div>
                                                    <h1 className="text-4xl font-light text-gray-900 mb-2">{profile.name}</h1>
                                                    <p className="text-lg text-gray-600">{profile.role}</p>
                                                    <p className="text-md text-gray-500">{profile.company}</p>
                                                </div>
                                                <div className="space-y-1 text-sm text-gray-600">
                                                    <p>{profile.email}</p>
                                                    <p>{profile.phone}</p>
                                                    {profile.websites && profile.websites[0] && <p>{profile.websites[0]}</p>}
                                                </div>
                                                {profile.handle && (
                                                    <div className="inline-block bg-white p-2 border border-gray-300 rounded">
                                                        <QRCode value={`${typeof window !== 'undefined' ? window.location.origin : ''}/u/${profile.handle}`} size={60} level="H" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <p className="text-xs text-center text-[rgb(var(--color-text-subtle))] mt-4">
                                Click &quot;Create Card&quot; to customize and download
                            </p>
                        </div>
                        
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