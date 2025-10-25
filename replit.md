# BizCard+ AI Scanner

## Overview

BizCard+ is an intelligent business card scanner application built with Next.js and React. It leverages AI to extract, parse, and save contact information from business cards, providing a comprehensive contact management system. Key capabilities include event tracking, QR code generation, profile sharing, and digital business card creation. The project aims to offer a streamlined solution for managing professional connections and event engagement, utilizing Google's Gemini AI for advanced data extraction from business cards and event URLs.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

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