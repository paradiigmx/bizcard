"use client";

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AddContact from '@/components/AddContact';
import { useAppContext } from '@/app/provider';
import type { Contact } from '@/types';

function AddContactContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { allTags, events, handleCreateEvent, handleSaveContact, contacts, companies } = useAppContext();

    const prefillHandle = searchParams.get('prefill');
    const prefillData = prefillHandle ? contacts.find(c => c.handle === prefillHandle) : null;
    
    // Get eventId, companyId, and camera from query params
    const defaultEventId = searchParams.get('eventId');
    const defaultCompanyId = searchParams.get('companyId');
    const autoOpenCamera = searchParams.get('camera') === 'true';
    
    // Ensure we don't pass the 'id' field into the prefill data for a new contact
    const prefillRest = prefillData ? (() => {
        const { id, ...rest } = prefillData;
        return rest;
    })() : null;

    const onSave = (newContact: Omit<Contact, 'id'>): Contact => {
        const savedContact = handleSaveContact(newContact);
        if (defaultEventId && savedContact.eventLinks.length > 0) {
            router.push(`/events/${defaultEventId}`);
        } else if (defaultCompanyId && savedContact.companyId) {
            router.push(`/companies/${defaultCompanyId}`);
        } else if (savedContact.eventLinks.length > 0) {
            const firstEventId = savedContact.eventLinks[0].eventId;
            router.push(`/events/${firstEventId}`);
        } else {
            router.push('/');
        }
        return savedContact;
    };

    return (
        <AddContact
            onSaveContact={onSave}
            onCancel={() => router.back()}
            allTags={allTags}
            events={events}
            defaultEventId={defaultEventId}
            defaultCompanyId={defaultCompanyId}
            onCreateEvent={handleCreateEvent}
            prefillData={prefillRest}
            existingContacts={contacts}
            autoOpenCamera={autoOpenCamera}
        />
    );
}

export default function AddContactPage() {
    return (
        <Suspense fallback={<div className="text-center py-10">Loading...</div>}>
            <AddContactContent />
        </Suspense>
    );
}