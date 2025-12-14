import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. Please check your .env.local file has:\n' +
      'NEXT_PUBLIC_SUPABASE_URL=your_project_url\n' +
      'NEXT_PUBLIC_SUPABASE_ANON_KEY=your_publishable_key'
    )
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
