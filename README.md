# BizCard+ AI Scanner

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

An intelligent business card scanner application powered by Google Gemini AI. Built with Next.js, React, and TypeScript.

![BizCard+ Screenshot](public/bizcard-logo.png)

## Features

- 🎯 **AI-Powered Scanning**: Extract contact information from business cards using Google Gemini AI
- 📇 **Contact Management**: Organize contacts with tags, types, and custom fields
- 📅 **Event Tracking**: Link contacts to events and track relationships
- 📱 **PWA Support**: Install as a mobile app with offline capabilities
- 🎨 **Custom Theming**: Multiple themes with dark mode support
- 🔗 **QR Code Sharing**: Generate QR codes for easy contact sharing
- 🌐 **Multi-language Support**: Available in English, Spanish, French, German, Japanese, and Chinese

## Quick Start

### Prerequisites

- Node.js 18+ installed
- Google Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd bizcard-nextjs
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` and add your Google Gemini API key:
   ```
   NEXT_PUBLIC_API_KEY=your_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:5000](http://localhost:5000)

## Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variable: `NEXT_PUBLIC_API_KEY` with your Google Gemini API key
   - Click "Deploy"

### Deploy to Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- Render
- AWS Amplify

Just ensure you set the `NEXT_PUBLIC_API_KEY` environment variable.

## Using Supabase (Optional)

Currently, the app uses localStorage for data persistence. To integrate Supabase:

1. **Install Supabase client**
   ```bash
   npm install @supabase/supabase-js
   ```

2. **Create Supabase project** at [supabase.com](https://supabase.com)

3. **Add environment variables** to `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Update the data layer** to use Supabase instead of localStorage (see `app/provider.tsx`)

## Tech Stack

- **Framework**: Next.js 14
- **UI**: React 18, Tailwind CSS
- **AI**: Google Gemini API
- **Language**: TypeScript
- **PWA**: @ducanh2912/next-pwa
- **QR Codes**: qrcode.react

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── components/        # Layout components
│   ├── contacts/          # Contact pages
│   ├── events/           # Event pages
│   ├── profile/          # Profile page
│   ├── settings/         # Settings page
│   └── u/                # Public profile pages
├── components/           # React components
├── public/              # Static assets
├── types.ts             # TypeScript types
├── constants.ts         # App constants
└── utils.ts            # Utility functions
```

## Customization

### Branding

- Update logo in `/public/bizcard-logo.png`
- Update PWA icons in `/public/` and `manifest.json`
- Modify company info in `app/components/MainLayout.tsx`

### Themes

- Edit theme colors in `app/globals.css`
- Add new themes in `constants.ts`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for your own purposes.

## Support

For issues or questions, contact: info@pdiigm.com

---

**Powered by Paradiigm** | Est 2025 | [paradiigm.net](https://paradiigm.net)
