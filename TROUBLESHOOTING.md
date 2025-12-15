# Troubleshooting Supabase 404 Error

If you're getting a Supabase 404 error after clicking "Sign in with Google", follow these steps:

## Step 1: Check What URL Your App is Sending

1. Open your app: https://morph-mini.vercel.app
2. Open Browser Console (F12 → Console tab)
3. Click "Sign In" → "Continue with Google"
4. Look for console logs showing:
   - `🔍 OAuth Redirect URL: https://morph-mini.vercel.app/auth/callback`
   - `🔍 Current Origin: https://morph-mini.vercel.app`
5. **Copy the exact URL shown** (it should be `https://morph-mini.vercel.app/auth/callback`)

## Step 2: Verify Supabase Configuration

Go to: https://app.supabase.com → Your Project → **Authentication** → **URL Configuration**

### Check Redirect URLs:
The **Redirect URLs** field should contain **EXACTLY**:
```
https://morph-mini.vercel.app/auth/callback
```

**Common mistakes:**
- ❌ `https://morph-mini.vercel.app/auth/callback/` (trailing slash)
- ❌ `http://morph-mini.vercel.app/auth/callback` (http instead of https)
- ❌ `https://morph-mini.vercel.app` (missing /auth/callback)
- ❌ Extra spaces before/after

### Check Site URL:
The **Site URL** should be:
```
https://morph-mini.vercel.app
```

## Step 3: Try Adding Wildcard Pattern

If the exact URL doesn't work, try adding a wildcard pattern:

In **Redirect URLs**, add BOTH:
```
https://morph-mini.vercel.app/auth/callback
https://morph-mini.vercel.app/**
```

The `/**` pattern allows any path under your domain.

## Step 4: Check Google OAuth Provider Settings

1. Go to: **Authentication** → **Providers** → **Google**
2. Make sure Google is **Enabled**
3. Check that you have:
   - **Client ID** configured
   - **Client Secret** configured
4. In Google Cloud Console, make sure your OAuth redirect URI includes:
   ```
   https://[YOUR_SUPABASE_PROJECT_REF].supabase.co/auth/v1/callback
   ```
   (This is Supabase's callback URL, not your app's URL)

## Step 5: Clear Browser Cache

Sometimes cached redirects cause issues:
1. Clear browser cache and cookies
2. Try in an incognito/private window
3. Try a different browser

## Step 6: Verify Callback Route Works

Test if your callback route is accessible:
1. Visit: https://morph-mini.vercel.app/auth/callback
2. It should redirect you to the home page (not show 404)
3. If it shows 404, the route isn't deployed correctly

## Still Not Working?

Check the browser's Network tab (F12 → Network):
1. Click "Sign in with Google"
2. Look for the redirect request
3. Check what URL Supabase is trying to redirect to
4. Compare it with what's in your Supabase Redirect URLs configuration

## Quick Checklist

- [ ] Redirect URL in Supabase matches exactly: `https://morph-mini.vercel.app/auth/callback`
- [ ] Site URL is: `https://morph-mini.vercel.app`
- [ ] No trailing slashes
- [ ] Using `https://` not `http://`
- [ ] Google OAuth provider is enabled in Supabase
- [ ] Callback route `/auth/callback` is accessible
- [ ] Cleared browser cache
- [ ] Checked browser console for the actual URL being sent

