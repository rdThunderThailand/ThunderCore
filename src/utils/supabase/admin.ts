'use server'

import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js'

// Singleton admin client - created once and reused
// Using 'any' for database type since we don't have generated types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let adminClient: SupabaseClient<any> | null = null

/**
 * Get or create a Supabase Admin Client (Service Role)
 * This is a singleton to avoid creating a new client on every request
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getAdminClient(): Promise<SupabaseClient<any>> {
    if (adminClient) {
        return adminClient
    }

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

    if (!serviceRoleKey || !supabaseUrl) {
        throw new Error('Service role configuration missing')
    }

    adminClient = createSupabaseClient(supabaseUrl, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })

    return adminClient
}
