"use client";

import React from 'react';
import Settings from '@/components/Settings';
import { useAppContext } from '@/app/provider';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
    const { settings, setSettings, handleResetData, t } = useAppContext();
    const router = useRouter();

    const onReset = () => {
        handleResetData();
        router.push('/');
    };

    return (
        <Settings
            settings={settings}
            onUpdateSettings={setSettings}
            onResetData={onReset}
            t={t}
        />
    );
}