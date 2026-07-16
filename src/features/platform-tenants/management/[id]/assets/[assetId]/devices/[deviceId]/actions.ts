'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

async function getSupabase() {
    const cookieStore = await cookies()
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch {
                        // The `setAll` method was called from a Server Component.
                    }
                },
            },
        }
    )
}

export async function updateDevice(
    tenantId: string,
    deviceId: string,
    data: {
        mac_address?: string
        screen_ratio?: string
        screen_dimension?: string
        app_version?: string
        ip_address?: string
    }
) {
    const supabase = await getSupabase()

    // Separate direct columns from metadata
    const { mac_address, ...metadata } = data

    const { error } = await supabase
        .from('devices')
        .update({
            mac_address: mac_address,
            metadata: metadata, // This replaces existing metadata, which is acceptable for this simple form
            updated_at: new Date().toISOString()
        })
        .eq('id', deviceId)
        .eq('tenant_id', tenantId)

    if (error) {
        console.error('Error updating device:', error)
        throw new Error(error.message || 'Failed to update device')
    }

    revalidatePath(`/dashboard/tenants/management/${tenantId}/assets`)
    return { success: true }
}
