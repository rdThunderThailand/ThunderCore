import { ApplicationHomeClient } from '@/features/platform-applications/ApplicationHomeClient'

export const dynamic = 'force-dynamic'

export default async function ApplicationsPage(props: any) {
    return <ApplicationHomeClient {...props} />
}
