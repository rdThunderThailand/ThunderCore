'use server'

import * as memberApplications from '@/lib/member-applications'
import * as members from '@/lib/members'
import * as tenantApplications from '@/lib/tenant-applications'
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

export async function getMemberDetails(memberId: string, tenantId: string) {
    return members.getMemberDetails(memberId, tenantId)
}

export async function updateMemberProfile(userId: string, data: { first_name: string; last_name: string }) {
    return members.updateMemberProfile(userId, data)
}

export async function getMemberApplications(tenantId: string, memberId: string) {
    return memberApplications.getMemberApplications(tenantId, memberId)
}

export async function assignApplicationToMember(tenantId: string, memberId: string, applicationId: string) {
    return memberApplications.assignApplicationToMember(tenantId, memberId, applicationId)
}

export async function removeApplicationFromMember(tenantId: string, memberId: string, applicationId: string) {
    return memberApplications.removeApplicationFromMember(tenantId, memberId, applicationId)
}

export async function getTenantApplications(tenantId: string) {
    return tenantApplications.getTenantApplications(tenantId)
}
