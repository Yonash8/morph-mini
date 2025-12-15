# Vercel Deployment Guide

## How Vercel Deployments Work

When you push to GitHub, Vercel automatically creates a new deployment. The **production domain** (your main URL) automatically points to the latest deployment from your **main/master branch**.

## Check Current Production Deployment

1. Go to https://vercel.com/dashboard
2. Select your `morph-mini` project
3. Go to the **Deployments** tab
4. Look for the deployment with:
   - ✅ **Production** badge (green)
   - Latest commit from your `main` branch
   - Status: **Ready**

## Ensure Main URL Uses Latest Deployment

### Option 1: Automatic (Recommended)
- Push to `main` branch → Vercel auto-deploys → Production URL updates automatically
- **This is already set up!** Your main URL always points to the latest `main` branch deployment

### Option 2: Manual Promotion
If you want to promote a specific deployment:

1. Go to **Deployments** tab
2. Find the deployment you want
3. Click the **three dots (⋯)** menu
4. Click **"Promote to Production"**
5. Your main URL will now point to that deployment

## Check Which Deployment is Live

Visit: https://morph-mini.vercel.app

Then check:
1. Vercel Dashboard → Deployments
2. Look for the deployment marked **"Production"** (green badge)
3. That's what's live on your main URL

## Branch Deployments

- **main/master branch** → Production URL (https://morph-mini.vercel.app)
- **Other branches** → Preview URLs (https://morph-mini-git-branch-name.vercel.app)

## Quick Verification

1. Make a small change (like updating a comment)
2. Commit and push to `main`
3. Wait for Vercel to deploy (1-2 minutes)
4. Check your site - it should have the latest changes

## Troubleshooting

**If your main URL isn't updating:**
- Check that you pushed to `main` branch (not a different branch)
- Verify the deployment completed successfully
- Check that the deployment is marked as "Production"
- Try promoting manually if needed

