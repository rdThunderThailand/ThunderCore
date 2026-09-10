'use server'

import * as users from '@/lib/users'

// Server Action boundary for the users surface — delegates to the src/lib seam.

export async function inviteUser(input: users.InviteUserInput) {
    return users.inviteUser(input)
}

export async function deleteUser(id: string) {
    return users.deleteUser(id)
}

export async function updateUserRole(id: string, role: string) {
    return users.updateUserRole(id, role)
}
