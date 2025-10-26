"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import PublicProfile from '@/components/PublicProfile';
import { useAppContext } from '@/app/provider';
import type { Contact } from '@/types';
import { DownloadIcon, CameraIcon } from '@/components/icons';
import Image from 'next/image';

export default function PublicProfilePage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { contacts, myProfile, handleSaveContact } = useAppContext();
    const [profileToShow, setProfileToShow] = useState<Contact | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [hasApp, setHasApp] = useState(false);
    const [contactAdded, setContactAdded] = useState(false);

    const handle = params.handle as string;
    const autoAdd = searchParams.get('add') === 'true';
    
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const hasAppData = localStorage.getItem('bc_contacts') !== null;
            setHasApp(hasAppData);
        }

        if (contacts.length > 0 || myProfile.id) {
            const allKnownContacts = [myProfile, ...contacts];
            const contact = allKnownContacts.find(c => c.handle === handle);
            if (contact) {
                setProfileToShow(contact);
                
                if (hasApp && autoAdd && contact.id !== myProfile.id) {
                    const existingContact = contacts.find(c => c.id === contact.id || c.email === contact.email);
                    if (!existingContact) {
                        const newContact = {
                            ...contact,
                            id: undefined as any,
                            isFavorite: false,
                            notes: `Added from QR code scan`,
                        };
                        delete newContact.id;
                        handleSaveContact(newContact);
                        setContactAdded(true);
                    } else {
                        setContactAdded(true);
                    }
                }
            } else {
                router.replace('/');
            }
            setIsLoading(false);
        }
    }, [handle, contacts, myProfile, router, hasApp, autoAdd, handleSaveContact]);

    const handleDownloadVCF = () => {
        if (!profileToShow) return;
        
        const { name, role, company, email, phone, address, websites } = profileToShow;
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

        const blob = new Blob([vcf], { type: 'text/vcard;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${name.replace(/\s/g, '_')}.vcf`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleDownloadApp = () => {
        if (profileToShow) {
            localStorage.setItem('bc_pending_contact', JSON.stringify(profileToShow));
        }
        window.location.href = '/onboarding';
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[rgb(var(--color-bg-primary))] flex items-center justify-center">
                <p>Loading profile...</p>
            </div>
        );
    }
    
    if (!profileToShow) {
        return (
             <div className="min-h-screen bg-[rgb(var(--color-bg-primary))] flex items-center justify-center">
                <p>Profile not found.</p>
            </div>
        )
    }

    if (!hasApp) {
        return (
            <div className="min-h-screen bg-[rgb(var(--color-bg-primary))] p-4">
                <div className="max-w-2xl mx-auto pt-16">
                    <div className="text-center mb-8">
                        <Image src="/bizcard-icon.png" alt="BizCard+" width={80} height={80} className="mx-auto mb-4" />
                        <h1 className="text-3xl font-bold mb-2">You've received a BizCard+</h1>
                        <p className="text-[rgb(var(--color-text-secondary))]">
                            {profileToShow.name} wants to connect with you
                        </p>
                    </div>

                    <div className="bg-[rgb(var(--color-bg-secondary))] rounded-lg shadow-xl p-8 mb-6">
                        <div className="text-center mb-6">
                            {profileToShow.image_url && (
                                <Image
                                    src={profileToShow.image_url}
                                    alt={profileToShow.name}
                                    width={120}
                                    height={120}
                                    className="rounded-full mx-auto mb-4"
                                />
                            )}
                            <h2 className="text-2xl font-bold">{profileToShow.name}</h2>
                            <p className="text-lg text-[rgb(var(--color-text-secondary))] mt-1">{profileToShow.role}</p>
                            {profileToShow.company && (
                                <p className="text-[rgb(var(--color-text-tertiary))] mt-1">{profileToShow.company}</p>
                            )}
                        </div>

                        <div className="space-y-3 mb-6">
                            {profileToShow.email && (
                                <div className="flex items-center gap-3 p-3 bg-[rgb(var(--color-bg-tertiary))] rounded-lg">
                                    <span className="text-sm text-[rgb(var(--color-text-secondary))]">Email:</span>
                                    <span className="font-medium">{profileToShow.email}</span>
                                </div>
                            )}
                            {profileToShow.phone && (
                                <div className="flex items-center gap-3 p-3 bg-[rgb(var(--color-bg-tertiary))] rounded-lg">
                                    <span className="text-sm text-[rgb(var(--color-text-secondary))]">Phone:</span>
                                    <span className="font-medium">{profileToShow.phone}</span>
                                </div>
                            )}
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={handleDownloadApp}
                                className="w-full py-4 bg-[rgb(var(--color-primary))] text-white rounded-lg font-semibold flex items-center justify-center gap-2"
                            >
                                <CameraIcon className="h-5 w-5" />
                                Get BizCard+ App & Save Contact
                            </button>
                            <button
                                onClick={handleDownloadVCF}
                                className="w-full py-4 bg-[rgb(var(--color-bg-tertiary))] rounded-lg font-semibold flex items-center justify-center gap-2"
                            >
                                <DownloadIcon className="h-5 w-5" />
                                Download Contact Card
                            </button>
                        </div>

                        <p className="text-xs text-center text-[rgb(var(--color-text-tertiary))] mt-6">
                            BizCard+ makes networking seamless. Scan business cards, manage contacts, and never lose a connection.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (contactAdded && autoAdd) {
        return (
            <div className="min-h-screen bg-[rgb(var(--color-bg-primary))] flex items-center justify-center p-4">
                <div className="bg-[rgb(var(--color-bg-secondary))] rounded-lg shadow-xl p-8 max-w-md text-center">
                    <div className="mb-6">
                        <svg className="w-16 h-16 mx-auto text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Contact Added!</h2>
                    <p className="text-[rgb(var(--color-text-secondary))] mb-6">
                        {profileToShow.name} has been added to your contacts
                    </p>
                    <button
                        onClick={() => router.push('/')}
                        className="w-full py-3 bg-[rgb(var(--color-primary))] text-white rounded-lg font-semibold"
                    >
                        View Contacts
                    </button>
                </div>
            </div>
        );
    }

    return <PublicProfile contact={profileToShow} />;
}
