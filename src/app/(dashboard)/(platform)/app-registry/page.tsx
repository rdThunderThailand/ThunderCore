import { ApplicationHomeClient } from '@/features/app-registry/ApplicationHomeClient'

export const dynamic = 'force-dynamic'

export default async function ApplicationsPage(props: any) {
    return <ApplicationHomeClient {...props} />
}
