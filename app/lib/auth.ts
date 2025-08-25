// Auth helpers for session management
import { createServerSupabaseClient } from './supabaseServer'
import { redirect } from 'next/navigation'

/**
 * Get current session (server-side)
 */
export async function getSession() {
  // TODO: Implement session retrieval
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

/**
 * Get current user (server-side)
 */
export async function getUser() {
  // TODO: Implement user retrieval
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

/**
 * Require authenticated user or redirect to login
 */
export async function requireUser() {
  // TODO: Implement user requirement check
  const user = await getUser()
  if (!user) {
    redirect('/login')
  }
  return user
}

/**
 * Sign out user
 */
export async function signOut() {
  // TODO: Implement sign out
  const supabase = await createServerSupabaseClient()
  await supabase.auth.signOut()
}
