# BizCard+ AI Scanner

## Overview

BizCard+ is an intelligent business card scanner application that uses AI to extract, parse, and save contact information. Built with Next.js and React, it provides a comprehensive contact management system with event tracking, QR code generation, and profile sharing capabilities. The application leverages Google's Gemini AI for intelligent data extraction from business cards and event URLs.

## Recent Changes

**October 15, 2025 (Session 6 - Part 3)**
- Fixed event links on contact cards - now clickable and navigate to event detail pages
- Event names on contact cards were previously non-clickable spans, now proper links
- Added stopPropagation to prevent contact card click when clicking event link

**October 15, 2025 (Session 6 - Part 2)**
- Implemented version-based data migration system to ensure demo data persists
- Added bc_data_version localStorage key to track and migrate demo data changes
- Updated Next.js config for Vercel compatibility (removed standalone output, strict TypeScript/ESLint)
- Demo data now automatically resets when version changes (current version: 2)
- All users will see only Kyle A. Harris contact and Paradiigm Shift 2025 event on next load
- Build successfully passes all TypeScript checks and linting
- Vercel deployment ready with proper framework auto-detection

**October 15, 2025 (Session 6 - Part 1)**
- Fixed Vercel build TypeScript errors (response.text undefined checks, navigator.share checks, useSearchParams suspense boundary)
- Removed all demo contacts except Kyle A. Harris (CEO at Paradiigm)
- Removed old demo events (Tech Conference 2023, Design Meetup)
- Created new demo event "Paradiigm Shift 2025" (Dec 15, 2025 in Las Vegas) with Kyle as Speaker
- Made demo event non-editable (edit button hidden) but still deletable
- Fixed all JSON.parse() calls to handle potentially undefined response.text
- Fixed Web Share API checks using 'in' operator instead of truthy check
- Wrapped useSearchParams in Suspense boundary for Next.js static generation

**October 15, 2025 (Session 5)**
- Fixed footer positioning issue: moved from fixed position (hidden by Nav z-index) to content area above Nav
- Configured deployment settings for autoscale production publishing
- Logo files updated to Paradiigm branding (bizcard-logo.png and paradiigm-logo.png now identical)
- Created deployment documentation (README.md, DEPLOYMENT.md, QUICKSTART.md, .env.example, vercel.json)
- Cleaned up unused Vite/React files (index.html, index.tsx, App.tsx, vite.config.ts, sw.js)
- Updated .gitignore for Next.js deployment
- Added npm run export script to create deployment-ready ZIP file
- Removed unused Vite dependencies from package.json

**October 15, 2025 (Session 4)**
- Updated share button to use Web Share API for email/text/social sharing (vs file download)
- Updated CEO contact (Kyle A. Harris) with custom profile photo, CEO tag, info@pdiigm.com, paradiigm.net
- Replaced app logo with custom Paradiigm branding
- Added footer with "Powered by Paradiigm", contact info (info@pdiigm.com, 702-573-4043, paradiigm.net), and "Est 2025"
- Made "App Developer" badge fit on one line with smaller font (10px) and whitespace-nowrap
- Enhanced profile images with object-center for better circular display coverage

**October 15, 2025 (Session 3)**
- Reverted App Developer badge to diagonal corner ribbon style with centered text
- Redesigned contact cards: profile image on left, contact info on right, phone/email at bottom
- Implemented theme-based default profile images (6 avatars in /public/default-avatars/)
- Added default contact type setting (defaults to 'Prospect')
- Added notification preferences (email notifications, reminder alerts, event updates)
- Added auto-save interval setting (1-60 minutes, defaults to 5)
- Implemented backup/restore functionality with deep merge for settings
- Fixed Next.js LCP warning by adding priority property to logo image
- Enhanced settings persistence with proper defaults for nested objects

**October 15, 2025 (Session 2)**
- Centered "App Developer" badge (changed from diagonal ribbon to centered badge)
- Doubled BizCard logo size in header for better visibility
- Added inline QR code display to My Profile page (no modal needed to view)
- Implemented profile picture upload with automatic image compression (200x200px, 80% quality JPEG)
- Profile pictures now display in My Profile view and edit modes
- Made theme, language, and font size settings apply immediately (removed Save/Cancel buttons)
- Settings changes now take effect instantly for better UX

**October 15, 2025 (Session 1)**
- Added custom BizCard logo to app header and PWA manifest
- Updated demo contacts to show only Kyle A. Harris (removed Alice Johnson, Bob Smith, Charlie Brown)
- Fixed Next.js themeColor metadata warning by moving to viewport export
- Refreshed share icon with modern curved arrow design
- Updated info/note icon to filled circle with 'i' for better clarity
- Styled App Developer badge as diagonal ribbon in top-right corner of contact cards
- Added QR code button to contact detail view for easy profile sharing
- Added "Add Contact" button to contacts header for quick access
- Enhanced dropdown affordance by adding chevron indicators to all select elements

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Routing**
- Next.js 14 with App Router architecture for file-based routing
- React 18 with TypeScript for type-safe component development
- Client-side rendering with "use client" directives for interactive components
- Custom context provider (AppProvider) for global state management

**State Management**
- React Context API for application-wide state (contacts, events, settings, profile)
- localStorage persistence for data durability across sessions
- useCallback and useMemo hooks for performance optimization
- Controlled component patterns for form handling

**UI/UX Design**
- Tailwind CSS with custom CSS variables for theming
- Dark mode support with multiple theme options (Slate, Ocean, Forest, Rose, Sunset)
- Responsive design with mobile-first approach
- Custom component library with reusable UI elements (icons, modals, selectors)
- Progressive Web App (PWA) capabilities with offline support

**Data Flow**
- Centralized state in AppProvider with CRUD operations for contacts and events
- Local storage hydration on mount with fallback to dummy data
- Prop drilling minimized through context consumption
- URL-based navigation with query parameters for context preservation

### AI Integration

**Google Gemini AI**
- Business card scanning: Image-to-structured-data extraction using vision capabilities
- Event URL parsing: Webpage content analysis to extract event metadata
- JSON-structured responses with schema validation using Type.OBJECT
- Environment-based API key configuration (NEXT_PUBLIC_API_KEY)

**AI Features**
- Automatic contact field extraction (name, role, company, email, phone, address)
- Intelligent event data parsing from URLs (name, date, location, description)
- Duplicate contact detection and merge suggestions

### Data Models

**Core Entities**
- Contact: Comprehensive profile with personal/business info, tags, event associations, and follow-up reminders
- Event: Event metadata with date, location, description, and URL
- EventLink: Many-to-many relationship between contacts and events with role attribution
- AppSettings: User preferences for theme, font size, and language

**Contact Types**
- 21 predefined business relationship categories (Prospect, Lead, Partner, Investor, etc.)
- Flexible tagging system for custom categorization
- Favorite marking for quick access

**Address System**
- Structured address fields (street, city, state, postal_code, country)
- Location data with country-specific state/province listings
- Support for US, Canada, UK, and Australia regions

### Feature Components

**Contact Management**
- List view with filtering by event, search, tags, contact types, and favorites
- Detail view with inline editing and QR code generation
- Add contact form with AI-assisted scanning and duplicate detection
- VCF export for individual contacts
- CSV bulk export functionality

**Event Management**
- Event list with contact count and date display
- Event detail with contact filtering by role and contact type
- AI-powered event creation from URLs
- Event-contact association with role assignment

**Profile & Sharing**
- Personal profile management (My Profile)
- Public profile pages with vanity URLs (/u/[handle])
- QR code generation for profile sharing
- VCF download for easy contact import
- Web Share API integration for native sharing

**Reminders & Follow-ups**
- Relative reminders (days/weeks/months from now)
- Specific date/time reminders
- ICS calendar file generation
- Visual reminder status indicators (overdue, today, upcoming)

### PWA & Offline Support

**Progressive Web App**
- Manifest configuration for installability
- Service worker for offline functionality (via @ducanh2912/next-pwa)
- Cache-first strategy for static assets
- Theme color and icon configuration

**Offline Capabilities**
- LocalStorage-based data persistence
- Cached UI assets for offline browsing
- Graceful degradation when AI features unavailable

### Internationalization

**Multi-language Support**
- Translation system with language-specific dictionaries
- Support for English, Spanish, French, German, Japanese, and Chinese
- Dynamic language switching with persistence
- Translation function (t) accessible via context

### Styling System

**Theme Architecture**
- CSS custom properties for dynamic theming
- Light and dark mode variants for each theme
- Semantic color tokens (primary, secondary, tertiary, subtle, danger, success, warning)
- Font size scaling (small, medium, large)
- System preference detection for default theme

## External Dependencies

**AI & ML Services**
- Google Gemini API (@google/genai) for AI-powered data extraction
- Requires NEXT_PUBLIC_API_KEY environment variable
- Supports vision models for image analysis and text models for URL parsing

**UI Libraries**
- qrcode.react for QR code generation
- Tailwind CSS for utility-first styling
- Custom icon library with SVG components

**Build Tools**
- Next.js 14 for React framework and SSR capabilities
- TypeScript for type safety
- Vite as alternative bundler (configured but using Next.js primarily)
- ESLint for code quality

**PWA Tools**
- @ducanh2912/next-pwa for service worker generation
- Web App Manifest for PWA metadata

**Development Dependencies**
- PostCSS with Autoprefixer for CSS processing
- TypeScript compiler and type definitions
- Next.js-specific ESLint configuration

**Browser APIs**
- localStorage for data persistence
- Clipboard API for link copying
- Web Share API for native sharing
- File download APIs for VCF/CSV/ICS exports
- Camera API (requested via metadata.json) for business card scanning

**Data Storage**
- Client-side only (no database)
- localStorage keys: bc_contacts, bc_events, bc_my_profile, bc_settings
- JSON serialization for complex objects