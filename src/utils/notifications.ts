import { createClient } from '@supabase/supabase-js'

type NotificationType = 'info' | 'warning' | 'error' | 'success'

interface CreateNotificationParams {
    userId?: string // If undefined, it will be a system-wide notification (conceptually, or we can enforce specific user IDs)
    title: string
    message: string
    type: NotificationType
    link?: string
}

export async function createNotification(params: CreateNotificationParams) {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey) {
        console.error('Missing SUPABASE_SERVICE_ROLE_KEY, cannot send notification')
        return
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (!supabaseUrl) {
        console.error('Missing NEXT_PUBLIC_SUPABASE_URL, cannot send notification')
        return
    }

    const supabaseAdmin = createClient(
        supabaseUrl,
        serviceRoleKey,
        { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { error } = await supabaseAdmin
        .from('notifications')
        .insert({
            user_id: params.userId || null, // Null = System wide/Admin broadcast? Or we might loop if we want to send to all admins.
            // For now, let's treat NULL as "Visible to everyone/Admins".
            title: params.title,
            message: params.message,
            type: params.type,
            link: params.link
        })

    if (error) {
        console.error('Error creating notification:', error)
    }
}
