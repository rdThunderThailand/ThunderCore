// =====================
// Alert Types — Phase 4 Real-time & Alerts
// =====================

import type { AssetTypeCategory } from './asset-management'

export type AlertSeverity = 'INFO' | 'WARNING' | 'CRITICAL';
export type AlertOperator = 'LT' | 'GT' | 'EQ' | 'LTE' | 'GTE';
export type AlertIncidentStatus = 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED';

// ── Alert Rule ───────────────────────────────────────────────────────────────

export interface AlertRule {
    id: string
    tenant_id: string
    name: string
    description: string | null
    asset_category: AssetTypeCategory | null
    target_attribute: string
    operator: AlertOperator
    threshold: number
    severity: AlertSeverity
    is_enabled: boolean
    created_at: string
    updated_at: string
}

export interface CreateAlertRuleInput {
    name: string
    description?: string
    asset_category?: AssetTypeCategory | null
    target_attribute?: string
    operator?: AlertOperator
    threshold: number
    severity?: AlertSeverity
    is_enabled?: boolean
}

export interface UpdateAlertRuleInput extends Partial<CreateAlertRuleInput> {
    _dummy?: undefined;
}

// ── Alert Incident ───────────────────────────────────────────────────────────

export interface AlertIncident {
    id: string
    tenant_id: string
    rule_id: string
    asset_id: string
    triggered_value: number
    severity: AlertSeverity
    status: AlertIncidentStatus
    message: string | null
    acknowledged_at: string | null
    acknowledged_by_id: string | null
    resolved_at: string | null
    resolved_by_id: string | null
    created_at: string
    updated_at: string
    // Enriched fields from joins
    asset_name?: string
    rule_name?: string
}

// ── Dashboard Summaries ──────────────────────────────────────────────────────

export interface OrgAlertSummary {
    total_active: number
    critical_count: number
    warning_count: number
    info_count: number
}
