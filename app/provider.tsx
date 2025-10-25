"use client";

import React, { createContext, useState, useCallback, useMemo, useEffect, useContext, ReactNode } from 'react';
import type { Contact, Event, AppSettings, Company, ContactList } from '@/types';
import { DUMMY_CONTACTS, DUMMY_EVENTS, MY_PROFILE, INITIAL_CONTACTS, INITIAL_EVENTS, INITIAL_MY_PROFILE, translations } from '@/constants';
import QrCodeModal from '@/components/QrCodeModal';

const LS_KEYS = {
  contacts: 'bc_contacts',
  events: 'bc_events',
  myProfile: 'bc_my_profile',
  settings: 'bc_settings',
  companies: 'bc_companies',
  lists: 'bc_lists',
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
  companies: Company[];
  setCompanies: React.Dispatch<React.SetStateAction<Company[]>>;
  lists: ContactList[];
  setLists: React.Dispatch<React.SetStateAction<ContactList[]>>;
  allTags: string[];
  t: (key: string) => string;
  handleSaveContact: (newContact: Omit<Contact, 'id'>) => Contact;
  handleUpdateContact: (updatedContact: Contact) => void;
  handleToggleFavorite: (contactId: string) => void;
  handleDeleteContact: (id: string) => void;
  handleToggleHideContact: (contactId: string) => void;
  handleCreateEvent: (eventDetails: Omit<Event, 'id'>) => Event;
  handleUpdateEvent: (updatedEvent: Event) => void;
  handleDeleteEvent: (id: string) => void;
  handleToggleHideEvent: (eventId: string) => void;
  handleUpdateMyProfile: (updatedProfile: Contact) => void;
  handleCreateCompany: (companyDetails: Omit<Company, 'id'>) => Company;
  handleUpdateCompany: (updatedCompany: Company) => void;
  handleDeleteCompany: (id: string) => void;
  handleToggleFavoriteCompany: (companyId: string) => void;
  handleToggleHideCompany: (companyId: string) => void;
  findOrCreateCompanyByName: (name: string) => Company;
  getCompanyById: (id: string) => Company | undefined;
  getContactsByCompanyId: (companyId: string) => Contact[];
  handleCreateList: (listDetails: Omit<ContactList, 'id' | 'createdAt' | 'updatedAt'>) => ContactList;
  handleUpdateList: (updatedList: ContactList) => void;
  handleDeleteList: (id: string) => void;
  handleAddContactsToList: (listId: string, contactIds: string[]) => void;
  handleRemoveContactFromList: (listId: string, contactId: string) => void;
  handleBulkAddToFavorites: (contactIds: string[]) => void;
  handleBulkDelete: (contactIds: string[]) => void;
  handleResetData: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'System',
  fontSize: 'base',
  language: 'en',
  defaultContactType: 'Prospect',
  snapAndGo: true,
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
  const [companies, setCompanies] = useState<Company[]>([]);
  const [lists, setLists] = useState<ContactList[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isInitialized, setIsInitialized] = useState(false);
  const [contactToShareBack, setContactToShareBack] = useState<Contact | null>(null);

  useEffect(() => {
    try {
      const dataVersion = localStorage.getItem('bc_data_version');
      const CURRENT_VERSION = '3';
      
      if (dataVersion !== CURRENT_VERSION) {
        console.log('Migrating to new demo data version', CURRENT_VERSION);
        
        let loadedContacts: Contact[] = INITIAL_CONTACTS;
        let loadedCompanies: Company[] = [];
        
        if (dataVersion === '2') {
          const c = localStorage.getItem(LS_KEYS.contacts);
          loadedContacts = c ? JSON.parse(c) : INITIAL_CONTACTS;
          
          const companyMap = new Map<string, Company>();
          
          const paradiigmCompany: Company = {
            id: 'paradiigm_llc',
            name: 'Paradiigm LLC',
            featured: true,
            logo_url: '/paradiigm-logo.jpg',
            email: 'info@pdiigm.com',
            phone: '702-573-4043',
            website: 'paradiigm.net',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          companyMap.set(paradiigmCompany.name.toLowerCase(), paradiigmCompany);
          
          loadedContacts.forEach(contact => {
            if (contact.company && contact.company.trim()) {
              const companyNameLower = contact.company.trim().toLowerCase();
              if (!companyMap.has(companyNameLower)) {
                const newCompany: Company = {
                  id: `company_${Date.now()}_${Math.random()}`,
                  name: contact.company.trim(),
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                };
                companyMap.set(companyNameLower, newCompany);
              }
            }
          });
          
          loadedCompanies = Array.from(companyMap.values());
          
          loadedContacts = loadedContacts.map(contact => {
            if (contact.company && contact.company.trim()) {
              const companyNameLower = contact.company.trim().toLowerCase();
              const company = companyMap.get(companyNameLower);
              if (company) {
                return { ...contact, companyId: company.id };
              }
            }
            return contact;
          });
        } else {
          const paradiigmCompany: Company = {
            id: 'paradiigm_llc',
            name: 'Paradiigm LLC',
            featured: true,
            logo_url: '/paradiigm-logo.jpg',
            email: 'info@pdiigm.com',
            phone: '702-573-4043',
            website: 'paradiigm.net',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          loadedCompanies = [paradiigmCompany];
          
          loadedContacts = INITIAL_CONTACTS.map(contact => {
            if (contact.company && contact.company.trim().toLowerCase() === 'paradiigm llc') {
              return { ...contact, companyId: paradiigmCompany.id };
            }
            return contact;
          });
        }
        
        setContacts(loadedContacts);
        setCompanies(loadedCompanies);
        setEvents(INITIAL_EVENTS);
        setMyProfile(INITIAL_MY_PROFILE);
        localStorage.setItem('bc_data_version', CURRENT_VERSION);
      } else {
        const c = localStorage.getItem(LS_KEYS.contacts);
        const e = localStorage.getItem(LS_KEYS.events);
        const p = localStorage.getItem(LS_KEYS.myProfile);
        const comp = localStorage.getItem(LS_KEYS.companies);
        
        let loadedCompanies: Company[] = comp ? JSON.parse(comp) : [];
        
        if (loadedCompanies.length === 0) {
          const paradiigmCompany: Company = {
            id: 'paradiigm_llc',
            name: 'Paradiigm LLC',
            email: 'info@pdiigm.com',
            phone: '702-573-4043',
            website: 'paradiigm.net',
            featured: true,
            logo_url: '/paradiigm-logo.jpg',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          loadedCompanies = [paradiigmCompany];
        }
        
        setContacts(c ? JSON.parse(c) : INITIAL_CONTACTS);
        setEvents(e ? JSON.parse(e) : INITIAL_EVENTS);
        setMyProfile(p ? JSON.parse(p) : INITIAL_MY_PROFILE);
        setCompanies(loadedCompanies);
        
        const l = localStorage.getItem(LS_KEYS.lists);
        setLists(l ? JSON.parse(l) : []);
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
      setCompanies([]);
      setLists([]);
      setSettings(DEFAULT_SETTINGS);
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => { 
    if (isInitialized) {
      try {
        localStorage.setItem(LS_KEYS.contacts, JSON.stringify(contacts));
      } catch (e) {
        console.error("Failed to save contacts to localStorage:", e);
        alert("Storage is full. Data could not be saved. Please delete old data or clear browser storage.");
      }
    }
  }, [contacts, isInitialized]);
  
  useEffect(() => { 
    if (isInitialized) {
      try {
        localStorage.setItem(LS_KEYS.events, JSON.stringify(events));
      } catch (e) {
        console.error("Failed to save events to localStorage:", e);
        alert("Storage is full. Data could not be saved. Please delete old data or clear browser storage.");
      }
    }
  }, [events, isInitialized]);
  
  useEffect(() => { 
    if (isInitialized) {
      try {
        localStorage.setItem(LS_KEYS.myProfile, JSON.stringify(myProfile));
      } catch (e) {
        console.error("Failed to save profile to localStorage:", e);
        alert("Storage is full. Data could not be saved. Please delete old data or clear browser storage.");
      }
    }
  }, [myProfile, isInitialized]);
  
  useEffect(() => { 
    if (isInitialized) {
      try {
        localStorage.setItem(LS_KEYS.settings, JSON.stringify(settings));
      } catch (e) {
        console.error("Failed to save settings to localStorage:", e);
        alert("Storage is full. Data could not be saved. Please delete old data or clear browser storage.");
      }
    }
  }, [settings, isInitialized]);
  
  useEffect(() => { 
    if (isInitialized) {
      try {
        localStorage.setItem(LS_KEYS.companies, JSON.stringify(companies));
      } catch (e) {
        console.error("Failed to save companies to localStorage:", e);
        alert("Storage is full. Data could not be saved. Please delete old data or clear browser storage.");
      }
    }
  }, [companies, isInitialized]);
  
  useEffect(() => { 
    if (isInitialized) {
      try {
        localStorage.setItem(LS_KEYS.lists, JSON.stringify(lists));
      } catch (e) {
        console.error("Failed to save lists to localStorage:", e);
        alert("Storage is full. Data could not be saved. Please delete old data or clear browser storage.");
      }
    }
  }, [lists, isInitialized]);

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
    let finalContact = { ...newContact };
    
    if (finalContact.company && finalContact.company.trim()) {
      const trimmedName = finalContact.company.trim();
      const nameLower = trimmedName.toLowerCase();
      
      const existingCompany = companies.find(c => c.name.toLowerCase() === nameLower);
      if (existingCompany) {
        finalContact.companyId = existingCompany.id;
      } else {
        const newCompany: Company = {
          id: `company_${Date.now()}_${Math.random()}`,
          name: trimmedName,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setCompanies(prev => [newCompany, ...prev]);
        finalContact.companyId = newCompany.id;
      }
    }
    
    const contactWithId: Contact = { ...finalContact, id: `contact_${Date.now()}_${Math.random()}` };
    setContacts(prev => [contactWithId, ...prev]);
    setContactToShareBack(myProfile);
    return contactWithId;
  }, [myProfile, companies]);

  const handleUpdateContact = useCallback((updatedContact: Contact) => {
    setContacts(prev => prev.map(c => c.id === updatedContact.id ? updatedContact : c));
  }, []);

  const handleToggleFavorite = useCallback((contactId: string) => {
    setContacts(prev => prev.map(c => c.id === contactId ? { ...c, isFavorite: !c.isFavorite } : c));
  }, []);

  const handleDeleteContact = useCallback((id: string) => {
    setContacts(prev => prev.filter(c => c.id !== id));
  }, []);

  const handleToggleHideContact = useCallback((contactId: string) => {
    setContacts(prev => prev.map(c => c.id === contactId ? { ...c, hidden: !c.hidden } : c));
  }, []);

  const handleCreateEvent = useCallback((eventDetails: Omit<Event, 'id'>) => {
    const newEvent: Event = { ...eventDetails, id: `event_${Date.now()}` };
    setEvents(prev => [newEvent, ...prev]);
    return newEvent;
  }, []);

  const handleUpdateEvent = useCallback((updatedEvent: Event) => {
    setEvents(prev => prev.map(e => e.id === updatedEvent.id ? updatedEvent : e));
  }, []);

  const handleDeleteEvent = useCallback((id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
    setContacts(prev => prev.map(c => ({
      ...c,
      eventLinks: c.eventLinks.filter(el => el.eventId !== id)
    })));
  }, []);

  const handleToggleHideEvent = useCallback((eventId: string) => {
    setEvents(prev => prev.map(e => e.id === eventId ? { ...e, hidden: !e.hidden } : e));
  }, []);

  const handleUpdateMyProfile = useCallback((updatedProfile: Contact) => {
    setMyProfile(updatedProfile);
    setContacts(prev => prev.map(c => c.id === updatedProfile.id ? updatedProfile : c));
  }, []);

  const handleCreateCompany = useCallback((companyDetails: Omit<Company, 'id'>) => {
    const newCompany: Company = { 
      ...companyDetails, 
      id: `company_${Date.now()}_${Math.random()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setCompanies(prev => [newCompany, ...prev]);
    return newCompany;
  }, []);

  const handleUpdateCompany = useCallback((updatedCompany: Company) => {
    setCompanies(prev => prev.map(c => c.id === updatedCompany.id ? { ...updatedCompany, updatedAt: new Date().toISOString() } : c));
  }, []);

  const handleDeleteCompany = useCallback((id: string) => {
    setCompanies(prev => prev.filter(c => c.id !== id));
    setContacts(prev => prev.map(c => c.companyId === id ? { ...c, companyId: undefined } : c));
  }, []);

  const handleToggleFavoriteCompany = useCallback((companyId: string) => {
    setCompanies(prev => prev.map(c => c.id === companyId ? { ...c, isFavorite: !c.isFavorite } : c));
  }, []);

  const handleToggleHideCompany = useCallback((companyId: string) => {
    setCompanies(prev => prev.map(c => c.id === companyId ? { ...c, hidden: !c.hidden } : c));
  }, []);

  const findOrCreateCompanyByName = useCallback((name: string) => {
    const trimmedName = name.trim();
    const nameLower = trimmedName.toLowerCase();
    
    const existingCompany = companies.find(c => c.name.toLowerCase() === nameLower);
    if (existingCompany) {
      return existingCompany;
    }
    
    const newCompany: Company = {
      id: `company_${Date.now()}_${Math.random()}`,
      name: trimmedName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setCompanies(prev => [newCompany, ...prev]);
    return newCompany;
  }, [companies]);

  const getCompanyById = useCallback((id: string) => {
    return companies.find(c => c.id === id);
  }, [companies]);

  const getContactsByCompanyId = useCallback((companyId: string) => {
    return contacts.filter(c => c.companyId === companyId);
  }, [contacts]);

  const handleCreateList = useCallback((listDetails: Omit<ContactList, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newList: ContactList = {
      ...listDetails,
      id: `list_${Date.now()}_${Math.random()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setLists(prev => [newList, ...prev]);
    return newList;
  }, []);

  const handleUpdateList = useCallback((updatedList: ContactList) => {
    setLists(prev => prev.map(l => l.id === updatedList.id ? { ...updatedList, updatedAt: new Date().toISOString() } : l));
  }, []);

  const handleDeleteList = useCallback((id: string) => {
    setLists(prev => prev.filter(l => l.id !== id));
  }, []);

  const handleAddContactsToList = useCallback((listId: string, contactIds: string[]) => {
    setLists(prev => prev.map(l => {
      if (l.id === listId) {
        const uniqueContactIds = Array.from(new Set([...l.contactIds, ...contactIds]));
        return { ...l, contactIds: uniqueContactIds, updatedAt: new Date().toISOString() };
      }
      return l;
    }));
  }, []);

  const handleRemoveContactFromList = useCallback((listId: string, contactId: string) => {
    setLists(prev => prev.map(l => {
      if (l.id === listId) {
        return { ...l, contactIds: l.contactIds.filter(id => id !== contactId), updatedAt: new Date().toISOString() };
      }
      return l;
    }));
  }, []);

  const handleBulkAddToFavorites = useCallback((contactIds: string[]) => {
    setContacts(prev => prev.map(c => contactIds.includes(c.id) ? { ...c, isFavorite: true } : c));
  }, []);

  const handleBulkDelete = useCallback((contactIds: string[]) => {
    const nonFeatured = contactIds.filter(id => {
      const contact = contacts.find(c => c.id === id);
      return contact && !contact.featured;
    });
    if (nonFeatured.length > 0) {
      setContacts(prev => prev.filter(c => !nonFeatured.includes(c.id)));
      setLists(prev => prev.map(l => ({
        ...l,
        contactIds: l.contactIds.filter(id => !nonFeatured.includes(id))
      })));
    }
  }, [contacts]);

  const handleResetData = useCallback(() => {
    if (window.confirm("Are you sure you want to reset all app data? This cannot be undone.")) {
      localStorage.removeItem(LS_KEYS.contacts);
      localStorage.removeItem(LS_KEYS.events);
      localStorage.removeItem(LS_KEYS.myProfile);
      localStorage.removeItem(LS_KEYS.companies);
      localStorage.removeItem(LS_KEYS.lists);
      localStorage.setItem('bc_data_version', '3');
      setContacts([...INITIAL_CONTACTS]);
      setEvents([...INITIAL_EVENTS]);
      setMyProfile({ ...INITIAL_MY_PROFILE });
      setCompanies([]);
      setLists([]);
      alert("App data has been reset to default.");
    }
  }, []);

  const value = {
    contacts, setContacts, myProfile, setMyProfile, events, setEvents, settings, setSettings,
    companies, setCompanies, lists, setLists, allTags, t, handleSaveContact, handleUpdateContact, 
    handleToggleFavorite, handleDeleteContact, handleToggleHideContact, handleCreateEvent, handleUpdateEvent, 
    handleDeleteEvent, handleToggleHideEvent, handleUpdateMyProfile, handleCreateCompany, handleUpdateCompany, 
    handleDeleteCompany, handleToggleFavoriteCompany, handleToggleHideCompany, findOrCreateCompanyByName, 
    getCompanyById, getContactsByCompanyId, handleCreateList, handleUpdateList, handleDeleteList,
    handleAddContactsToList, handleRemoveContactFromList, handleBulkAddToFavorites, handleBulkDelete, handleResetData
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