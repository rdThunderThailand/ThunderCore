'use server'

import * as users from '@/lib/users'

// Server Action boundary for the settings surface — delegates to the src/lib seam.

export async function updateUser(id: string, patch: users.UpdateUserInput) {
    return users.updateUser(id, patch)
}

export async function deleteUser(id: string) {
    return users.deleteUser(id)
}
