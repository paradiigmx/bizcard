import type { Contact, Event, Language } from './types';

export const PARADIIGM_CONTACT: Contact = {
  id: 'paradiigm_contact_id',
  handle: 'kyle-harris',
  name: 'Kyle A. Harris',
  role: 'CEO',
  company: 'Paradiigm',
  email: 'info@pdiigm.com',
  phone: '702-573-4043',
  websites: ['https://paradiigm.net'],
  address: { street: '', city: 'Las Vegas', state: 'Nevada', postal_code: '', country: 'United States' },
  notes: 'The founder of Paradiigm, connecting professionals with AI.',
  tags: ['Founder', 'AI', 'Networking', 'CEO'],
  eventLinks: [{ eventId: 'paradiigm_shift_2025', role: 'Speaker' }],
  isFavorite: true,
  contactType: 'Partner',
  image_url: '/ceo-profile.jpg',
};

export const INITIAL_MY_PROFILE: Contact = {
  id: 'my_profile_id',
  handle: 'alex-doe',
  name: 'Alex Doe',
  role: 'Senior Frontend Engineer',
  company: 'Gemini Solutions',
  email: 'alex.doe@gemini.dev',
  phone: '555-010-2030',
  websites: ['https://gemini.google.com/'],
  address: { street: '1600 Amphitheatre Parkway', city: 'Mountain View', state: 'California', postal_code: '94043', country: 'United States' },
  notes: 'This is my personal profile card. Feel free to connect!',
  tags: ['Developer', 'AI', 'React'],
  eventLinks: [],
  isFavorite: false,
  contactType: 'Community/Ally',
};


export const INITIAL_CONTACTS: Contact[] = [
  PARADIIGM_CONTACT,
  // Add my profile to the list so it can be found by handle for public pages
  INITIAL_MY_PROFILE,
];

export const INITIAL_EVENTS: Event[] = [
    { 
        id: 'paradiigm_shift_2025', 
        name: 'Paradiigm Shift 2025',
        date: '2025-12-15',
        location: 'Las Vegas, NV',
        description: 'The premier AI and innovation summit bringing together industry leaders, entrepreneurs, and visionaries to shape the future of technology.',
        url: 'https://paradiigm.net/events/shift-2025'
    },
];


// These are the mutable exports for the app's state
export const DUMMY_CONTACTS: Contact[] = [...INITIAL_CONTACTS];
export const DUMMY_EVENTS: Event[] = [...INITIAL_EVENTS];
export const MY_PROFILE: Contact = {...INITIAL_MY_PROFILE};


export const translations: Record<Language, Record<string, string>> = {
  en: {
    'nav.profile': 'Profile',
    'nav.contacts': 'Contacts',
    'nav.add_contact': 'Add New Contact',
    'nav.events': 'Events',
    'nav.settings': 'Settings',
    'contacts.title': 'Contacts',
    'events.title': 'Events',
    'settings.title': 'Settings',
    'settings.appearance': 'Appearance Settings',
    'settings.theme': 'Theme',
    'settings.fontSize': 'Font Size',
    'settings.language': 'Language',
    'settings.save': 'Save Settings',
  },
  es: {
    'nav.profile': 'Perfil',
    'nav.contacts': 'Contactos',
    'nav.add_contact': 'Añadir Contacto',
    'nav.events': 'Eventos',
    'nav.settings': 'Ajustes',
    'contacts.title': 'Contactos',
    'events.title': 'Eventos',
    'settings.title': 'Ajustes',
    'settings.appearance': 'Apariencia',
    'settings.theme': 'Tema',
    'settings.fontSize': 'Tamaño de Fuente',
    'settings.language': 'Idioma',
    'settings.save': 'Guardar Cambios',
  },
  fr: {
    'nav.profile': 'Profil',
    'nav.contacts': 'Contacts',
    'nav.add_contact': 'Ajouter un contact',
    'nav.events': 'Événements',
    'nav.settings': 'Paramètres',
    'contacts.title': 'Contacts',
    'events.title': 'Événements',
    'settings.title': 'Paramètres',
    'settings.appearance': 'Apparence',
    'settings.theme': 'Thème',
    'settings.fontSize': 'Taille de la police',
    'settings.language': 'Langue',
    'settings.save': 'Enregistrer',
  },
};

export const LANGUAGES: Language[] = ['en', 'es', 'fr'];
export const LANGUAGE_NAMES: Record<Language, string> = {
    en: 'English',
    es: 'Español',
    fr: 'Français',
};