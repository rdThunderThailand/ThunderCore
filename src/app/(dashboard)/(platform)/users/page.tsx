import { UsersHomeClient } from '@/features/platform-users/UsersHomeClient'
import { requireRole } from '@/lib/rbac'

export const dynamic = 'force-dynamic'

export default async function UsersPage() {
    await requireRole('super_admin')
    return (
        <UsersHomeClient />
    )
}
