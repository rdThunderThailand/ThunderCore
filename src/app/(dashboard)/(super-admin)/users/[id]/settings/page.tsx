import { SettingHomeClient } from '@/features/platform-settings/SettingHomeClient'

export const dynamic = 'force-dynamic'

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function UserSettingsPage(props: PageProps) {
    const searchParams = await props.searchParams
    const userId = typeof searchParams.user === 'string' ? searchParams.user : undefined

    return (
        <SettingHomeClient userId={userId} />
    )
}
