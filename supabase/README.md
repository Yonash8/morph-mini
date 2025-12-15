# Supabase Database Setup

This directory contains SQL migrations for setting up the database tables.

## Running the Migration

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project: https://app.supabase.com
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the contents of `migrations/001_create_tables.sql`
5. Click **Run** (or press Ctrl+Enter)
6. Verify the tables were created by checking **Table Editor** → you should see `users` and `resume_versions` tables

### Option 2: Using Supabase CLI

If you have Supabase CLI installed:

```bash
supabase db push
```

## Tables Created

### `users`
- Extends Supabase auth.users
- Stores additional user information
- Automatically created when a user signs up (via trigger)

### `resume_versions`
- Stores resume data as JSONB
- Links to users via `user_id`
- Includes `created_at` and `updated_at` timestamps
- Automatically updates `updated_at` on changes (via trigger)

## Row Level Security (RLS)

Both tables have RLS enabled with policies that ensure:
- Users can only access their own data
- Users can create, read, update, and delete their own resume versions
- All operations require authentication

## Usage

See `lib/supabase/database.ts` for TypeScript functions to interact with these tables:

- `createResumeVersion(metadata)` - Create a new resume version
- `updateResumeVersion(id, metadata)` - Update an existing resume version
- `getResumeVersions()` - Get all resume versions for the current user
- `getResumeVersion(id)` - Get a specific resume version
- `deleteResumeVersion(id)` - Delete a resume version
- `getOrCreateUser()` - Get or create user record

