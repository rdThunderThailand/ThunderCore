import { NextResponse, type NextRequest } from 'next/server'

import { isDevBypass } from '@/lib/dev'

// ponytail: checks only that the cookie exists, no verify — Thunder_Core verifies on every real call.
// Upgrade to jose verify here only if a route must render sensitive data before its fetch resolves.

const PUBLIC_PATHS = ['/login', '/register', '/register/confirmed']

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl
    // ponytail: dev-bypass has no real login flow to set tc_access_token, so treat it as an always-valid session.
    const hasSession = isDevBypass() || Boolean(request.cookies.get('tc_access_token')?.value)
    // '/' is exact-match only — startsWith('/') would make every path public.
    const isPublic = pathname === '/' || PUBLIC_PATHS.some((p) => pathname.startsWith(p))

    if (!hasSession && !isPublic) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        url.searchParams.set('next', pathname)
        return NextResponse.redirect(url)
    }

    if (hasSession && isPublic) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
