# Deployment Guide

## Download Your Code from Replit

### Method 1: Download as ZIP (Easiest)
1. In Replit, click the **three dots menu** (⋮) in the top right
2. Select **"Download as zip"**
3. Extract the ZIP file on your computer

### Method 2: Use Git (Recommended)
1. In Replit, open the **Tools** panel
2. Add the **Git** tool
3. Connect to your GitHub account
4. Push your code to GitHub

### Method 3: Shell Command
```bash
zip -r bizcard-app.zip . -x "node_modules/*" ".next/*" ".config/*"
```

---

## Deploy to Vercel

### Step 1: Push to GitHub

1. **Create a new GitHub repository**
   - Go to [github.com/new](https://github.com/new)
   - Name it (e.g., "bizcard-ai-scanner")
   - Don't initialize with README (you already have one)

2. **Push your code**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - BizCard+ AI Scanner"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```

### Step 2: Deploy to Vercel

1. **Go to [vercel.com](https://vercel.com)** and sign up/login

2. **Import your repository**
   - Click "New Project"
   - Select "Import Git Repository"
   - Choose your GitHub repository

3. **Configure project**
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: `./` (leave default)
   - Build Command: `npm run build` (auto-filled)
   - Output Directory: `.next` (auto-filled)

4. **Add environment variable**
   - Click "Environment Variables"
   - Name: `NEXT_PUBLIC_API_KEY`
   - Value: Your Google Gemini API key
   - Click "Add"

5. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes for build to complete
   - Your app will be live at: `https://your-project.vercel.app`

---

## Deploy to Netlify

1. **Push to GitHub** (see above)

2. **Go to [netlify.com](https://netlify.com)**

3. **Import repository**
   - Click "Add new site" → "Import an existing project"
   - Connect to GitHub and select your repo

4. **Build settings**
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Add environment variable: `NEXT_PUBLIC_API_KEY`

5. **Deploy**

---

## Deploy to Railway

1. **Push to GitHub** (see above)

2. **Go to [railway.app](https://railway.app)**

3. **New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

4. **Configure**
   - Add environment variable: `NEXT_PUBLIC_API_KEY`
   - Railway will auto-detect Next.js settings

5. **Deploy**

---

## Using Supabase for Database (Optional)

Currently, the app stores data in the browser's localStorage. To add a real database:

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Copy your project URL and anon key

### Step 2: Install Supabase

```bash
npm install @supabase/supabase-js
```

### Step 3: Add Environment Variables

In `.env.local` (and your deployment platform):
```
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### Step 4: Create Database Schema

Run this SQL in Supabase SQL Editor:

```sql
-- Contacts table
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users,
  handle TEXT UNIQUE,
  name TEXT NOT NULL,
  role TEXT,
  company TEXT,
  email TEXT,
  phone TEXT,
  address JSONB,
  website TEXT,
  linkedin TEXT,
  twitter TEXT,
  tags TEXT[],
  contact_type TEXT,
  notes TEXT,
  is_favorite BOOLEAN DEFAULT false,
  profile_picture TEXT,
  reminder JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Events table
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users,
  name TEXT NOT NULL,
  date TIMESTAMP,
  location TEXT,
  description TEXT,
  url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Contact-Event links
CREATE TABLE event_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contact_id UUID REFERENCES contacts ON DELETE CASCADE,
  event_id UUID REFERENCES events ON DELETE CASCADE,
  role TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Step 5: Update Code

Replace localStorage calls in `app/provider.tsx` with Supabase queries.

---

## Environment Variables Summary

Required for all deployments:
- `NEXT_PUBLIC_API_KEY` - Google Gemini API key

Optional (if using Supabase):
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key

---

## Custom Domain Setup

### Vercel
1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

### Netlify
1. Go to Domain Settings
2. Add custom domain
3. Configure DNS

---

## Troubleshooting

### Build fails with "Module not found"
- Run `npm install` locally to ensure all dependencies are listed
- Commit `package-lock.json` to Git

### Environment variables not working
- Ensure they're prefixed with `NEXT_PUBLIC_`
- Redeploy after adding variables

### Images not loading
- Check that all images are in the `/public` folder
- Use relative paths starting with `/`

### PWA not working after deployment
- Check that service worker files are in `/public`
- Clear browser cache and reinstall PWA

---

## Need Help?

Contact: info@pdiigm.com

**Powered by Paradiigm** | [paradiigm.net](https://paradiigm.net)
