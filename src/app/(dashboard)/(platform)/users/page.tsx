import { UsersClient } from '@/features/platform-users/components/users-client'

export const dynamic = 'force-dynamic'

export default async function UsersPage(props: any) {
    return <UsersClient {...props} />
}
