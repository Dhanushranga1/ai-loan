// Audit logging helper (server-side)
import { createServerSupabaseClient, getServerUser } from './supabaseServer'

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
    const user = await getServerUser()
    if (!user) return // Skip if no user
    
    const supabase = await createServerSupabaseClient()
    
    const { error } = await supabase.from('audit_logs').insert({
      actor: user.id,
      action: data.action,
      entity: data.entity,
      entity_id: data.entity_id,
      meta: data.meta || {},
      created_at: new Date().toISOString()
    })
    
    if (error) {
      console.warn('Failed to insert audit log:', error)
    }
  } catch (error) {
    // Best effort - don't throw on audit log failures
    console.warn('Failed to insert audit log:', error)
  }
}
