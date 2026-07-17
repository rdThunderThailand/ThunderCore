'use server'

import * as members from '@/lib/members'
import { GetMembersOptions } from '@/types/members'

// Server Action boundary for the members surface — delegates to the src/lib seam.

export async function getMemberships(tenantId: string, options?: GetMembersOptions) {
    return members.getMemberships(tenantId, options)
}

export async function addMembership(input: { tenantId: string; email: string; role: 'admin' | 'member' }) {
    return members.addMembership(input)
}

export async function removeMembership(memberId: string, tenantId: string) {
    return members.removeMembership(memberId, tenantId)
}

export async function updateMemberRole(memberId: string, tenantId: string, role: 'admin' | 'member') {
    return members.updateMemberRole(memberId, tenantId, role)
}



export async function getMemberDetails() {
    return []
}

export async function updateMemberProfile() {
    return console.log("updateMemberProfile")
}

export async function getMemberApplications() {
    return console.log("getMemberProfile")
}

export async function removeApplicationFromMember() {
    return console.log("removeApplicationFromMember")
}

export async function assignApplicationToMember() {
    return console.log("assignApplicationToMember")
}
