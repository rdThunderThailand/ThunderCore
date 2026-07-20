import { ApplicationHomeClient } from '@/features/platform-applications/ApplicationHomeClient'
import { requireRole } from '@/lib/rbac'

export const dynamic = 'force-dynamic'

export default async function ApplicationsPage(props: any) {
    await requireRole('super_admin')
    return <ApplicationHomeClient {...props} />
}
