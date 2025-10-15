"use client";

import React from 'react';
import MyProfile from '@/components/MyProfile';
import { useAppContext } from '@/app/provider';

export default function ProfilePage() {
    const { myProfile, handleUpdateMyProfile, allTags, events, handleCreateEvent } = useAppContext();

    return (
        <MyProfile
            profile={myProfile}
            onUpdateProfile={handleUpdateMyProfile}
            allTags={allTags}
            events={events}
            onCreateEvent={handleCreateEvent}
        />
    );
}