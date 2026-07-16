import { AccessDecisionService } from '@/features/platform-privacy/access.service'
import { PrivacyAuditService } from '@/features/platform-privacy/audit.service'
import { SupabaseClient } from '@supabase/supabase-js'

/**
 * Privacy Integration SDK Middleware
 * This function should be wrapped around any business logic that accesses Personal Identifiable Information (PII).
 * It enforces access decisions and automatically logs the event to the immutable privacy_logs schema.
 */
export async function withPrivacyCheck<T>(
    supabaseClient: SupabaseClient,
    params: {
        actorId: string,
        actorRole: string,
        systemName: string,
        targetSubjectId: string,
        action: 'Read' | 'Export' | 'Modify' | 'Delete',
        purpose: string,
        dataScope: string[]
    },
    callback: () => Promise<T>
): Promise<T> {
    const accessService = new AccessDecisionService(supabaseClient)
    const auditService = new PrivacyAuditService(supabaseClient)
    
    // Evaluate policy using the actual service API
    const decision = await accessService.evaluateAccess({
        actorId: params.actorId,
        role: params.actorRole,
        targetDataElementId: params.targetSubjectId,
        purposeId: params.purpose,
        systemId: params.systemName
    })

    // Log the audit BEFORE running the callback to ensure evidence exists
    const traceId = `TRC-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    
    await auditService.logAccessEvent({
        actor_id: params.actorId,
        system_name: params.systemName,
        action: params.action,
        target_subject_id: params.targetSubjectId,
        data_scope: params.dataScope.join(', '),
        purpose: params.purpose,
        result: decision.decision === 'allow' ? 'Allow' : 'Deny',
        trace_id: traceId
    })

    if (decision.decision !== 'allow') {
        throw new Error(`Privacy Policy Violation: Access denied for purpose '${params.purpose}'. Reason: Policy rule ${decision.policy_rule_ref}`)
    }

    // Execute the actual business logic
    try {
        const result = await callback()
        return result
    } catch (err) {
        throw err
    }
}
