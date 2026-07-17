import { UsersHomeClient } from '@/features/platform-users/UsersHomeClient'

export const dynamic = 'force-dynamic'

export default async function UsersPage() {
    return (
        <UsersHomeClient />
    )
}
