import type { NextRequest } from 'next/server';

import type { Database, Json } from '@/lib/database.types';
import { captureServerException } from '@/lib/observability/server';
import { createAdminClient } from '@/lib/supabase/admin';

export interface AuditLogEntry {
  /** The user performing the action (null for system/webhook actions). */
  userId: string | null;
  /** Dot-notation action identifier, e.g. "case.published", "payment.released". */
  action: string;
  /** Entity type, e.g. "case", "payment", "proposal". */
  entityType: string;
  /** Entity UUID. */
  entityId: string;
  /** Previous state snapshot (optional). */
  oldData?: Record<string, unknown> | null;
  /** New state snapshot (optional). */
  newData?: Record<string, unknown> | null;
  /** Client IP address (optional). */
  ipAddress?: string | null;
  /** Client User-Agent (optional). */
  userAgent?: string | null;
}

/**
 * Extract IP and User-Agent from a Next.js request for audit logging.
 *
 * @param req - Next.js request object
 * @returns Object with ipAddress and userAgent strings
 */
export function extractRequestMeta(req: NextRequest): {
  ipAddress: string | null;
  userAgent: string | null;
} {
  const forwarded = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return {
    ipAddress: forwarded ?? req.headers.get('x-real-ip') ?? null,
    userAgent: req.headers.get('user-agent') ?? null,
  };
}

/**
 * Service for writing audit log entries.
 *
 * Uses the admin (service role) client to bypass RLS, since the audit_log
 * table has no INSERT policy for regular users — only ADMIN SELECT.
 */
export class AuditService {
  /**
   * Write an audit log entry. Failures are logged but never thrown
   * to avoid disrupting the primary operation.
   *
   * @param entry - The audit log data to record
   */
  async log(entry: AuditLogEntry): Promise<void> {
    try {
      const admin = createAdminClient();
      const row: Database['public']['Tables']['audit_log']['Insert'] = {
        user_id: entry.userId,
        action: entry.action,
        entity_type: entry.entityType,
        entity_id: entry.entityId,
        old_data: (entry.oldData ?? null) as Json,
        new_data: (entry.newData ?? null) as Json,
        ip_address: entry.ipAddress ?? null,
        user_agent: entry.userAgent ?? null,
      };
      await admin.from('audit_log').insert(row);
    } catch (error) {
      // Audit logging must never break the primary operation.
      captureServerException(error, 'Audit log write failed', {
        context: {
          action: entry.action,
          entity_type: entry.entityType,
          entity_id: entry.entityId,
        },
      });
    }
  }
}
