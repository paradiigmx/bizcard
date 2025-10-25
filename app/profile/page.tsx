"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MyProfile from '@/components/MyProfile';
import { useAppContext } from '@/app/provider';

export default function ProfilePage() {
    const router = useRouter();
    const { myProfile, handleUpdateMyProfile, allTags, events, handleCreateEvent } = useAppContext();

    useEffect(() => {
        if (!myProfile.name || !myProfile.email) {
            const hasSkipped = localStorage.getItem('bc_onboarding_skipped') === 'true';
            if (!hasSkipped) {
                router.push('/onboarding');
            }
        }
    }, [myProfile, router]);

    if (!myProfile.name || !myProfile.email) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
                <div className="bg-[rgb(var(--color-bg-secondary))] rounded-lg shadow-lg p-8 max-w-md">
                    <h2 className="text-2xl font-bold mb-4">Complete Your Profile</h2>
                    <p className="text-[rgb(var(--color-text-secondary))] mb-6">
                        You haven't set up your profile yet. Create your profile to start sharing your information with others.
                    </p>
                    <button
                        onClick={() => router.push('/onboarding')}
                        className="w-full py-3 bg-[rgb(var(--color-primary))] text-white rounded-lg font-semibold hover:opacity-90"
                    >
                        Create Profile Now
                    </button>
                </div>
            </div>
        );
    }

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