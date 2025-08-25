// Audit logging helper (server-side)
import { createServerSupabaseClient } from './supabaseServer'

export interface AuditLogData {
  action: string
  entity: string
  entity_id: string
  meta?: Record<string, any>
}

/**
 * Insert audit log entry
 * @param data - Audit log data
 */
export async function insertAuditLog(data: AuditLogData): Promise<void> {
  try {
    // TODO: Implement audit log insertion
    const supabase = createServerSupabaseClient()
    
    const { data: user } = await supabase.auth.getUser()
    if (!user?.user) return // Skip if no user
    
    await supabase.from('audit_logs').insert({
      actor: user.user.id,
      action: data.action,
      entity: data.entity,
      entity_id: data.entity_id,
      meta: data.meta || {},
      created_at: new Date().toISOString()
    })
  } catch (error) {
    // Best effort - don't throw on audit log failures
    console.warn('Failed to insert audit log:', error)
  }
}
