// =====================
// Phase 2: Observability Types
// Work Orders + Health Score
// =====================

import type { AssetWithDevices } from './asset-management'

// ── Enums ─────────────────────────────────────────────────────────────────────

export type WorkOrderStatus =
    | 'OPEN'
    | 'IN_PROGRESS'
    | 'PENDING_PARTS'
    | 'RESOLVED'
    | 'CLOSED'
    | 'CANCELLED'

export type WorkOrderPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export type WorkOrderSource = 'manual' | 'alert' | 'sla_breach'

// ── Work Order ────────────────────────────────────────────────────────────────

export interface WorkOrder {
    id: string
    tenant_id: string
    asset_id: string
    title: string
    description: string | null
    status: WorkOrderStatus
    priority: WorkOrderPriority
    source: WorkOrderSource
    source_ref_id: string | null
    assigned_to_id: string | null
    assigned_at: string | null
    due_date: string | null
    started_at: string | null
    resolved_at: string | null
    closed_at: string | null
    resolution_notes: string | null
    created_by_id: string | null
    created_at: string
    updated_at: string
}

export interface WorkOrderWithAsset extends WorkOrder {
    asset: Pick<AssetWithDevices, 'asset_id' | 'asset_name' | 'asset_category' | 'lifecycle_status'> | null
}

export interface CreateWorkOrderInput {
    asset_id: string
    title: string
    description?: string
    priority?: WorkOrderPriority
    source?: WorkOrderSource
    source_ref_id?: string
    assigned_to_id?: string
    due_date?: string
}

export interface UpdateWorkOrderInput {
    title?: string
    description?: string
    status?: WorkOrderStatus
    priority?: WorkOrderPriority
    assigned_to_id?: string | null
    due_date?: string | null
    resolution_notes?: string
}

// ── Health Score ──────────────────────────────────────────────────────────────

export interface AssetHealthScore {
    health_score: number           // 0–100 total
    connectivity_score: number     // 0–40
    heartbeat_score: number        // 0–40
    uptime_score: number           // 0–20 (lifecycle suitability)
    connection_status: string | null
    lifecycle_status: string
    active_device_count: number
}

export interface AssetHealthHistory {
    id: string
    asset_id: string
    health_score: number
    connectivity_score: number | null
    uptime_score: number | null
    heartbeat_score: number | null
    connection_status: string | null
    lifecycle_status: string | null
    active_device_count: number
    recorded_at: string
}

// ── Constants / Helpers ───────────────────────────────────────────────────────

export const WORK_ORDER_STATUS_LABELS: Record<WorkOrderStatus, string> = {
    OPEN: 'เปิด',
    IN_PROGRESS: 'กำลังดำเนินการ',
    PENDING_PARTS: 'รออะไหล่',
    RESOLVED: 'แก้ไขแล้ว',
    CLOSED: 'ปิด',
    CANCELLED: 'ยกเลิก',
}

export const WORK_ORDER_PRIORITY_LABELS: Record<WorkOrderPriority, string> = {
    LOW: 'ต่ำ',
    MEDIUM: 'ปานกลาง',
    HIGH: 'สูง',
    CRITICAL: 'วิกฤต',
}

export const WORK_ORDER_STATUS_COLORS: Record<WorkOrderStatus, string> = {
    OPEN: 'text-blue-400 bg-blue-400/10',
    IN_PROGRESS: 'text-yellow-400 bg-yellow-400/10',
    PENDING_PARTS: 'text-orange-400 bg-orange-400/10',
    RESOLVED: 'text-green-400 bg-green-400/10',
    CLOSED: 'text-gray-400 bg-gray-400/10',
    CANCELLED: 'text-red-400 bg-red-400/10',
}

export const WORK_ORDER_PRIORITY_COLORS: Record<WorkOrderPriority, string> = {
    LOW: 'text-gray-400 bg-gray-400/10',
    MEDIUM: 'text-blue-400 bg-blue-400/10',
    HIGH: 'text-orange-400 bg-orange-400/10',
    CRITICAL: 'text-red-400 bg-red-400/10',
}

/** Maps health score range to a UI color */
export function getHealthScoreColor(score: number): string {
    if (score >= 80) return 'text-green-400'
    if (score >= 60) return 'text-yellow-400'
    if (score >= 40) return 'text-orange-400'
    return 'text-red-400'
}

/** Maps health score to a label */
export function getHealthScoreLabel(score: number): string {
    if (score >= 80) return 'ดี'
    if (score >= 60) return 'ปานกลาง'
    if (score >= 40) return 'ต่ำ'
    return 'วิกฤต'
}
