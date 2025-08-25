// Server-side Supabase client (session-bound, no service role)
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createServerSupabaseClient() {
  const cookieStore = await cookies()
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Cookie setting can fail in server components
            // This is expected behavior in some cases
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Cookie removal can fail in server components
            // This is expected behavior in some cases
          }
        },
      },
    }
  )
}

/**
 * Get authenticated user from server-side Supabase client
 * @returns User object or null if not authenticated
 */
export async function getServerUser() {
  const supabase = await createServerSupabaseClient()
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return null
    }
    
    return user
  } catch (error) {
    console.error('Error getting server user:', error)
    return null
  }
}

/**
 * Check if current user is admin
 * @returns boolean indicating admin status
 */
export async function isUserAdmin(): Promise<boolean> {
  const user = await getServerUser()
  if (!user) return false
  
  const supabase = await createServerSupabaseClient()
  
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    return profile?.role === 'admin'
  } catch (error) {
    console.error('Error checking admin status:', error)
    return false
  }
}

/**
 * Require authentication and return user
 * Throws error if user is not authenticated
 */
export async function requireAuth() {
  const user = await getServerUser()
  
  if (!user) {
    throw new Error('Unauthorized')
  }
  
  return user
}
