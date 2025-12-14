# Quick Deployment Steps

Your code is ready! Follow these steps to deploy:

## Step 1: Push to GitHub

### Option A: Using GitHub CLI (if installed)
```bash
gh repo create my-resume-builder --public --source=. --remote=origin --push
```

### Option B: Manual GitHub Setup
1. Go to https://github.com/new
2. Create a new repository named `my-resume-builder` (or any name you like)
3. **Don't** initialize with README, .gitignore, or license
4. Copy the commands GitHub shows you, then run:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/my-resume-builder.git
   git branch -M main
   git push -u origin main
   ```

## Step 2: Deploy to Vercel

1. **Go to Vercel**: https://vercel.com
2. **Sign in** with GitHub
3. **Click "Add New..." → "Project"**
4. **Import your repository** (select the repo you just created)
5. **Add Environment Variables**:
   - Click "Environment Variables"
   - Add these two:
     - Name: `NEXT_PUBLIC_SUPABASE_URL` 
       Value: (your Supabase project URL from Supabase dashboard)
     - Name: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
       Value: (your Supabase anon key from Supabase dashboard)
   - Make sure to check all environments (Production, Preview, Development)
6. **Click "Deploy"**
7. **Wait 2-3 minutes** for build to complete
8. **Done!** Your app will be live at `https://your-project-name.vercel.app`

## Step 3: Configure Supabase Redirect URLs

After deployment, update Supabase:

1. Go to your Supabase project: https://app.supabase.com
2. Navigate to **Authentication** → **URL Configuration**
3. Add your Vercel URL:
   - **Site URL**: `https://morph-mini.vercel.app`
   - **Redirect URLs**: Add `https://morph-mini.vercel.app/auth/callback`

## Step 4: Run Database Migrations

Before using the app, run the database migrations:

1. Go to Supabase Dashboard → **SQL Editor**
2. Copy contents of `supabase/migrations/001_create_tables.sql`
3. Paste and run in SQL Editor
4. Verify tables were created in **Table Editor**

## That's it! 🎉

Your resume builder is now live and ready to use!
