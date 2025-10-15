"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import EventList from '@/components/EventList';
import { useAppContext } from '@/app/provider';

export default function EventsPage() {
    const router = useRouter();
    const { events, contacts, handleCreateEvent, t } = useAppContext();

    const handleSelectEvent = (eventId: string) => {
        router.push(`/events/${eventId}`);
    };

    return (
        <EventList
            events={events}
            contacts={contacts}
            onSelectEvent={handleSelectEvent}
            onCreateEvent={handleCreateEvent}
            t={t}
        />
    );
}