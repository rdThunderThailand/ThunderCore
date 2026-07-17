import { ApplicationManagementidSettingsClient } from '@/features/applications/management/[id]/settings/ApplicationManagementidSettingsClient'

export const dynamic = 'force-dynamic'

export default async function ApplicationSettingsPage(props: any) {
    return <ApplicationManagementidSettingsClient {...props} />
}
