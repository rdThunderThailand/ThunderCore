import { ApplicationidSettingsClient } from '@/features/platform-applications/management/setting/ApplicationidSettingsClient'
import { requireRole } from '@/lib/rbac'

export const dynamic = 'force-dynamic'

export default async function ApplicationIdSettingsPage(props: any) {
    await requireRole('super_admin')
    const { id } = await props.params

    return <ApplicationidSettingsClient appId={id} />
}