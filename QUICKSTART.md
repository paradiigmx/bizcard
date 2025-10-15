# Quick Start: Download & Deploy

## 🚀 3 Easy Steps to Deploy Your BizCard+ App

### Step 1: Download Your Code

Choose one method:

**Option A: Download ZIP from Replit**
1. Click the **⋮** menu (three dots) in Replit
2. Select "Download as zip"
3. Extract on your computer

**Option B: Create ZIP via Command**
```bash
npm run export
```
This creates `bizcard-deployment.zip` with all necessary files.

**Option C: Use Replit Git**
1. Open Tools → Add Git
2. Connect to GitHub
3. Push your code

---

### Step 2: Push to GitHub

1. Create new repo at [github.com/new](https://github.com/new)
2. In your terminal:
   ```bash
   git init
   git add .
   git commit -m "BizCard+ AI Scanner"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```

---

### Step 3: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) → "New Project"
2. Import your GitHub repo
3. Add environment variable:
   - Name: `NEXT_PUBLIC_API_KEY`
   - Value: Your Google Gemini API key ([get one](https://makersuite.google.com/app/apikey))
4. Click "Deploy"
5. Done! 🎉 Your app is live

---

## 📋 Checklist

Before deploying, ensure:
- ✅ You have a Google Gemini API key
- ✅ Code is pushed to GitHub
- ✅ Environment variable is set in Vercel
- ✅ Build completes successfully

## 🔑 Get Your API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create or select a project
3. Generate API key
4. Copy and save it securely

## 🆘 Need Help?

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions on:
- Deploying to Netlify, Railway, or other platforms
- Setting up Supabase for database storage
- Custom domain configuration
- Troubleshooting common issues

---

**Powered by Paradiigm** | info@pdiigm.com | [paradiigm.net](https://paradiigm.net)
