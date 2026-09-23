// Shared cookie-write options for the Thunder Core session — used by login (Server Action)
// and token refresh (middleware) so the two paths cannot drift apart.

const isProd = process.env.NODE_ENV === 'production'

export const ACCESS_TOKEN_COOKIE = 'tc_access_token'
export const REFRESH_TOKEN_COOKIE = 'tc_refresh_token'

export function accessCookieOptions(expiresAtSeconds: number) {
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax' as const,
    path: '/',
    expires: new Date(expiresAtSeconds * 1000),
  }
}

// Always sliding 30 days on refresh — there is no persisted "remember me" flag to recover
// at refresh time, so every successful refresh promotes the cookie to a 30-day window.
export function refreshCookieOptions() {
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  }
}
