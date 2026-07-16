/**
 * Role constants - avoid magic strings throughout the codebase
 */
export const ROLES = {
    SUPER_ADMIN: 'super_admin',
    COMPANY_ADMIN: 'company_admin',
    OPERATOR: 'operator'
} as const

export type Role = typeof ROLES[keyof typeof ROLES]

/**
 * Tenant member roles
 */
export const ORG_ROLES = {
    OWNER: 'owner',
    ADMIN: 'admin',
    MEMBER: 'member'
} as const

export type OrgRole = typeof ORG_ROLES[keyof typeof ORG_ROLES]

/**
 * Application status constants
 */
export const APP_STATUS = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    MAINTENANCE: 'maintenance'
} as const

export type AppStatus = typeof APP_STATUS[keyof typeof APP_STATUS]

/**
 * Application environment constants
 */
export const APP_ENV = {
    PRODUCTION: 'production',
    STAGING: 'staging',
    DEVELOPMENT: 'development'
} as const

export type AppEnv = typeof APP_ENV[keyof typeof APP_ENV]

/**
 * Tenant status constants
 */
export const ORG_STATUS = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    PENDING: 'pending'
} as const

export type OrgStatus = typeof ORG_STATUS[keyof typeof ORG_STATUS]

/**
 * Tenant type constants
 */
export const ORG_TYPE = {
    ENTERPRISE: 'enterprise',
    BUSINESS: 'business',
    STARTUP: 'startup',
    PERSONAL: 'personal'
} as const

export type OrgType = typeof ORG_TYPE[keyof typeof ORG_TYPE]
