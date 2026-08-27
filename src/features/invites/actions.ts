'use server'

import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE, accessCookieOptions, refreshCookieOptions } from '@/lib/auth-cookies'
import * as invites from '@/lib/invites'
import { getMyMemberships, isAxiosError, loginRequest, registerRequest } from '@/lib/thunder-core'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { z } from 'zod'

// Server Action boundary for the invite-accept surface — delegates to the src/lib seam.

export async function acceptInvite(token: string) {
    return invites.acceptInvite(token)
}

export type CompleteInviteSignupState = {
    error?: string
    fieldErrors?: { firstName?: string; lastName?: string; password?: string; confirmPassword?: string }
}

const completeSignupSchema = z
    .object({
        token: z.string().min(1),
        email: z.string().email(),
        firstName: z.string().min(1, 'First name is required'),
        lastName: z.string().min(1, 'Last name is required'),
        password: z.string().min(8, 'Must be at least 8 characters'),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    })

// Chains three already-existing, already-verified endpoints (register, login, invites/accept)
// into one submit — the invitee fills in name + password once, instead of registering on a
// separate page, manually logging back in, then having to reopen the invite link to accept.
export async function completeInviteSignup(
    prevState: CompleteInviteSignupState,
    formData: FormData
): Promise<CompleteInviteSignupState> {
    const raw = {
        token: formData.get('token')?.toString() ?? '',
        email: formData.get('email')?.toString() ?? '',
        firstName: formData.get('firstName')?.toString() ?? '',
        lastName: formData.get('lastName')?.toString() ?? '',
        password: formData.get('password')?.toString() ?? '',
        confirmPassword: formData.get('confirmPassword')?.toString() ?? '',
    }

    const parsed = completeSignupSchema.safeParse(raw)
    if (!parsed.success) {
        const { fieldErrors } = parsed.error.flatten()
        return {
            fieldErrors: {
                firstName: fieldErrors.firstName?.[0],
                lastName: fieldErrors.lastName?.[0],
                password: fieldErrors.password?.[0],
                confirmPassword: fieldErrors.confirmPassword?.[0],
            },
        }
    }

    const { token, email, firstName, lastName, password } = parsed.data

    try {
        // Passing the invite token lets the backend bypass the app's generic
        // allow_account_creation gate — a verified pending invite for this email is its own
        // authorization (see thunder_core_API auth/register/route.ts).
        await registerRequest(email, password, { firstName, lastName, inviteToken: token })
    } catch (error) {
        if (isAxiosError(error)) {
            const body = error.response?.data as { error?: string } | undefined
            const message = body?.error ?? ''
            const isDuplicate = error.response?.status === 409 || Boolean(message.toLowerCase().match(/already|exists|duplicate/))
            if (isDuplicate) {
                return { error: 'This email is already registered. Try signing in instead.' }
            }
            if (message.toLowerCase().includes('invite token')) {
                return { error: 'This invite link is no longer valid. Ask whoever invited you to send a new one.' }
            }
        }
        console.error('Invite signup: register failed:', isAxiosError(error) ? (error.response?.data ?? error.message) : error)
        return { error: 'Unable to create your account right now. Please try again.' }
    }

    let session
    try {
        session = await loginRequest(email, password)
    } catch (error) {
        console.error('Invite signup: login-after-register failed:', isAxiosError(error) ? (error.response?.data ?? error.message) : error)
        return { error: 'Your account was created, but signing you in failed. Sign in manually and reopen the invite link to finish joining.' }
    }

    const cookieStore = await cookies()
    cookieStore.set(ACCESS_TOKEN_COOKIE, session.access_token, accessCookieOptions(session.expires_at))
    cookieStore.set(REFRESH_TOKEN_COOKIE, session.refresh_token, refreshCookieOptions())

    let acceptResult
    try {
        acceptResult = await invites.acceptInvite(token)
    } catch (error) {
        console.error('Invite signup: accept failed:', error)
        return {
            error: `Your account was created and you're signed in, but joining the tenant failed: ${(error as Error).message}. Reopen the invite link to try again.`,
        }
    }

    // Only company_admin has a real tenant-scoped dashboard today ((company-admin)/[code]/...,
    // guarded by requireCompanyAdminAccess). Every other tier falls back to the generic
    // /dashboard landing until a dedicated page exists for them. Re-derived from the committed
    // membership (not trusted from the client) so it reflects what actually landed in the DB.
    let redirectPath = '/dashboard'
    try {
        const memberships = await getMyMemberships()
        const joined = memberships.find((m) => m.tenant_id === acceptResult.tenant_id)
        const isCompanyAdmin = joined?.membership_roles.some((r) => r.roles.role_type === 'company_admin') ?? false
        if (isCompanyAdmin) redirectPath = `/${acceptResult.tenant_id}/dashboard`
    } catch (error) {
        console.error('Invite signup: post-accept membership lookup failed, defaulting to /dashboard:', error)
    }

    redirect(redirectPath)
}
