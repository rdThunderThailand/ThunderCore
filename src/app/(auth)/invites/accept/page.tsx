import { AcceptInviteClient } from '@/features/invites/AcceptInviteClient'
import { getInviteDetails } from '@/lib/invites'
import { getCurrentUser, isAxiosError } from '@/lib/thunder-core'
import { InviteDetails } from '@/types/invites'

export const dynamic = 'force-dynamic'

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function AcceptInvitePage(props: PageProps) {
    const searchParams = await props.searchParams
    const token = typeof searchParams.token === 'string' ? searchParams.token : ''

    let invite: InviteDetails | null = null
    let loadError: string | null = null
    if (token) {
        try {
            invite = await getInviteDetails(token)
        } catch (error) {
            loadError = (error as Error).message
        }
    } else {
        loadError = 'This invite link is missing its token.'
    }

    let currentUserEmail: string | null = null
    try {
        const user = await getCurrentUser()
        currentUserEmail = user.email
    } catch (error) {
        // No/expired session — treat as logged out, everything else is a real fault.
        if (!isAxiosError(error) || error.response?.status !== 401) throw error
    }

    return (
        <AcceptInviteClient token={token} invite={invite} loadError={loadError} currentUserEmail={currentUserEmail} />
    )
}
