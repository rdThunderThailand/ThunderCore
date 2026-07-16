'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { z } from 'zod'

import { isAxiosError, loginRequest, registerRequest } from '@/lib/thunder-core'

export type LoginState = {
  error?: string
  fieldErrors?: { email?: string; password?: string }
}

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

export async function login(prevState: LoginState, formData: FormData): Promise<LoginState> {
  const email = formData.get('email')?.toString()
  const password = formData.get('password')?.toString()
  const isRemember = formData.get('remember') === 'on'

  const validatedFields = loginSchema.safeParse({ email, password })

  if (!validatedFields.success) {
    const { fieldErrors } = validatedFields.error.flatten()
    return { fieldErrors: { email: fieldErrors.email?.[0], password: fieldErrors.password?.[0] } }
  }

  let session
  try {
    session = await loginRequest(validatedFields.data.email, validatedFields.data.password)
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 401) {
      const body = error.response.data as { error?: string }
      if (body?.error?.includes('invalid email or password')) {
        return { error: 'Invalid credentials. Please check your email and password.' }
      }
    }
    console.error('Login request failed:', isAxiosError(error) ? (error.response?.data ?? error.message) : error)
    return { error: 'Unable to sign in right now. Please try again.' }
  }

  const cookieStore = await cookies()
  const isProd = process.env.NODE_ENV === 'production'

  cookieStore.set('tc_access_token', session.access_token, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    expires: new Date(session.expires_at * 1000),
  })

  cookieStore.set('tc_refresh_token', session.refresh_token, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    // remember checked → persist 30 days; unchecked → session cookie
    ...(isRemember ? { maxAge: 60 * 60 * 24 * 30 } : {}),
  })

  redirect('/dashboard')
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete('tc_access_token')
  cookieStore.delete('tc_refresh_token')
  redirect('/login')
}

export type RegisterState = {
  error?: string
  fieldErrors?: { email?: string; password?: string; consentTerms?: string }
}

export async function registerAccount(prevState: RegisterState, formData: FormData): Promise<RegisterState> {
  const email = formData.get('email')?.toString()
  const password = formData.get('password')?.toString()
  const isConsentGiven = formData.get('consentTerms') === 'on'

  const registerSchema = z.object({
    email: z.string().email('Please enter a valid email'),
    password: z.string().min(8, 'Must be at least 8 characters'),
  })

  const validatedFields = registerSchema.safeParse({ email, password })

  if (!validatedFields.success) {
    const { fieldErrors } = validatedFields.error.flatten()
    return { fieldErrors: { email: fieldErrors.email?.[0], password: fieldErrors.password?.[0] } }
  }

  if (!isConsentGiven) {
    return { fieldErrors: { consentTerms: 'You must read and agree to the Terms & Privacy Policy' } }
  }

  try {
    await registerRequest(validatedFields.data.email, validatedFields.data.password)
  } catch (error) {
    if (isAxiosError(error)) {
      const errorResponse = error.response
      const status = errorResponse?.status
      const body = errorResponse?.data as { error?: string }
      if (status === 409 || body?.error?.toLowerCase().match(/already|exists|duplicate/)) {
        return { error: 'This email is already registered. Try signing in instead.' }
      }
      if (status === 400) {
        return { error: 'Please check your details and try again.' }
      }
    }
    console.error('Register request failed:', isAxiosError(error) ? (error.response?.data ?? error.message) : error)
    return { error: 'Unable to sign up right now. Please try again.' }
  }

  redirect('/register/confirmed')
}
