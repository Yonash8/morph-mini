# Deployment Guide

This guide will help you deploy your resume builder application to production.

## Prerequisites

1. **Supabase Project**: Make sure you have a Supabase project set up
2. **Git Repository**: Your code should be in a Git repository (GitHub, GitLab, or Bitbucket)
3. **Environment Variables**: You'll need your Supabase credentials

## Step 1: Set Up Supabase Database

Before deploying, you need to run the database migrations:

1. Go to your Supabase project dashboard: https://app.supabase.com
2. Navigate to **SQL Editor**
3. Copy the contents of `supabase/migrations/001_create_tables.sql`
4. Paste and run it in the SQL Editor
5. Verify the tables were created by checking the **Table Editor**

## Step 2: Get Your Supabase Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (this is your `NEXT_PUBLIC_SUPABASE_URL`)
   - **anon/public key** (this is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`)

## Step 3: Deploy to Vercel (Recommended)

Vercel is the easiest and best option for Next.js applications.

### Option A: Deploy via Vercel Dashboard

1. **Sign up/Login**: Go to https://vercel.com and sign in (GitHub/Google/GitLab)

2. **Import Project**:
   - Click "Add New..." → "Project"
   - Import your Git repository
   - Select your repository

3. **Configure Project**:
   - **Framework Preset**: Next.js (should be auto-detected)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

4. **Add Environment Variables**:
   - Click "Environment Variables"
   - Add the following:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```
   - Make sure to select all environments (Production, Preview, Development)

5. **Deploy**:
   - Click "Deploy"
   - Wait for the build to complete
   - Your app will be live at `https://your-project-name.vercel.app`

### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```
   - Follow the prompts
   - When asked for environment variables, add:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. **Production Deploy**:
   ```bash
   vercel --prod
   ```

## Step 4: Configure Supabase Auth Redirect URLs

After deployment, you need to add your production URL to Supabase:

1. Go to your Supabase project → **Authentication** → **URL Configuration**
2. Add your Vercel URL to:
   - **Site URL**: `https://your-project-name.vercel.app`
   - **Redirect URLs**: 
     - `https://your-project-name.vercel.app/auth/callback`
     - `https://your-project-name.vercel.app/**`

## Alternative Deployment Options

### Netlify

1. Sign up at https://netlify.com
2. Connect your Git repository
3. Build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
4. Add environment variables in Site settings
5. Deploy

### Railway

1. Sign up at https://railway.app
2. Create new project from GitHub repo
3. Add environment variables
4. Railway will auto-detect Next.js and deploy

### Render

1. Sign up at https://render.com
2. Create new Web Service
3. Connect your repository
4. Build command: `npm run build`
5. Start command: `npm start`
6. Add environment variables
7. Deploy

## Post-Deployment Checklist

- [ ] Database migrations run successfully
- [ ] Environment variables configured
- [ ] Supabase redirect URLs updated
- [ ] Test authentication (sign up/login)
- [ ] Test resume creation and saving
- [ ] Test PDF export functionality
- [ ] Verify all features work in production

## Troubleshooting

### Build Errors
- Make sure all dependencies are in `package.json`
- Check that Node.js version is compatible (Next.js 14 requires Node 18+)

### Authentication Issues
- Verify Supabase environment variables are correct
- Check that redirect URLs are configured in Supabase
- Ensure middleware is working correctly

### Database Errors
- Verify migrations were run successfully
- Check RLS (Row Level Security) policies are active
- Ensure user trigger function is created

## Custom Domain (Optional)

1. In Vercel dashboard, go to your project → **Settings** → **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update Supabase redirect URLs to include your custom domain

