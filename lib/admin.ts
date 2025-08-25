import { createServerSupabaseClient, getServerUser } from '@/app/lib/supabaseServer'

export async function isAdmin(userId?: string): Promise<boolean> {
  try {
    const supabase = await createServerSupabaseClient()
    
    // If no userId provided, get current user
    let targetUserId = userId
    if (!targetUserId) {
      const user = await getServerUser()
      if (!user) return false
      targetUserId = user.id
    }
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', targetUserId)
      .single()
    
    if (error || !profile) {
      return false
    }
    
    return profile.role === 'admin'
  } catch (error) {
    console.error('Error checking admin status:', error)
    return false
  }
}

export async function requireAdmin(userId?: string): Promise<void> {
  const adminStatus = await isAdmin(userId)
  if (!adminStatus) {
    throw new Error('Admin access required')
  }
}
