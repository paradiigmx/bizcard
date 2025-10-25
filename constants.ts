import type { Contact, Event, Language } from './types';

export const PARADIIGM_CONTACT: Contact = {
  id: 'paradiigm_contact_id',
  handle: 'kyle-harris',
  name: 'Kyle A. Harris',
  role: 'CEO',
  company: 'Paradiigm LLC',
  companyId: 'paradiigm_llc',
  email: 'info@pdiigm.com',
  phone: '702-573-4043',
  websites: ['https://paradiigm.net'],
  address: { street: '', city: 'Las Vegas', state: 'Nevada', postal_code: '', country: 'United States' },
  notes: 'The founder of Paradiigm, connecting professionals with AI.',
  tags: ['Founder', 'AI', 'Networking', 'CEO'],
  eventLinks: [{ eventId: 'paradiigm_shift_2025', role: 'Speaker' }],
  isFavorite: true,
  contactType: 'Partner',
  image_url: '/kyle-harris-photo.jpeg',
  featured: true,
  ribbonText: 'App Developer',
  locationState: 'United States - Nevada',
  locationCity: 'Las Vegas',
};

export const INITIAL_MY_PROFILE: Contact = {
  id: 'my_profile_id',
  handle: '',
  name: '',
  role: '',
  company: '',
  email: '',
  phone: '',
  websites: [],
  address: { street: '', city: '', state: '', postal_code: '', country: 'United States' },
  notes: '',
  tags: [],
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
        description: 'Step beyond the ordinary. Experience a transformative convergence where artificial intelligence meets human potential. Join us in redefining what\'s possible—not just in technology, but in how we think, connect, and create the future together.',
        url: 'https://www.paradiigm.net/',
        image_url: '/paradiigm-logo.jpg',
        companyId: 'paradiigm_llc'
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

export const US_STATES = [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
    'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
    'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
    'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico',
    'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania',
    'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
    'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
];