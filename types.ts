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

export type Profession = 
  | 'Accounting' | 'Agriculture' | 'Architecture' | 'Arts & Entertainment' | 'Banking'
  | 'Business Development' | 'Construction' | 'Consulting' | 'Content Creation' | 'Customer Service'
  | 'Cybersecurity' | 'Data Science' | 'Design' | 'Education' | 'Energy'
  | 'Engineering' | 'Entrepreneurship' | 'Executive/C-Suite' | 'Finance' | 'Food & Beverage'
  | 'Government' | 'Healthcare' | 'Hospitality' | 'Human Resources' | 'Insurance'
  | 'Investment' | 'IT/Technology' | 'Legal' | 'Logistics' | 'Manufacturing'
  | 'Marketing' | 'Non-Profit' | 'Operations' | 'Photography' | 'Product Management'
  | 'Psychology' | 'Public Relations' | 'Real Estate' | 'Research' | 'Retail'
  | 'Sales' | 'Science' | 'Software Development' | 'Sports & Fitness' | 'Strategy'
  | 'Telecommunications' | 'Videography' | 'Writing/Journalism';

export const PROFESSIONS: Profession[] = [
  'Accounting', 'Agriculture', 'Architecture', 'Arts & Entertainment', 'Banking',
  'Business Development', 'Construction', 'Consulting', 'Content Creation', 'Customer Service',
  'Cybersecurity', 'Data Science', 'Design', 'Education', 'Energy',
  'Engineering', 'Entrepreneurship', 'Executive/C-Suite', 'Finance', 'Food & Beverage',
  'Government', 'Healthcare', 'Hospitality', 'Human Resources', 'Insurance',
  'Investment', 'IT/Technology', 'Legal', 'Logistics', 'Manufacturing',
  'Marketing', 'Non-Profit', 'Operations', 'Photography', 'Product Management',
  'Psychology', 'Public Relations', 'Real Estate', 'Research', 'Retail',
  'Sales', 'Science', 'Software Development', 'Sports & Fitness', 'Strategy',
  'Telecommunications', 'Videography', 'Writing/Journalism'
];


export interface EventLink {
  eventId: string;
  role: EventRole;
}

export type BusinessCardTemplate = 'Photo' | 'Modern' | 'Classic' | 'Minimal';

export interface Contact {
  id: string;
  name: string;
  role: string;
  company: string;
  companyId?: string;
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
  logo_url?: string;
  follow_up_date?: string;
  eventLinks: EventLink[];
  handle?: string;
  isFavorite: boolean;
  contactType: ContactType;
  profession?: Profession;
  metAt?: string;
  businessCardTemplate?: BusinessCardTemplate;
  businessCardColors?: {
    from: string;
    via: string;
    to: string;
  };
  featured?: boolean;
  ribbonText?: string;
  hidden?: boolean;
  locationState?: string;
  locationCity?: string;
}

export type AppView = 'CONTACTS' | 'EVENTS' | 'COMPANIES' | 'COMPANY_DETAIL' | 'MY_PROFILE' | 'DETAIL' | 'ADD' | 'PUBLIC_PROFILE' | 'EVENT_DETAIL' | 'SETTINGS';

export interface Event {
  id: string;
  name:string;
  date?: string;
  location?: string;
  description?: string;
  url?: string;
  image_url?: string;
  companyId?: string;
  hidden?: boolean;
  locationState?: string;
  locationCity?: string;
}

export interface Company {
  id: string;
  name: string;
  description?: string;
  logo_url?: string;
  website?: string;
  email?: string;
  phone?: string;
  location?: string;
  featured?: boolean;
  isFavorite?: boolean;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
  hidden?: boolean;
  locationState?: string;
  locationCity?: string;
}

export type Theme = 'System' | 'Slate' | 'Ocean' | 'Forest' | 'Rose' | 'Sunset';
export type FontSize = 'sm' | 'base' | 'lg';
export type Language = 'en' | 'es' | 'fr';

export interface NotificationPreferences {
    emailNotifications: boolean;
    reminderAlerts: boolean;
    eventUpdates: boolean;
}

export interface FilterPreferences {
    showFavoritesOnly?: boolean;
    showFollowUpsOnly?: boolean;
    defaultEventFilter?: string;
    defaultListFilter?: string;
    defaultStateFilter?: string;
    defaultCameraList?: string;
    defaultCameraEvent?: string;
    defaultCameraTag?: string;
}

export interface AppSettings {
    theme: Theme;
    fontSize: FontSize;
    language: Language;
    defaultContactType?: ContactType;
    defaultEventRole?: string;
    snapAndGo?: boolean;
    notificationPreferences?: NotificationPreferences;
    filterPreferences?: FilterPreferences;
    autoSaveInterval?: number;
}

export interface ContactList {
    id: string;
    name: string;
    description?: string;
    contactIds: string[];
    createdAt: string;
    updatedAt: string;
    color?: string;
}

export type SubscriptionTier = 'free' | 'pro';

export interface SubscriptionStatus {
    tier: SubscriptionTier;
    isActive: boolean;
    expiresAt?: string;
}

export const SUBSCRIPTION_LIMITS = {
    free: {
        maxContacts: 50,
        allowedTemplates: ['Photo'] as BusinessCardTemplate[],
        canExportLists: false,
        canBulkEmail: false,
        canExportCSV: false,
    },
    pro: {
        maxContacts: Infinity,
        allowedTemplates: ['Photo', 'Modern', 'Classic', 'Minimal'] as BusinessCardTemplate[],
        canExportLists: true,
        canBulkEmail: true,
        canExportCSV: true,
    }
};