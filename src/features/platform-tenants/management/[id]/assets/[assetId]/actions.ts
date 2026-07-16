'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// ============================================================================
// Types
// ============================================================================

export interface AssetActivityLog {
    id: string
    asset_id: string
    activity_type: string
    description: string
    occurred_at: string
    performed_by_id: string | null
    metadata: Record<string, unknown>
    performed_by_name?: string
}

export interface WorkOrder {
    id: string
    tenant_id: string
    asset_id: string
    title: string
    description: string | null
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
    status: 'OPEN' | 'IN_PROGRESS' | 'ON_HOLD' | 'RESOLVED' | 'CLOSED' | 'CANCELLED'
    type: 'MAINTENANCE' | 'REPAIR' | 'INSPECTION' | 'INSTALLATION' | 'OTHER'
    assigned_to_id: string | null
    reported_by_id: string | null
    due_at: string | null
    resolved_at: string | null
    created_at: string
    updated_at: string
    assigned_to_name?: string
    reported_by_name?: string
}

// ============================================================================
// Supabase Client Helper
// ============================================================================

async function getSupabase() {
    const cookieStore = await cookies()
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch {
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            },
        }
    )
}

// ============================================================================
// Actions
// ============================================================================

export async function getAssetActivityLogs(assetId: string): Promise<AssetActivityLog[]> {
    const supabase = await getSupabase()

    const { data, error } = await supabase
        .from('v_asset_activity_log')
        .select('*')
        .eq('asset_id', assetId)
        .order('occurred_at', { ascending: false })

    if (error) {
        console.error('Error fetching asset activity logs:', error)
        return []
    }

    return data as AssetActivityLog[]
}

export async function getAssetWorkOrders(assetId: string): Promise<WorkOrder[]> {
    const supabase = await getSupabase()

    // Assuming there is a view `v_work_orders` that joins user names, otherwise fetching from `work_orders` directly
    const { data, error } = await supabase
        .from('work_orders')
        .select(`
            *,
            assigned_to:users!assigned_to_id(display_name),
            reported_by:users!reported_by_id(display_name)
        `)
        .eq('asset_id', assetId)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching work orders:', error)
        return []
    }

    return data.map((wo: Record<string, unknown> & { assigned_to?: { display_name?: string }, reported_by?: { display_name?: string } }) => ({
        ...wo,
        assigned_to_name: wo.assigned_to?.display_name,
        reported_by_name: wo.reported_by?.display_name,
    })) as WorkOrder[]
}

export async function getAssetDevices(assetId: string) {
    const supabase = await getSupabase()

    // Fetch from devices where current_asset_id matches
    const { data, error } = await supabase
        .from('devices')
        .select('*')
        .eq('current_asset_id', assetId)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching asset devices:', error)
        return []
    }

    return data
}
