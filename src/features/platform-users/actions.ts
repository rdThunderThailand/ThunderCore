'use server'

import * as users from '@/lib/users'

// Server Action boundary for the users surface — delegates to the src/lib seam.

export async function deleteUser(id: string) {
    return users.deleteUser(id)
}
