import { ApplicationManagementidPortalDomainsClient } from '@/features/app-registry/management/[id]/portal/domains/ApplicationManagementidPortalDomainsClient'

export const dynamic = 'force-dynamic'

export default async function DomainSettingsPage(props: any) {
    return <ApplicationManagementidPortalDomainsClient {...props} />
}
