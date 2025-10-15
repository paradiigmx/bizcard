"use client";

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AddContact from '@/components/AddContact';
import { useAppContext } from '@/app/provider';
import type { Contact } from '@/types';

function AddContactContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { allTags, events, handleCreateEvent, handleSaveContact, contacts } = useAppContext();

    const prefillHandle = searchParams.get('prefill');
    const prefillData = prefillHandle ? contacts.find(c => c.handle === prefillHandle) : null;
    
    // Ensure we don't pass the 'id' field into the prefill data for a new contact
    const prefillRest = prefillData ? (() => {
        const { id, ...rest } = prefillData;
        return rest;
    })() : null;

    const onSave = (newContact: Omit<Contact, 'id'>) => {
        const savedContact = handleSaveContact(newContact);
        if (savedContact.eventLinks.length > 0) {
            const firstEventId = savedContact.eventLinks[0].eventId;
            router.push(`/events/${firstEventId}`);
        } else {
            router.push('/');
        }
    };

    return (
        <AddContact
            onSaveContact={onSave}
            onCancel={() => router.back()}
            allTags={allTags}
            events={events}
            defaultEventId={null} // Can be enhanced later
            onCreateEvent={handleCreateEvent}
            prefillData={prefillRest}
            existingContacts={contacts}
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