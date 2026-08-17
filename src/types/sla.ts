// =====================
// SLA Types — Phase 3 Business Intelligence
// =====================

import type { AssetTypeCategory } from './asset-management'

// ── SLA Plan ─────────────────────────────────────────────────────────────────

export interface SLAPlan {
    id: string
    tenant_id: string
    name: string
    description: string | null
    asset_category: AssetTypeCategory | null
    target_uptime_pct: number
    max_response_hours: number
    max_resolution_hours: number
    is_default: boolean
    created_at: string
    updated_at: string
}

export interface CreateSLAPlanInput {
    name: string
    description?: string
    asset_category?: AssetTypeCategory | null
    target_uptime_pct?: number
    max_response_hours?: number
    max_resolution_hours?: number
    is_default?: boolean
}

export interface UpdateSLAPlanInput extends Partial<CreateSLAPlanInput> {
    _dummy?: undefined;
}

// ── Compliance ────────────────────────────────────────────────────────────────

export interface SLAComplianceRecord {
    work_order_id: string
    tenant_id: string
    asset_id: string
    title: string
    priority: string
    status: string
    created_at: string
    started_at: string | null
    resolved_at: string | null
    closed_at: string | null
    sla_plan_id: string | null
    sla_plan_name: string | null
    max_response_hours: number | null
    max_resolution_hours: number | null
    response_hours: number | null
    resolution_hours: number | null
    response_sla_met: boolean | null
    resolution_sla_met: boolean | null
    asset_category: string | null
}

export interface OrgSLASummary {
    total_work_orders: number
    response_sla_met: number
    response_sla_breached: number
    resolution_sla_met: number
    resolution_sla_breached: number
    response_compliance_pct: number   // 0–100
    resolution_compliance_pct: number // 0–100
}

// ── Org Health (from getOrgHealthSummary) ─────────────────────────────────────

export interface OrgHealthSummary {
    total: number
    healthy: number   // score >= 80
    degraded: number  // 40-79
    critical: number  // < 40
    avg_score: number
}

export interface AssetHealthRow {
    asset_id: string
    asset_name: string
    asset_category: string
    lifecycle_status: string
    health_score: number | null
    site_name: string | null
    province: string | null
    linked_device_count: number
}
