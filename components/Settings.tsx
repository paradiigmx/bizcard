"use client";
import React, { useState, useEffect } from 'react';
import type { AppSettings, Theme, FontSize, Language, ContactType, NotificationPreferences, EventRole, FilterPreferences, ContactList, Event } from '../types';
import { LANGUAGES, LANGUAGE_NAMES } from '../constants';
import { CONTACT_TYPES } from '../types';
import { ChevronDownIcon, DownloadIcon, UploadIcon } from './icons';

interface SettingsProps {
    settings: AppSettings;
    onUpdateSettings: (settings: AppSettings) => void;
    onResetData: () => void;
    t: (key: string) => string;
    lists: ContactList[];
    events: Event[];
    allTags: string[];
}

const THEMES: Theme[] = ['System', 'Slate', 'Ocean', 'Forest', 'Rose', 'Sunset'];
const FONT_SIZES: { value: FontSize; label: string }[] = [
    { value: 'sm', label: 'Small' },
    { value: 'base', label: 'Medium' },
    { value: 'lg', label: 'Large' },
];
const EVENT_ROLES: EventRole[] = ['Attendee', 'Speaker', 'Host', 'Guest', 'Exhibitor'];

const Settings: React.FC<SettingsProps> = ({ settings, onUpdateSettings, onResetData, t, lists, events, allTags }) => {
    const handleThemeChange = (theme: Theme) => {
        onUpdateSettings({ ...settings, theme });
    };

    const handleLanguageChange = (language: Language) => {
        onUpdateSettings({ ...settings, language });
    };

    const handleFontSizeChange = (fontSize: FontSize) => {
        onUpdateSettings({ ...settings, fontSize });
    };
    
    return (
        <div className="space-y-8">
             <h1 className="text-3xl font-bold text-[rgb(var(--color-text-primary))]">{t('settings.title')}</h1>
            <div className="p-4 sm:p-6 bg-[rgb(var(--color-bg-secondary))] rounded-lg shadow">
                <h2 className="text-xl font-bold text-[rgb(var(--color-text-primary))] mb-4 border-b border-[rgb(var(--color-border))] pb-3">{t('settings.appearance')}</h2>
                
                <div className="space-y-4">
                    <div>
                        <label htmlFor="theme-select" className="block font-medium text-[rgb(var(--color-text-secondary))] mb-2">{t('settings.theme')}</label>
                        <div className="relative">
                            <select
                                id="theme-select"
                                value={settings.theme}
                                onChange={(e) => handleThemeChange(e.target.value as Theme)}
                                className="w-full bg-[rgb(var(--color-bg-tertiary))] p-2 pr-10 rounded-md focus:ring-[rgb(var(--color-primary))] focus:border-[rgb(var(--color-primary))] appearance-none"
                            >
                                {THEMES.map(theme => (
                                    <option key={theme} value={theme}>{theme}</option>
                                ))}
                            </select>
                            <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 h-5 w-5 text-[rgb(var(--color-text-subtle))] pointer-events-none" />
                        </div>
                    </div>
                     <div>
                        <label htmlFor="language-select" className="block font-medium text-[rgb(var(--color-text-secondary))] mb-2">{t('settings.language')}</label>
                        <div className="relative">
                            <select
                                id="language-select"
                                value={settings.language}
                                onChange={(e) => handleLanguageChange(e.target.value as Language)}
                                className="w-full bg-[rgb(var(--color-bg-tertiary))] p-2 pr-10 rounded-md focus:ring-[rgb(var(--color-primary))] focus:border-[rgb(var(--color-primary))] appearance-none"
                            >
                                {LANGUAGES.map(lang => (
                                    <option key={lang} value={lang}>{LANGUAGE_NAMES[lang]}</option>
                                ))}
                            </select>
                            <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 h-5 w-5 text-[rgb(var(--color-text-subtle))] pointer-events-none" />
                        </div>
                    </div>

                    <div>
                        <label className="block font-medium text-[rgb(var(--color-text-secondary))] mb-2">{t('settings.fontSize')}</label>
                         <div className="flex gap-2 rounded-lg bg-[rgb(var(--color-bg-tertiary))] p-1">
                            {FONT_SIZES.map(({value, label}) => (
                                <button
                                    key={value}
                                    onClick={() => handleFontSizeChange(value)}
                                    className={`w-full px-3 py-1.5 font-semibold rounded-md transition-colors ${settings.fontSize === value ? 'bg-[rgb(var(--color-bg-secondary))] text-[rgb(var(--color-primary))] shadow' : 'text-[rgb(var(--color-text-secondary))] hover:bg-[rgb(var(--color-bg-subtle))]'}`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-4 sm:p-6 bg-[rgb(var(--color-bg-secondary))] rounded-lg shadow">
                <h2 className="text-xl font-bold text-[rgb(var(--color-text-primary))] mb-4 border-b border-[rgb(var(--color-border))] pb-3">Contact Preferences</h2>
                <div>
                    <label htmlFor="default-contact-type" className="block font-medium text-[rgb(var(--color-text-secondary))] mb-2">Default Contact Type</label>
                    <p className="text-sm text-[rgb(var(--color-text-subtle))] mb-2">New contacts will be assigned this type by default</p>
                    <div className="relative">
                        <select
                            id="default-contact-type"
                            value={settings.defaultContactType || 'Prospect'}
                            onChange={(e) => onUpdateSettings({ ...settings, defaultContactType: e.target.value as ContactType })}
                            className="w-full bg-[rgb(var(--color-bg-tertiary))] p-2 pr-10 rounded-md focus:ring-[rgb(var(--color-primary))] focus:border-[rgb(var(--color-primary))] appearance-none"
                        >
                            {CONTACT_TYPES.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                        <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 h-5 w-5 text-[rgb(var(--color-text-subtle))] pointer-events-none" />
                    </div>
                </div>
            </div>

            <div className="p-4 sm:p-6 bg-[rgb(var(--color-bg-secondary))] rounded-lg shadow">
                <h2 className="text-xl font-bold text-[rgb(var(--color-text-primary))] mb-4 border-b border-[rgb(var(--color-border))] pb-3">Event Preferences</h2>
                <div>
                    <label htmlFor="default-event-role" className="block font-medium text-[rgb(var(--color-text-secondary))] mb-2">Default Event Role</label>
                    <p className="text-sm text-[rgb(var(--color-text-subtle))] mb-2">When linking contacts to events, use this role by default</p>
                    <div className="relative">
                        <select
                            id="default-event-role"
                            value={settings.defaultEventRole || 'Attendee'}
                            onChange={(e) => onUpdateSettings({ ...settings, defaultEventRole: e.target.value })}
                            className="w-full bg-[rgb(var(--color-bg-tertiary))] p-2 pr-10 rounded-md focus:ring-[rgb(var(--color-primary))] focus:border-[rgb(var(--color-primary))] appearance-none"
                        >
                            {EVENT_ROLES.map(role => (
                                <option key={role} value={role}>{role}</option>
                            ))}
                        </select>
                        <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 h-5 w-5 text-[rgb(var(--color-text-subtle))] pointer-events-none" />
                    </div>
                </div>
            </div>

            <div className="p-4 sm:p-6 bg-[rgb(var(--color-bg-secondary))] rounded-lg shadow">
                <h2 className="text-xl font-bold text-[rgb(var(--color-text-primary))] mb-4 border-b border-[rgb(var(--color-border))] pb-3">Camera Preferences</h2>
                <div className="space-y-4">
                    <label className="flex items-center justify-between cursor-pointer">
                        <div>
                            <p className="font-medium text-[rgb(var(--color-text-primary))]">Snap-and-Go Mode</p>
                            <p className="text-sm text-[rgb(var(--color-text-subtle))]">Auto-save contacts after scanning business cards (no review screen)</p>
                        </div>
                        <input
                            type="checkbox"
                            checked={settings.snapAndGo ?? false}
                            onChange={(e) => onUpdateSettings({ ...settings, snapAndGo: e.target.checked })}
                            className="w-5 h-5 rounded accent-[rgb(var(--color-primary))]"
                        />
                    </label>

                    <div>
                        <label htmlFor="default-camera-list" className="block font-medium text-[rgb(var(--color-text-secondary))] mb-2">Default List for Camera Scans</label>
                        <p className="text-sm text-[rgb(var(--color-text-subtle))] mb-2">Automatically add scanned contacts to this list</p>
                        <div className="relative">
                            <select
                                id="default-camera-list"
                                value={settings.filterPreferences?.defaultCameraList || ''}
                                onChange={(e) => onUpdateSettings({ 
                                    ...settings, 
                                    filterPreferences: { 
                                        ...(settings.filterPreferences ?? {}),
                                        defaultCameraList: e.target.value || undefined
                                    }
                                })}
                                className="w-full bg-[rgb(var(--color-bg-tertiary))] p-2 pr-10 rounded-md focus:ring-[rgb(var(--color-primary))] focus:border-[rgb(var(--color-primary))] appearance-none"
                            >
                                <option value="">None</option>
                                {lists.map(list => (
                                    <option key={list.id} value={list.id}>{list.name}</option>
                                ))}
                            </select>
                            <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 h-5 w-5 text-[rgb(var(--color-text-subtle))] pointer-events-none" />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="default-camera-event" className="block font-medium text-[rgb(var(--color-text-secondary))] mb-2">Default Event for Camera Scans</label>
                        <p className="text-sm text-[rgb(var(--color-text-subtle))] mb-2">Automatically link scanned contacts to this event</p>
                        <div className="relative">
                            <select
                                id="default-camera-event"
                                value={settings.filterPreferences?.defaultCameraEvent || ''}
                                onChange={(e) => onUpdateSettings({ 
                                    ...settings, 
                                    filterPreferences: { 
                                        ...(settings.filterPreferences ?? {}),
                                        defaultCameraEvent: e.target.value || undefined
                                    }
                                })}
                                className="w-full bg-[rgb(var(--color-bg-tertiary))] p-2 pr-10 rounded-md focus:ring-[rgb(var(--color-primary))] focus:border-[rgb(var(--color-primary))] appearance-none"
                            >
                                <option value="">None</option>
                                {events.map(event => (
                                    <option key={event.id} value={event.id}>{event.name}</option>
                                ))}
                            </select>
                            <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 h-5 w-5 text-[rgb(var(--color-text-subtle))] pointer-events-none" />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="default-camera-tag" className="block font-medium text-[rgb(var(--color-text-secondary))] mb-2">Default Tag for Camera Scans</label>
                        <p className="text-sm text-[rgb(var(--color-text-subtle))] mb-2">Automatically add this tag to scanned contacts</p>
                        <input
                            id="default-camera-tag"
                            type="text"
                            placeholder="Enter tag name (e.g., 'Conference 2025')"
                            value={settings.filterPreferences?.defaultCameraTag || ''}
                            onChange={(e) => onUpdateSettings({ 
                                ...settings, 
                                filterPreferences: { 
                                    ...(settings.filterPreferences ?? {}),
                                    defaultCameraTag: e.target.value || undefined
                                }
                            })}
                            className="w-full bg-[rgb(var(--color-bg-tertiary))] p-2 rounded-md focus:ring-[rgb(var(--color-primary))] focus:border-[rgb(var(--color-primary))]"
                            list="existing-tags"
                        />
                        <datalist id="existing-tags">
                            {allTags.map(tag => (
                                <option key={tag} value={tag} />
                            ))}
                        </datalist>
                    </div>
                </div>
            </div>

            <div className="p-4 sm:p-6 bg-[rgb(var(--color-bg-secondary))] rounded-lg shadow">
                <h2 className="text-xl font-bold text-[rgb(var(--color-text-primary))] mb-4 border-b border-[rgb(var(--color-border))] pb-3">Contact Filter Preferences</h2>
                <p className="text-sm text-[rgb(var(--color-text-subtle))] mb-4">Set default filters for your contact list view</p>
                <div className="space-y-3">
                    <label className="flex items-center justify-between cursor-pointer">
                        <div>
                            <p className="font-medium text-[rgb(var(--color-text-primary))]">Show Favorites Only</p>
                            <p className="text-sm text-[rgb(var(--color-text-subtle))]">Only display favorite contacts by default</p>
                        </div>
                        <input
                            type="checkbox"
                            checked={settings.filterPreferences?.showFavoritesOnly ?? false}
                            onChange={(e) => onUpdateSettings({ 
                                ...settings, 
                                filterPreferences: { 
                                    ...(settings.filterPreferences ?? {}),
                                    showFavoritesOnly: e.target.checked
                                }
                            })}
                            className="w-5 h-5 rounded accent-[rgb(var(--color-primary))]"
                        />
                    </label>
                    <label className="flex items-center justify-between cursor-pointer">
                        <div>
                            <p className="font-medium text-[rgb(var(--color-text-primary))]">Show Follow-ups Only</p>
                            <p className="text-sm text-[rgb(var(--color-text-subtle))]">Only display contacts with follow-up dates by default</p>
                        </div>
                        <input
                            type="checkbox"
                            checked={settings.filterPreferences?.showFollowUpsOnly ?? false}
                            onChange={(e) => onUpdateSettings({ 
                                ...settings, 
                                filterPreferences: { 
                                    ...(settings.filterPreferences ?? {}),
                                    showFollowUpsOnly: e.target.checked
                                }
                            })}
                            className="w-5 h-5 rounded accent-[rgb(var(--color-primary))]"
                        />
                    </label>
                </div>
            </div>

            <div className="p-4 sm:p-6 bg-[rgb(var(--color-bg-secondary))] rounded-lg shadow">
                <h2 className="text-xl font-bold text-[rgb(var(--color-text-primary))] mb-4 border-b border-[rgb(var(--color-border))] pb-3">Notifications</h2>
                <div className="space-y-3">
                    <label className="flex items-center justify-between cursor-pointer">
                        <div>
                            <p className="font-medium text-[rgb(var(--color-text-primary))]">Email Notifications</p>
                            <p className="text-sm text-[rgb(var(--color-text-subtle))]">Receive email updates about your contacts</p>
                        </div>
                        <input
                            type="checkbox"
                            checked={settings.notificationPreferences?.emailNotifications ?? false}
                            onChange={(e) => onUpdateSettings({ 
                                ...settings, 
                                notificationPreferences: { 
                                    ...settings.notificationPreferences,
                                    emailNotifications: e.target.checked,
                                    reminderAlerts: settings.notificationPreferences?.reminderAlerts ?? false,
                                    eventUpdates: settings.notificationPreferences?.eventUpdates ?? false
                                }
                            })}
                            className="w-5 h-5 rounded accent-[rgb(var(--color-primary))]"
                        />
                    </label>
                    <label className="flex items-center justify-between cursor-pointer">
                        <div>
                            <p className="font-medium text-[rgb(var(--color-text-primary))]">Reminder Alerts</p>
                            <p className="text-sm text-[rgb(var(--color-text-subtle))]">Get notified about upcoming follow-ups</p>
                        </div>
                        <input
                            type="checkbox"
                            checked={settings.notificationPreferences?.reminderAlerts ?? false}
                            onChange={(e) => onUpdateSettings({ 
                                ...settings, 
                                notificationPreferences: { 
                                    ...settings.notificationPreferences,
                                    emailNotifications: settings.notificationPreferences?.emailNotifications ?? false,
                                    reminderAlerts: e.target.checked,
                                    eventUpdates: settings.notificationPreferences?.eventUpdates ?? false
                                }
                            })}
                            className="w-5 h-5 rounded accent-[rgb(var(--color-primary))]"
                        />
                    </label>
                    <label className="flex items-center justify-between cursor-pointer">
                        <div>
                            <p className="font-medium text-[rgb(var(--color-text-primary))]">Event Updates</p>
                            <p className="text-sm text-[rgb(var(--color-text-subtle))]">Receive notifications about event changes</p>
                        </div>
                        <input
                            type="checkbox"
                            checked={settings.notificationPreferences?.eventUpdates ?? false}
                            onChange={(e) => onUpdateSettings({ 
                                ...settings, 
                                notificationPreferences: { 
                                    ...settings.notificationPreferences,
                                    emailNotifications: settings.notificationPreferences?.emailNotifications ?? false,
                                    reminderAlerts: settings.notificationPreferences?.reminderAlerts ?? false,
                                    eventUpdates: e.target.checked
                                }
                            })}
                            className="w-5 h-5 rounded accent-[rgb(var(--color-primary))]"
                        />
                    </label>
                </div>
            </div>

            <div className="p-4 sm:p-6 bg-[rgb(var(--color-bg-secondary))] rounded-lg shadow">
                <h2 className="text-xl font-bold text-[rgb(var(--color-text-primary))] mb-4 border-b border-[rgb(var(--color-border))] pb-3">Auto-Save</h2>
                <div>
                    <label htmlFor="auto-save-interval" className="block font-medium text-[rgb(var(--color-text-secondary))] mb-2">Save Interval (minutes)</label>
                    <p className="text-sm text-[rgb(var(--color-text-subtle))] mb-2">How often to automatically save your data</p>
                    <input
                        id="auto-save-interval"
                        type="number"
                        min="1"
                        max="60"
                        value={settings.autoSaveInterval || 5}
                        onChange={(e) => onUpdateSettings({ ...settings, autoSaveInterval: parseInt(e.target.value) || 5 })}
                        className="w-full bg-[rgb(var(--color-bg-tertiary))] p-2 rounded-md focus:ring-[rgb(var(--color-primary))] focus:border-[rgb(var(--color-primary))]"
                    />
                </div>
            </div>

            <div className="p-4 sm:p-6 bg-[rgb(var(--color-bg-secondary))] rounded-lg shadow">
                 <h2 className="text-xl font-bold text-[rgb(var(--color-text-primary))] mb-4 border-b border-[rgb(var(--color-border))] pb-3">Data Management</h2>
                 <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                        <div>
                            <h3 className="font-semibold text-[rgb(var(--color-text-primary))]">Backup Data</h3>
                            <p className="text-[rgb(var(--color-text-subtle))]">Download all your data as a JSON file</p>
                        </div>
                        <button
                            onClick={() => {
                                const data = {
                                    contacts: JSON.parse(localStorage.getItem('bc_contacts') || '[]'),
                                    events: JSON.parse(localStorage.getItem('bc_events') || '[]'),
                                    profile: JSON.parse(localStorage.getItem('bc_my_profile') || '{}'),
                                    settings: JSON.parse(localStorage.getItem('bc_settings') || '{}')
                                };
                                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `bizcard-backup-${new Date().toISOString().split('T')[0]}.json`;
                                a.click();
                                URL.revokeObjectURL(url);
                            }}
                            className="px-4 py-2 font-semibold text-[rgb(var(--color-primary-text))] bg-[rgb(var(--color-primary))] rounded-lg shadow hover:opacity-90 transition-opacity flex items-center gap-2"
                        >
                            <DownloadIcon className="h-5 w-5" />
                            Backup Data
                        </button>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                        <div>
                            <h3 className="font-semibold text-[rgb(var(--color-text-primary))]">Restore Data</h3>
                            <p className="text-[rgb(var(--color-text-subtle))]">Upload a backup file to restore your data</p>
                        </div>
                        <label className="px-4 py-2 font-semibold text-[rgb(var(--color-primary-text))] bg-[rgb(var(--color-primary))] rounded-lg shadow hover:opacity-90 transition-opacity cursor-pointer flex items-center gap-2">
                            <UploadIcon className="h-5 w-5" />
                            Restore Data
                            <input
                                type="file"
                                accept=".json"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onload = (event) => {
                                            try {
                                                const data = JSON.parse(event.target?.result as string);
                                                if (window.confirm('This will replace all your current data. Continue?')) {
                                                    if (data.contacts) localStorage.setItem('bc_contacts', JSON.stringify(data.contacts));
                                                    if (data.events) localStorage.setItem('bc_events', JSON.stringify(data.events));
                                                    if (data.profile) localStorage.setItem('bc_my_profile', JSON.stringify(data.profile));
                                                    if (data.settings) {
                                                        const defaultSettings: AppSettings = {
                                                            theme: 'System',
                                                            fontSize: 'base',
                                                            language: 'en',
                                                            defaultContactType: 'Prospect',
                                                            notificationPreferences: {
                                                                emailNotifications: false,
                                                                reminderAlerts: true,
                                                                eventUpdates: true
                                                            },
                                                            autoSaveInterval: 5
                                                        };
                                                        const mergedSettings = {
                                                            ...defaultSettings,
                                                            ...data.settings,
                                                            notificationPreferences: {
                                                                ...defaultSettings.notificationPreferences,
                                                                ...(data.settings.notificationPreferences || {})
                                                            }
                                                        };
                                                        localStorage.setItem('bc_settings', JSON.stringify(mergedSettings));
                                                    }
                                                    window.location.reload();
                                                }
                                            } catch (err) {
                                                alert('Invalid backup file');
                                            }
                                        };
                                        reader.readAsText(file);
                                    }
                                    e.target.value = '';
                                }}
                                className="hidden"
                            />
                        </label>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                        <div>
                            <h3 className="font-semibold text-[rgb(var(--color-text-primary))]">Reset App Data</h3>
                            <p className="text-[rgb(var(--color-text-subtle))]">Restore all contacts and events to the original demo state</p>
                        </div>
                        <button
                            onClick={onResetData}
                            className="px-4 py-2 font-semibold text-white bg-[rgb(var(--color-danger))] rounded-lg shadow hover:opacity-90 transition-opacity"
                        >
                            Reset Data
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;