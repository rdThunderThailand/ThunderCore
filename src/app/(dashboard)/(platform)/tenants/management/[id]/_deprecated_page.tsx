import { getAdminClient } from '@/utils/supabase/admin'
import { notFound } from 'next/navigation'
import { OrgDashboardContent } from './org-dashboard-content'

interface PageProps {
    params: Promise<{ id: string }>
}

async function getTenantDetails(id: string) {
    const adminClient = await getAdminClient()

    // 1. Tenant details — ใช้ adminClient bypass RLS
    const { data: org, error: orgError } = await adminClient
        .from('tenants')
        .select('*')
        .eq('id', id)
        .single()

    if (orgError || !org) return null

    // 2. Players — เช็ค column ที่มีจริง
    const { data: players } = await adminClient
        .from('assets')
        .select('connection_status')
        .eq('tenant_id', id)

    // 3. Members — ใช้ users แทน profiles
    const { data: members } = await adminClient
        .from('memberships')
        .select('id, created_at, users(id, first_name, last_name)')
        .eq('tenant_id', id)

    // Process player status
    const playerStatus = { online: 0, offline: 0, busy: 0, error: 0, total: 0 }
    if (players) {
        playerStatus.total = players.length
        players.forEach((p: { connection_status: string | null }) => {
            if (p.connection_status === 'online') playerStatus.online++
            else if (p.connection_status === 'offline') playerStatus.offline++
            else if (p.connection_status === 'busy') playerStatus.busy++
            else playerStatus.error++
        })
    }

    return {
        ...org,
        // quota — fallback เพราะยังไม่มีตาราง
        quota: { max_assets: 50, used_assets: players?.length || 0, max_storage_mb: 50 * 1024, used_storage_mb: 0 },
        playerStatus,
        members: members || [],
        recentLogs: []  // audit_logs ยังไม่มีตาราง
    }
}

export default async function OrgManagementOverview({ params }: PageProps) {
    const { id } = await params
    const tenant = await getTenantDetails(id)

    if (!tenant) {
        notFound()
    }

    const createdDate = tenant.created_at
        ? new Date(tenant.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
        : 'Unknown'

    return (
        <OrgDashboardContent
            tenant={{
                id: tenant.id,
                name: tenant.name,
                status: tenant.status,
                type: tenant.type,
                quota: tenant.quota,
                playerStatus: tenant.playerStatus,
                members: tenant.members,
                recentLogs: tenant.recentLogs
            }}
            createdDate={createdDate}
        />
    )
}
