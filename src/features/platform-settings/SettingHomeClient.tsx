import { getUsers } from '@/lib/users'
import { UserRole } from '@/types/auth'
import { SettingsClient } from './settings-clients'

interface SettingHomeClientProps {
    userId?: string
}

export async function SettingHomeClient({ userId }: SettingHomeClientProps) {
    const users = await getUsers()
    
    // Find the user by ID, default to the first user if not found or not specified
    const selectedUser = users.find(u => u.id === userId) || users[0] || {
        id: 'default',
        email: 'default@example.com',
        first_name: 'Default',
        last_name: 'User',
        role: 'User' as UserRole,
        can_invite: false,
        can_create_app: false,
        can_view_logs: false,
        created_at: new Date().toISOString(),
        is_active: true
    }

    return <SettingsClient user={selectedUser} />
}
