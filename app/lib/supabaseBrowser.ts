// Browser client for Supabase (client-side)
import { createBrowserClient } from '@supabase/ssr'

export function createBrowserSupabaseClient() {
  // TODO: Implement browser client with NEXT_PUBLIC_ keys
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
