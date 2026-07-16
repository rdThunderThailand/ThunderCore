/**
 * Shared Validation Schemas
 * 
 * Centralized Zod schemas for input validation across all server actions.
 * Use these to validate user input before processing.
 */

import { z } from 'zod'

// ============================================
// Common Primitives
// ============================================

export const UUIDSchema = z.string().uuid('Invalid ID format')

export const PaginationSchema = z.object({
    page: z.number().int().positive().default(1),
    limit: z.number().int().positive().max(100).default(10),
})

export const SearchSchema = z.object({
    query: z.string().trim().max(200).optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
})

// ============================================
// Tenant Schemas
// ============================================

export const TenantTypeSchema = z.enum([
    'enterprise',
    'business',
    'startup',
    'government',
    'non_profit'
])

export const TenantStatusSchema = z.enum([
    'active',
    'suspended',
    'archived',
])

export const CreateTenantSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, 'Tenant name is required')
        .max(100, 'Tenant name must be 100 characters or less'),
    type: TenantTypeSchema,
    status: TenantStatusSchema.optional().default('active'),
})

export const UpdateTenantSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1)
        .max(100)
        .optional(),
    type: TenantTypeSchema.optional(),
    status: TenantStatusSchema.optional(),
    contact_email: z.string().email('Invalid email address').optional().nullable(),
    website_url: z.string().url('Invalid website URL').optional().nullable().or(z.literal('')),
    description: z.string().max(1000, 'Description must be less than 1000 characters').optional().nullable()
})

// ============================================
// Application Schemas
// ============================================

export const ApplicationEnvironmentSchema = z.enum([
    'production',
    'staging',
    'development'
])

export const ApplicationStatusSchema = z.enum([
    'active',
    'inactive',
    'maintenance'
])

export const CreateApplicationSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, 'Application name is required')
        .max(100, 'Application name must be 100 characters or less'),
    description: z
        .string()
        .trim()
        .max(500, 'Description must be 500 characters or less')
        .optional(),
    environment: ApplicationEnvironmentSchema.default('production'),
    url: z
        .string()
        .url('Must be a valid URL')
        .optional()
        .or(z.literal('')),
})

export const UpdateApplicationSchema = z.object({
    name: z.string().trim().min(1).max(100).optional(),
    description: z.string().trim().max(500).optional(),
    environment: ApplicationEnvironmentSchema.optional(),
    url: z.string().url().optional().or(z.literal('')),
    status: ApplicationStatusSchema.optional(),
})

// ============================================
// User Schemas
// ============================================

export const UserRoleSchema = z.enum([
    'super_admin',
    'company_admin',
    'operator'
])

export const UserStatusSchema = z.enum([
    'active',
    'inactive',
    'pending'
])

export const UpdateUserSchema = z.object({
    role: UserRoleSchema.optional(),
    status: UserStatusSchema.optional(),
    is_active: z.boolean().optional(),
})

export const UpdateProfileSchema = z.object({
    first_name: z
        .string()
        .trim()
        .min(1, 'First name is required')
        .max(50, 'First name must be 50 characters or less'),
    last_name: z
        .string()
        .trim()
        .min(1, 'Last name is required')
        .max(50, 'Last name must be 50 characters or less'),
})

// ============================================
// Member Schemas
// ============================================

export const MemberRoleSchema = z.enum([
    'owner',
    'admin',
    'member'
])

export const MemberStatusSchema = z.enum([
    'active',
    'inactive',
    'invited'
])

export const InviteMemberSchema = z.object({
    email: z.string().email('Invalid email address'),
    role: MemberRoleSchema.default('member'),
})

export const UpdateMemberSchema = z.object({
    role: MemberRoleSchema.optional(),
    status: MemberStatusSchema.optional(),
})

// ============================================
// Utility Types
// ============================================

export type CreateTenantInput = z.infer<typeof CreateTenantSchema>
export type UpdateTenantInput = z.infer<typeof UpdateTenantSchema>
export type CreateApplicationInput = z.infer<typeof CreateApplicationSchema>
export type UpdateApplicationInput = z.infer<typeof UpdateApplicationSchema>
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>
export type InviteMemberInput = z.infer<typeof InviteMemberSchema>
export type UpdateMemberInput = z.infer<typeof UpdateMemberSchema>
