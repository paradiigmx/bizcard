"use client";

import React from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import ContactDetail from '@/components/ContactDetail';
import { useAppContext } from '@/app/provider';

export default function ContactDetailPage() {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const { contacts, handleUpdateContact, handleDeleteContact, handleToggleFavorite, handleToggleHideContact, allTags, events, handleCreateEvent } = useAppContext();

    const contactId = params.id as string;
    const contact = contacts.find(c => c.id === contactId);
    
    const fromEventId = searchParams.get('eventId');

    const handleBack = () => {
        if (fromEventId) {
            router.push(`/events/${fromEventId}`);
        } else {
            router.push('/');
        }
    };

    const onDelete = (id: string) => {
        handleDeleteContact(id);
        handleBack();
    };

    if (!contact) {
        return <div className="text-center py-10">Loading contact or contact not found...</div>;
    }

    return (
        <ContactDetail
            contact={contact}
            onBack={handleBack}
            onUpdateContact={(updated) => {
                handleUpdateContact(updated);
                // No navigation change on update
            }}
            onDelete={onDelete}
            onToggleFavorite={handleToggleFavorite}
            onToggleHide={handleToggleHideContact}
            allTags={allTags}
            events={events}
            onCreateEvent={handleCreateEvent}
        />
    );
}