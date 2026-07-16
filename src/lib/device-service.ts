import { SignJWT } from 'jose'

const JWT_SECRET = process.env.SUPABASE_JWT_SECRET || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!JWT_SECRET) {
  console.warn('JWT_SECRET is not defined. Token signing will fail.')
}

export async function signDeviceToken(payload: {
  tenant_id: string
  player_id: string
  user_id?: string
}) {
  const secret = new TextEncoder().encode(JWT_SECRET)
  const alg = 'HS256'

  return new SignJWT(payload)
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime('1h') // Token valid for 1 hour
    .sign(secret)
}

export async function sendHeartbeat(token: string) {
  const response = await fetch('/api/player/heartbeat', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error(`Heartbeat failed: ${response.statusText}`)
  }

  return response.json()
}
