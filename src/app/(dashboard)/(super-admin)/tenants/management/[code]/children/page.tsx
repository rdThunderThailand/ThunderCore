import { notFound } from 'next/navigation'
import { ChildTenantsClient } from '@/features/platform-tenants/management/[id]/children/ChildTenantsClient'
import { requireRole } from '@/lib/rbac'
import { getChildTenants, getTenant, getTenants } from '@/lib/tenants'

export const dynamic = 'force-dynamic'

export default async function ChildTenantsPage({ params }: { params: Promise<{ code: string }> }) {
    await requireRole('super_admin')
    const { code } = await params
    const parent = await getTenant(code)
    if (!parent) notFound()
    const [children, all] = await Promise.all([getChildTenants(parent.id), getTenants()])

    // Candidates: anything that is not this tenant, not already its child, and not one of its ancestors
    // (Core refuses cycles too; this just keeps them out of the picker).
    const byId = new Map(all.map((t) => [t.id, t]))
    const ancestors = new Set<string>()
    for (let p = parent.parentTenantId; p && !ancestors.has(p); p = byId.get(p)?.parentTenantId ?? null) ancestors.add(p)
    const candidates = all
        .filter((t) => t.id !== parent.id && t.parentTenantId !== parent.id && !ancestors.has(t.id))
        .sort((a, b) => a.name.localeCompare(b.name))

    return <ChildTenantsClient parent={parent} childTenants={children} candidates={candidates} />
}
