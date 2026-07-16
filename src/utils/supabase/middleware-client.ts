import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export function createMiddlewareClient(request: NextRequest) {
    let supabaseResponse = NextResponse.next({ request })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    // Update request cookies
                    cookiesToSet.forEach(({ name, value }) => {
                        try {
                            request.cookies.set(name, value)
                        } catch (e) {
                            console.error(`[Middleware] Error setting request cookie ${name}:`, e)
                        }
                    })
                    // Rebuild response with updated cookies (for session refresh)
                    supabaseResponse = NextResponse.next({ request })
                    cookiesToSet.forEach(({ name, value, options }) => {
                        try {
                            supabaseResponse.cookies.set(name, value, options)
                        } catch (e) {
                            console.error(`[Middleware] Error setting response cookie ${name}:`, e)
                        }
                    })
                },
            },
        }
    )

    return { supabase, supabaseResponse }
}
