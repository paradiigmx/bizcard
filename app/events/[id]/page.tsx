"use client";

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import EventDetail from '@/components/EventDetail';
import { useAppContext } from '@/app/provider';

export default function EventDetailPage() {
    const router = useRouter();
    const params = useParams();
    const { events, contacts, handleUpdateEvent } = useAppContext();

    const eventId = params.id as string;
    const event = events.find(e => e.id === eventId);
    
    if (!event) {
        return <div className="text-center py-10">Loading event or event not found...</div>;
    }
    
    const eventContacts = contacts.filter(c => c.eventLinks.some(l => l.eventId === event.id));

    const handleSelectContact = (contactId: string) => {
        router.push(`/contacts/${contactId}?eventId=${eventId}`);
    };

    const handleNavigateToAddContact = (eventId: string) => {
        // Pass eventId to pre-associate the new contact with this event
        router.push(`/contacts/add?eventId=${eventId}`);
    };

    return (
        <EventDetail
            event={event}
            contacts={eventContacts}
            onBack={() => router.push('/events')}
            onUpdateEvent={handleUpdateEvent}
            onSelectContact={handleSelectContact}
            onNavigateToAddContact={handleNavigateToAddContact}
        />
    );
}