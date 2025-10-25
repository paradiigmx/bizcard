# Deployment Guide

## Quick Deploy to Vercel (Recommended)

### Prerequisites
- GitHub account
- Vercel account (free tier available)
- Google Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))

### Step-by-Step Deployment

#### 1. Push to GitHub

```bash
# Initialize git repository (if not already done)
git init

# Add all files
git add .

# Commit changes
git commit -m "Initial commit: BizCard+ AI Scanner"

# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Push to GitHub
git push -u origin main
```

#### 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Next.js
   - **Root Directory**: ./
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)

5. Add Environment Variable:
   - Click "Environment Variables"
   - Add `NEXT_PUBLIC_API_KEY` with your Google Gemini API key
   - Make sure it's available for all environments (Production, Preview, Development)

6. Click "Deploy"

Your app will be live at `https://your-project-name.vercel.app` in ~2 minutes!

#### 3. Configure Custom Domain (Optional)

1. In Vercel dashboard, go to your project settings
2. Click "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

---

## Alternative Deployment Options

### Deploy to Netlify

1. Push your code to GitHub
2. Go to [netlify.com](https://netlify.com)
3. Click "Add new site" → "Import an existing project"
4. Connect to GitHub and select your repository
5. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
6. Add environment variable: `NEXT_PUBLIC_API_KEY`
7. Click "Deploy site"

### Deploy to Railway

1. Push your code to GitHub
2. Go to [railway.app](https://railway.app)
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Add environment variable: `NEXT_PUBLIC_API_KEY`
6. Railway will auto-detect Next.js and deploy

### Deploy to Render

1. Push your code to GitHub
2. Go to [render.com](https://render.com)
3. Click "New" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
6. Add environment variable: `NEXT_PUBLIC_API_KEY`
7. Click "Create Web Service"

---

## Environment Variables Required

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_API_KEY` | Google Gemini API Key | ✅ Yes |

### Getting Your Google Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key and add it to your deployment platform

---

## Post-Deployment Checklist

- ✅ Verify the app loads correctly
- ✅ Test business card scanning feature
- ✅ Test contact creation and management
- ✅ Verify PWA installation works
- ✅ Test on mobile devices
- ✅ Check all themes work correctly
- ✅ Test dark mode toggle

---

## Troubleshooting

### Build Fails

- **Check Node.js version**: Ensure Vercel is using Node.js 18+
- **Check environment variables**: Make sure `NEXT_PUBLIC_API_KEY` is set
- **Clear cache**: In Vercel, go to Settings → General → Clear Build Cache

### AI Scanning Not Working

- **Verify API key**: Make sure your Google Gemini API key is valid
- **Check API quota**: Ensure you haven't exceeded your API limits
- **Check browser console**: Look for any error messages

### PWA Not Installing

- **HTTPS required**: PWA only works on HTTPS (Vercel provides this automatically)
- **Clear cache**: Clear browser cache and try again
- **Check manifest.json**: Ensure manifest.json is accessible at `/manifest.json`

---

## Performance Optimization

### Recommended Settings for Vercel

1. Enable Edge Functions for faster response times
2. Configure caching headers in `vercel.json`
3. Enable Analytics to monitor performance

### Image Optimization

The app automatically compresses images using Next.js Image Optimization. No additional configuration needed.

---

## Monitoring & Analytics

### Vercel Analytics (Recommended)

1. Go to your project in Vercel
2. Click "Analytics" tab
3. Enable Vercel Analytics
4. Get insights on page views, performance, and user behavior

### Google Analytics (Optional)

Add Google Analytics by creating `app/analytics.tsx` and following Next.js analytics guide.

---

## Updating Your Deployed App

```bash
# Make changes to your code
git add .
git commit -m "Your update message"
git push origin main
```

Vercel will automatically deploy the new version!

---

## Support

For deployment issues:
- Vercel: [vercel.com/docs](https://vercel.com/docs)
- Next.js: [nextjs.org/docs](https://nextjs.org/docs)
- Project Issues: Create an issue on GitHub

---

**Made with ❤️ by Paradiigm**
