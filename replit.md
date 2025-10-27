# BizCard+ AI Scanner

## Overview

BizCard+ is an intelligent business card scanner application built with Next.js and React. It leverages AI to extract, parse, and save contact information from business cards, providing a comprehensive contact management system. Key capabilities include event tracking, QR code generation, profile sharing, and digital business card creation. The project aims to offer a streamlined solution for managing professional connections and event engagement, utilizing Google's Gemini AI for advanced data extraction from business cards and event URLs.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

**October 27, 2025**
- **Paywall & Monetization**: Implemented comprehensive freemium subscription model with Free and Pro tiers using RevenueCat infrastructure
  - **Free Tier**: 50 contact limit, basic business card template only, can download individual contacts, create lists (but no export/email)
  - **Pro Tier**: Unlimited contacts, all business card templates, CSV export, bulk email functionality
  - Created PaywallModal component with pricing display and upgrade flow
  - Integrated subscription state management in AppProvider with localStorage persistence
  - Added contact limit enforcement in AddContact (manual save and Snap-and-Go camera)
  - Gated premium business card templates (Modern, Classic, Minimal) with Pro badges in BusinessCardCreator
  - Gated export CSV and bulk email features in ContactList
  - Added Subscription Management section to Settings showing current plan, usage stats, and upgrade button
  - Added Privacy Policy section to Settings covering data storage, AI processing, and third-party services

**October 26, 2025**
- **State Filter Preference**: Added default state filter to Settings page (Contact Filter Preferences) with US_STATES dropdown - automatically filters contacts by selected state on load
- **Delete Profile Feature**: Added "Delete Profile" button in Settings with confirmation modal - allows users to permanently delete their profile information
- **Mobile Optimization**: Fixed responsive layout for contact list buttons - buttons now hide text labels on mobile and show only icons, preventing overflow
- **Apple Wallet & Google Wallet Support**: Added ability to save contacts to Apple Wallet and Google Wallet via VCF download buttons on profile pages and public share pages
- **Camera Scanner**: Fixed business card scanner with Google Gemini API integration, now fully functional
- **Vercel Deployment Fix**: Removed incorrect rewrite rules from vercel.json that were breaking navigation between pages
- Verified featured contacts (Paradiigm LLC) cannot be deleted - only hidden (hide button replaces delete button)
- Verified company hide functionality exists in CompanyList and CompanyDetail pages
- Verified event hide functionality exists in EventList and EventDetail pages
- Enhanced camera frame for business card capture: Increased frame size from 700px to 850px max-width for better visibility
- Updated camera frame styling: Removed white border, kept only blue corner guides (6px thick, 16px size) for cleaner interface
- Improved camera UX: Removed instructional text overlay, changed button text from "Capture Photo" to "Capture business card"
- Updated BizCard+ branding: Replaced old logo with new horizontal logo in header (bizcard-logo-new.png)
- Added BizCard+ icon logo to onboarding page and profile share page (bizcard-icon.png)
- Implemented white backgrounds (bg-white p-2) with object-contain for all user-uploaded company logos across all pages
- Fixed company logo display consistency: Company logos now show with white backgrounds in CompanyList, CompanyDetail, and Event detail pages
- Maintained clean appearance for app logos (BizCard+, Paradiigm) without backgrounds

**October 25, 2025**
- Added comprehensive contact filter preferences system with support for Lists, Events, Tags, States, Contact Types, Professions, and Event Roles
- Implemented FilterPreferences interface in AppSettings for default filter settings
- Added "Contact Filter Preferences" section in Settings page for user-configurable default filters (show favorites only, show follow-ups only)
- Enhanced ContactList component with List filter using multi-select tag interface
- Implemented live synchronization of filter preferences from Settings to ContactList via useEffect hook
- Added camera scanning default preferences (defaultCameraList, defaultCameraEvent, defaultCameraTag) to automatically assign new contacts to lists, events, and tags when scanned via business card camera
- Updated Camera Preferences section with dropdowns for default list and event, plus text input with autocomplete for default tag
- Enhanced Snap-and-Go functionality to apply all configured defaults during camera scanning
- Cleaned project for GitHub/Vercel deployment: removed duplicate manifest, metadata.json, auto-generated PWA files, and temporary build artifacts
- Final project size: 92 source files, ready for production deployment

## System Architecture

### Frontend Architecture

- **Framework & Routing**: Next.js 14 with App Router, React 18, and TypeScript, utilizing client-side rendering.
- **State Management**: React Context API for global state (contacts, events, settings, profile) with `localStorage` persistence.
- **UI/UX Design**: Responsive, mobile-first design using Tailwind CSS with custom CSS variables for theming, supporting dark mode and multiple themes (Slate, Ocean, Forest, Rose, Sunset). Features a reusable component library.

### AI Integration

- **Google Gemini AI**: Used for business card scanning (image-to-structured-data extraction) and event URL parsing (webpage content analysis), providing JSON-structured responses with schema validation.
- **AI Features**: Automatic extraction of contact fields (name, role, company, email, phone, address) and intelligent event data parsing, including duplicate contact detection.

### Data Models

- **Core Entities**: `Contact`, `Event`, `EventLink`, `Company`, `List`, `AppSettings`, `FilterPreferences`, and `NotificationPreferences`.
- **Contact Types**: 21 predefined business relationship categories and a flexible tagging system.
- **Professions**: 48 alphabetically sorted profession options.
- **Address System**: Structured fields with country-specific state/province listings.
- **Filter System**: Comprehensive filtering with support for events, lists, tags, states, contact types, professions, event roles, favorites, and follow-ups.

### Feature Components

- **Onboarding Flow**: First-launch experience with AI-powered business card scanning to prefill profile information, including skip options and redirection logic.
- **Contact Management**: List view with search, comprehensive multi-select filters (Event, Event Role, Contact Type, Profession, Tags, Lists, States, Favorites, Follow-ups), bulk operations (Create List, Export CSV, Add Favorite, Create Tag, Delete), email functionality, and "Snap-and-Go" camera feature for auto-saving. Detail view with inline editing, QR code generation, AI-assisted add contact form, VCF export, and CSV bulk export. Supports default filter preferences via Settings.
- **Event Management**: List view with search, filters, hide toggle, and email functionality for attendees. Detail view with inline editing, contact filtering, AI-powered event creation from URLs, and event-contact association.
- **Company Management**: CRUD operations with search, filters, hide toggle, email functionality for company contacts, automatic creation, and logo upload.
- **List Management**: Create, view, and manage custom contact lists with email functionality, CSV export, and Web Share API integration.
- **Analytics Dashboard**: Metrics for contacts, events, companies, reminders, location, and contact type distribution.
- **Profile & Sharing**: Personal profile management with AI-powered business card scanner for auto-filling profile data, public profile pages with vanity URLs, app detection (auto-add for app users), QR code generation, VCF download, camera photo capture, and Web Share API integration.
- **Reminders & Follow-ups**: Relative and specific date/time reminders, ICS calendar file generation.
- **Digital Business Card Creator**: Allows users to create professional digital business cards with templates, custom logos, and color schemes.

### PWA & Offline Support

- **Progressive Web App**: Manifest configuration and service worker for offline functionality with a cache-first strategy.
- **Offline Capabilities**: `LocalStorage`-based data persistence and cached UI assets.

### Internationalization

- **Multi-language Support**: Translation system for English, Spanish, French, German, Japanese, and Chinese, with dynamic language switching.

### Styling System

- **Theme Architecture**: CSS custom properties for dynamic theming, light/dark mode variants, semantic color tokens, and font size scaling.

## External Dependencies

- **AI & ML Services**: Google Gemini API (`@google/genai`).
- **UI Libraries**: `qrcode.react`, Tailwind CSS.
- **Build Tools**: Next.js 14, TypeScript, ESLint.
- **PWA Tools**: `@ducanh2912/next-pwa`.
- **Browser APIs**: `localStorage`, Clipboard API, Web Share API, File download APIs, Camera API.