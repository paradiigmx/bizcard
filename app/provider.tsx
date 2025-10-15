"use client";

import React, { createContext, useState, useCallback, useMemo, useEffect, useContext, ReactNode } from 'react';
import type { Contact, Event, AppSettings } from '@/types';
import { DUMMY_CONTACTS, DUMMY_EVENTS, MY_PROFILE, INITIAL_CONTACTS, INITIAL_EVENTS, INITIAL_MY_PROFILE, translations } from '@/constants';
import QrCodeModal from '@/components/QrCodeModal';

const LS_KEYS = {
  contacts: 'bc_contacts',
  events: 'bc_events',
  myProfile: 'bc_my_profile',
  settings: 'bc_settings',
};

interface AppContextType {
  contacts: Contact[];
  setContacts: React.Dispatch<React.SetStateAction<Contact[]>>;
  myProfile: Contact;
  setMyProfile: React.Dispatch<React.SetStateAction<Contact>>;
  events: Event[];
  setEvents: React.Dispatch<React.SetStateAction<Event[]>>;
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  allTags: string[];
  t: (key: string) => string;
  handleSaveContact: (newContact: Omit<Contact, 'id'>) => Contact;
  handleUpdateContact: (updatedContact: Contact) => void;
  handleToggleFavorite: (contactId: string) => void;
  handleDeleteContact: (id: string) => void;
  handleCreateEvent: (eventDetails: Omit<Event, 'id'>) => Event;
  handleUpdateEvent: (updatedEvent: Event) => void;
  handleUpdateMyProfile: (updatedProfile: Contact) => void;
  handleResetData: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

const DEFAULT_SETTINGS: AppSettings = {
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

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [myProfile, setMyProfile] = useState<Contact>(MY_PROFILE);
  const [events, setEvents] = useState<Event[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isInitialized, setIsInitialized] = useState(false);
  const [contactToShareBack, setContactToShareBack] = useState<Contact | null>(null);

  useEffect(() => {
    try {
      // Check if we need to reset to new demo data (version-based migration)
      const dataVersion = localStorage.getItem('bc_data_version');
      const CURRENT_VERSION = '2'; // Increment when demo data changes
      
      if (dataVersion !== CURRENT_VERSION) {
        // Reset to new demo data
        console.log('Migrating to new demo data version', CURRENT_VERSION);
        setContacts(INITIAL_CONTACTS);
        setEvents(INITIAL_EVENTS);
        setMyProfile(INITIAL_MY_PROFILE);
        localStorage.setItem('bc_data_version', CURRENT_VERSION);
      } else {
        // Load from localStorage
        const c = localStorage.getItem(LS_KEYS.contacts);
        const e = localStorage.getItem(LS_KEYS.events);
        const p = localStorage.getItem(LS_KEYS.myProfile);
        setContacts(c ? JSON.parse(c) : INITIAL_CONTACTS);
        setEvents(e ? JSON.parse(e) : INITIAL_EVENTS);
        setMyProfile(p ? JSON.parse(p) : INITIAL_MY_PROFILE);
      }
      
      const s = localStorage.getItem(LS_KEYS.settings);
      if (s) {
        const loadedSettings = JSON.parse(s);
        setSettings({
          ...DEFAULT_SETTINGS,
          ...loadedSettings,
          notificationPreferences: {
            ...DEFAULT_SETTINGS.notificationPreferences,
            ...(loadedSettings.notificationPreferences || {})
          }
        });
      } else {
        setSettings(DEFAULT_SETTINGS);
      }
    } catch (e) {
      console.error("Failed to hydrate state from localStorage", e);
      setContacts(INITIAL_CONTACTS);
      setEvents(INITIAL_EVENTS);
      setMyProfile(INITIAL_MY_PROFILE);
      setSettings(DEFAULT_SETTINGS);
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => { if (isInitialized) localStorage.setItem(LS_KEYS.contacts, JSON.stringify(contacts)); }, [contacts, isInitialized]);
  useEffect(() => { if (isInitialized) localStorage.setItem(LS_KEYS.events, JSON.stringify(events)); }, [events, isInitialized]);
  useEffect(() => { if (isInitialized) localStorage.setItem(LS_KEYS.myProfile, JSON.stringify(myProfile)); }, [myProfile, isInitialized]);
  useEffect(() => { if (isInitialized) localStorage.setItem(LS_KEYS.settings, JSON.stringify(settings)); }, [settings, isInitialized]);

  const t = useCallback((key: string): string => {
    return translations[settings.language]?.[key] || key;
  }, [settings.language]);

  useEffect(() => {
    const root = window.document.documentElement;
    const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (settings.theme === 'System') {
      root.classList.toggle('dark', isSystemDark);
      root.setAttribute('data-theme', 'slate');
    } else {
      root.classList.remove('dark');
      // Set the theme, but also handle dark mode for non-slate themes if needed
      const themeName = settings.theme.toLowerCase();
      root.setAttribute('data-theme', themeName);
      if (['ocean', 'forest', 'rose', 'sunset'].includes(themeName)) {
         root.classList.toggle('dark', isSystemDark);
      }
    }

    const body = window.document.body;
    body.classList.remove('text-sm', 'text-base', 'text-lg');
    body.classList.add(`text-${settings.fontSize}`);
  }, [settings]);

  const allTags = useMemo(() => Array.from(new Set(contacts.flatMap(c => c.tags))), [contacts]);

  const handleSaveContact = useCallback((newContact: Omit<Contact, 'id'>) => {
    const contactWithId: Contact = { ...newContact, id: `contact_${Date.now()}_${Math.random()}` };
    setContacts(prev => [contactWithId, ...prev]);
    setContactToShareBack(myProfile);
    return contactWithId;
  }, [myProfile]);

  const handleUpdateContact = useCallback((updatedContact: Contact) => {
    setContacts(prev => prev.map(c => c.id === updatedContact.id ? updatedContact : c));
  }, []);

  const handleToggleFavorite = useCallback((contactId: string) => {
    setContacts(prev => prev.map(c => c.id === contactId ? { ...c, isFavorite: !c.isFavorite } : c));
  }, []);

  const handleDeleteContact = useCallback((id: string) => {
    setContacts(prev => prev.filter(c => c.id !== id));
  }, []);

  const handleCreateEvent = useCallback((eventDetails: Omit<Event, 'id'>) => {
    const newEvent: Event = { ...eventDetails, id: `event_${Date.now()}` };
    setEvents(prev => [newEvent, ...prev]);
    return newEvent;
  }, []);

  const handleUpdateEvent = useCallback((updatedEvent: Event) => {
    setEvents(prev => prev.map(e => e.id === updatedEvent.id ? updatedEvent : e));
  }, []);

  const handleUpdateMyProfile = useCallback((updatedProfile: Contact) => {
    setMyProfile(updatedProfile);
    setContacts(prev => prev.map(c => c.id === updatedProfile.id ? updatedProfile : c));
  }, []);

  const handleResetData = useCallback(() => {
    if (window.confirm("Are you sure you want to reset all app data? This cannot be undone.")) {
      localStorage.removeItem(LS_KEYS.contacts);
      localStorage.removeItem(LS_KEYS.events);
      localStorage.removeItem(LS_KEYS.myProfile);
      localStorage.setItem('bc_data_version', '2'); // Set to current version
      setContacts([...INITIAL_CONTACTS]);
      setEvents([...INITIAL_EVENTS]);
      setMyProfile({ ...INITIAL_MY_PROFILE });
      alert("App data has been reset to default.");
    }
  }, []);

  const value = {
    contacts, setContacts, myProfile, setMyProfile, events, setEvents, settings, setSettings,
    allTags, t, handleSaveContact, handleUpdateContact, handleToggleFavorite,
    handleDeleteContact, handleCreateEvent, handleUpdateEvent, handleUpdateMyProfile, handleResetData
  };

  return (
    <AppContext.Provider value={value}>
      {contactToShareBack && (
        <QrCodeModal
          contact={contactToShareBack}
          onClose={() => setContactToShareBack(null)}
          title="Share Your Profile Back"
          subtitle="Let your new connection scan your code."
        />
      )}
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};