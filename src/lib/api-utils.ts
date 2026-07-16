import { UserRole } from '@/types'
import { getAdminClient } from '@/utils/supabase/admin'
import { getUserRole } from '@/utils/supabase/rbac'
import { createClient, SupabaseClient, User } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export type ApiAuth = {
    supabase: SupabaseClient
    user: User
    role: UserRole
    adminClient: SupabaseClient
}

/**
 * Authenticate an API request using the Bearer token from the Authorization header.
 * Returns a Supabase client authenticated as the user, plus user info and role.
 */
export async function getApiAuth(request: Request): Promise<ApiAuth> {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
        throw new Error('Unauthorized')
    }

    const token = authHeader.replace('Bearer ', '')

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

    // Create a Supabase client with the user's JWT token
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        global: {
            headers: { Authorization: `Bearer ${token}` }
        },
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        }
    })

    // Verify the token by getting the user
    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (error || !user) {
        throw new Error('Unauthorized')
    }

    const role = await getUserRole(supabase, user)
    const adminClient = await getAdminClient()

    return { supabase, user, role, adminClient }
}

/**
 * Machine-to-machine gate: require a valid application api_key via the `x-api-key` header.
 * External apps (e.g. cityzen) register in app-registry, generate a key, and send it on
 * every call. Returns the calling application. Throws 'Unauthorized' → 401.
 */
export async function requireAppKey(request: Request): Promise<{ id: string; name: string }> {
    const key = request.headers.get('x-api-key')
    if (!key) {
        throw new Error('Unauthorized: missing app API key')
    }

    const admin = await getAdminClient()
    const { data, error } = await admin
        .from('applications')
        .select('id, name, status')
        .eq('api_key', key)
        .maybeSingle()

    if (error || !data || data.status !== 'active') {
        throw new Error('Unauthorized: invalid app API key')
    }
    return { id: data.id, name: data.name }
}

/**
 * Wraps an API handler function with consistent JSON error responses.
 */
export async function apiHandler<T>(
    action: () => Promise<T>,
    successStatus = 200
): Promise<NextResponse> {
    try {
        const result = await action()
        return NextResponse.json(result ?? { success: true }, { status: successStatus })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        const message = error?.message || 'Internal server error'

        if (message.includes('Unauthorized') || message.includes('Not authenticated')) {
            return NextResponse.json({ error: message }, { status: 401 })
        }
        if (message.includes('Permission denied') || message.includes('Forbidden') || message.includes('Only Super Admins')) {
            return NextResponse.json({ error: message }, { status: 403 })
        }
        if (message.includes('not found') || message.includes('Not found')) {
            return NextResponse.json({ error: message }, { status: 404 })
        }
        if (message.includes('already') || message.includes('Already')) {
            return NextResponse.json({ error: message }, { status: 409 })
        }
        if (message.includes('Invalid') || message.includes('Validation') || message.includes('required')) {
            return NextResponse.json({ error: message }, { status: 400 })
        }

        console.error('API Error:', error)
        return NextResponse.json({ error: message }, { status: 500 })
    }
}

/**
 * Extract route params from Next.js dynamic segments.
 */
export type RouteContext<T extends Record<string, string>> = {
    params: Promise<T>
}

/**
 * Helper: require super_admin role or throw.
 */
export function requireSuperAdmin(role: UserRole) {
    if (role !== 'super_admin') {
        throw new Error('Permission denied. Only Super Admins can perform this action.')
    }
}
