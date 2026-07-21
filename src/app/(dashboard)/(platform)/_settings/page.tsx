import { SettingHomeClient } from '@/features/platform-settings/SettingHomeClient'
import { requireRole } from '@/lib/rbac'

export const dynamic = 'force-dynamic'

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function UserSettingsPage(props: PageProps) {
    await requireRole('super_admin')
    const searchParams = await props.searchParams
    const userId = typeof searchParams.user === 'string' ? searchParams.user : undefined

    return (
        <SettingHomeClient userId={userId} />
    )
}
