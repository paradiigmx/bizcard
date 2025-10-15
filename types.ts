export type EventRole = 'Attendee' | 'Speaker' | 'Host' | 'Guest' | 'Exhibitor';

export type ContactType = 
  | 'Prospect' | 'Lead' | 'Partner' | 'Referral Partner' | 'Channel/Reseller'
  | 'Vendor/Supplier' | 'Agency' | 'Investor' | 'Advisor/Mentor' | 'Sponsor'
  | 'Media/Press' | 'Influencer/Ambassador' | 'Recruiter/Talent' | 'Candidate'
  | 'Speaker/Panelist' | 'Exhibitor' | 'Customer (Existing)' | 'Former Customer'
  | 'Community/Ally' | 'Gov/Nonprofit' | 'Competitor (FYI)';

export const CONTACT_TYPES: ContactType[] = [
  'Prospect', 'Lead', 'Partner', 'Referral Partner', 'Channel/Reseller',
  'Vendor/Supplier', 'Agency', 'Investor', 'Advisor/Mentor', 'Sponsor',
  'Media/Press', 'Influencer/Ambassador', 'Recruiter/Talent', 'Candidate',
  'Speaker/Panelist', 'Exhibitor', 'Customer (Existing)', 'Former Customer',
  'Community/Ally', 'Gov/Nonprofit', 'Competitor (FYI)'
];


export interface EventLink {
  eventId: string;
  role: EventRole;
}

export interface Contact {
  id: string;
  name: string;
  role: string;
  company: string;
  email: string;
  phone: string;
  websites?: string[];
  address: {
    street: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  notes: string;
  tags: string[];
  image_url?: string;
  follow_up_date?: string;
  eventLinks: EventLink[];
  handle?: string;
  isFavorite: boolean;
  contactType: ContactType;
}

export type AppView = 'CONTACTS' | 'EVENTS' | 'MY_PROFILE' | 'DETAIL' | 'ADD' | 'PUBLIC_PROFILE' | 'EVENT_DETAIL' | 'SETTINGS';

export interface Event {
  id: string;
  name:string;
  date?: string;
  location?: string;
  description?: string;
  url?: string;
}

export type Theme = 'System' | 'Slate' | 'Ocean' | 'Forest' | 'Rose' | 'Sunset';
export type FontSize = 'sm' | 'base' | 'lg';
export type Language = 'en' | 'es' | 'fr';

export interface NotificationPreferences {
    emailNotifications: boolean;
    reminderAlerts: boolean;
    eventUpdates: boolean;
}

export interface AppSettings {
    theme: Theme;
    fontSize: FontSize;
    language: Language;
    defaultContactType?: ContactType;
    notificationPreferences?: NotificationPreferences;
    autoSaveInterval?: number;
}