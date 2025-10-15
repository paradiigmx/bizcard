"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import ContactList from '@/components/ContactList';
import { useAppContext } from './provider';

export default function ContactsPage() {
    const router = useRouter();
    const { contacts, handleToggleFavorite, events, t } = useAppContext();
    const [filterEventId, setFilterEventId] = useState<string>('__ALL__');

    const handleSelectContact = (id: string) => {
        const query = filterEventId !== '__ALL__' ? `?eventId=${filterEventId}` : '';
        router.push(`/contacts/${id}${query}`);
    };

    return (
        <ContactList 
            contacts={contacts}
            onSelectContact={handleSelectContact}
            onToggleFavorite={handleToggleFavorite}
            events={events}
            filterEventId={filterEventId}
            onSetFilterEventId={setFilterEventId}
            t={t}
        />
    );
}