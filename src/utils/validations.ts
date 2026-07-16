import { z } from 'zod'

/**
 * Validation schemas for server actions
 * Using Zod for runtime type checking and input sanitization
 */

// ==========================================
// Application Schemas
// ==========================================

export const CreateApplicationSchema = z.object({
    name: z.string()
        .min(1, 'Application name is required')
        .max(100, 'Application name must be less than 100 characters')
        .trim(),
    description: z.string()
        .max(500, 'Description must be less than 500 characters')
        .optional()
        .nullable(),
    tenant_id: z.string().uuid('Invalid tenant ID'),
    environment: z.enum(['production', 'staging', 'development']).default('production'),
    url: z.string().url('Invalid URL').optional().nullable().or(z.literal('')),
    status: z.enum(['active', 'inactive', 'maintenance']).default('active')
})

export const UpdateApplicationSchema = CreateApplicationSchema.partial().extend({
    id: z.string().uuid('Invalid application ID')
})

export type CreateApplicationInput = z.infer<typeof CreateApplicationSchema>
export type UpdateApplicationInput = z.infer<typeof UpdateApplicationSchema>

// ==========================================
// Tenant Schemas
// ==========================================

export const CreateTenantSchema = z.object({
    name: z.string()
        .min(1, 'Tenant name is required')
        .max(100, 'Tenant name must be less than 100 characters')
        .trim(),
    type: z.enum(['enterprise', 'business', 'startup', 'personal']).default('business'),
    status: z.enum(['active', 'inactive', 'pending']).default('active'),
    contact_email: z.string().email('Invalid email address').optional().nullable(),
    website_url: z.string().url('Invalid website URL').optional().nullable().or(z.literal('')),
    description: z.string().max(1000, 'Description must be less than 1000 characters').optional().nullable()
})

export const UpdateTenantSchema = CreateTenantSchema.partial().extend({
    id: z.string().uuid('Invalid tenant ID')
})

export type CreateTenantInput = z.infer<typeof CreateTenantSchema>
export type UpdateTenantInput = z.infer<typeof UpdateTenantSchema>

// ==========================================
// User Schemas
// ==========================================

export const CreateUserSchema = z.object({
    email: z.string().email('Invalid email address'),
    first_name: z.string().max(50).optional(),
    last_name: z.string().max(50).optional(),
    role: z.enum(['super_admin', 'company_admin', 'operator']).default('operator'),
    status: z.enum(['active', 'inactive', 'pending']).default('pending')
})

export const UpdateUserSchema = CreateUserSchema.partial().extend({
    id: z.string().uuid('Invalid user ID')
})

export type CreateUserInput = z.infer<typeof CreateUserSchema>
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>

// ==========================================
// Tenant Member Schemas
// ==========================================

export const AddMemberSchema = z.object({
    tenant_id: z.string().uuid('Invalid tenant ID'),
    user_id: z.string().uuid('Invalid user ID'),
    role: z.enum(['owner', 'admin', 'member']).default('member')
})

export const UpdateMemberRoleSchema = z.object({
    tenant_id: z.string().uuid('Invalid tenant ID'),
    user_id: z.string().uuid('Invalid user ID'),
    role: z.enum(['owner', 'admin', 'member'])
})

// ==========================================
// Helper function to validate input
// ==========================================

/**
 * Validate input against a Zod schema with proper error formatting
 * 
 * @example
 * ```typescript
 * const data = validateInput(CreateApplicationSchema, {
 *     name: 'My App',
 *     tenant_id: '...'
 * })
 * ```
 */
export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): T {
    const result = schema.safeParse(data)

    if (!result.success) {
        const errors = result.error.issues.map((e: z.ZodIssue) => `${e.path.join('.')}: ${e.message}`).join(', ')
        throw new Error(`Validation failed: ${errors}`)
    }

    return result.data
}
