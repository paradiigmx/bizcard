"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import PublicProfile from '@/components/PublicProfile';
import { useAppContext } from '@/app/provider';
import type { Contact } from '@/types';

export default function PublicProfilePage() {
    const params = useParams();
    const router = useRouter();
    const { contacts, myProfile } = useAppContext();
    const [profileToShow, setProfileToShow] = useState<Contact | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const handle = params.handle as string;
    
    useEffect(() => {
        if (contacts.length > 0 || myProfile.id) { // Ensure context data is available
            const allKnownContacts = [myProfile, ...contacts];
            const contact = allKnownContacts.find(c => c.handle === handle);
            if (contact) {
                setProfileToShow(contact);
            } else {
                // If contact not found after checking, redirect.
                router.replace('/');
            }
            setIsLoading(false);
        }
    }, [handle, contacts, myProfile, router]);


    if (isLoading) {
        return (
            <div className="text-center py-10">
                <p>Loading profile...</p>
            </div>
        );
    }
    
    if (!profileToShow) {
        // This state may be briefly visible before redirect, or if a contact is deleted.
        return (
             <div className="text-center py-10">
                <p>Profile not found.</p>
            </div>
        )
    }

    return <PublicProfile contact={profileToShow} />;
}