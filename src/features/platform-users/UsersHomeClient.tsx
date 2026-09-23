import { getDevRole } from '@/lib/dev'
import { getUsers } from '@/lib/users'
import { UsersClient } from './users-client'

export async function UsersHomeClient() {
    const users = await getUsers()
    return <UsersClient initialUsers={users} userRole={getDevRole()} />
}
