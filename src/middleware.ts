import { NextResponse, type NextRequest } from 'next/server'

import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE, accessCookieOptions, refreshCookieOptions } from '@/lib/auth-cookies'
import { isDevBypass } from '@/lib/dev'

// ponytail: checks only that the cookie exists, no verify — Thunder_Core verifies on every real call.
// Upgrade to jose verify here only if a route must render sensitive data before its fetch resolves.

const PUBLIC_PATHS = ['/login', '/register', '/register/confirmed']

type RefreshResult =
    | { ok: true; accessToken: string; refreshToken: string; expiresAt: number }
    | { ok: false }

// Access cookie has `expires`, so the browser drops it exactly at expiry. That absence
// (with a surviving refresh cookie) is the whole trigger — no clock maths, and no refresh
// call on requests that already have a valid token.
async function refreshSession(refreshToken: string): Promise<RefreshResult> {
    const baseUrl = process.env.THUNDER_CORE_URL
    const apiKey = process.env.THUNDER_CORE_APP_API_KEY
    if (!baseUrl || !apiKey) return { ok: false }

    try {
        const res = await fetch(`${baseUrl.replace(/\/+$/, '')}/api/core/v1/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
            body: JSON.stringify({ refresh_token: refreshToken }),
        })
        if (!res.ok) return { ok: false }

        const body = await res.json() as { data?: { access_token: string; refresh_token: string; expires_at: number } }
        if (!body.data) return { ok: false }

        return {
            ok: true,
            accessToken: body.data.access_token,
            refreshToken: body.data.refresh_token,
            expiresAt: body.data.expires_at,
        }
    } catch {
        return { ok: false }
    }
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl
    const devBypass = isDevBypass()
    const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value
    const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value
    // '/' is exact-match only — startsWith('/') would make every path public.
    const isPublic = pathname === '/' || PUBLIC_PATHS.some((p) => pathname.startsWith(p))

    if (!devBypass && !accessToken && refreshToken && !isPublic) {
        const result = await refreshSession(refreshToken)

        if (result.ok) {
            const response = NextResponse.next()
            response.cookies.set(ACCESS_TOKEN_COOKIE, result.accessToken, accessCookieOptions(result.expiresAt))
            response.cookies.set(REFRESH_TOKEN_COOKIE, result.refreshToken, refreshCookieOptions())
            return response
        }

        // Expired, revoked, or already-rotated — the only correct move is to send the
        // user back to login with both cookies cleared, not fall through to a stale check.
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        url.searchParams.set('next', pathname)
        const response = NextResponse.redirect(url)
        response.cookies.delete(ACCESS_TOKEN_COOKIE)
        response.cookies.delete(REFRESH_TOKEN_COOKIE)
        return response
    }

    // ponytail: dev-bypass has no real login flow to set tc_access_token, so treat it as an always-valid session.
    const hasSession = devBypass || Boolean(accessToken)

    if (!hasSession && !isPublic) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        url.searchParams.set('next', pathname)
        return NextResponse.redirect(url)
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
