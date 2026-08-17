import { ApplicationidSettingsClient } from '@/features/platform-applications/management/setting/ApplicationidSettingsClient'

export const dynamic = 'force-dynamic'

export default async function ApplicationIdSettingsPage(props: any) {
    const { id } = await props.params

    return <ApplicationidSettingsClient appId={id} />
}