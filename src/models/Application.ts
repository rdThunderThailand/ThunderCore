// export type ScenarioLevel = 'normal' | 'watch' | 'crisis' | 'lockdown'

// export interface ScenarioMetadata {
//     message?: string
//     affected_areas?: string[]
//     instructions?: string
//     [key: string]: unknown
// }

// export interface Application {
//     id: string
//     name: string
//     description?: string
//     tenant_id: string
//     status: 'active' | 'inactive' | 'maintenance'
//     environment: 'production' | 'staging' | 'development'
//     url?: string
//     created_at: string
//     updated_at: string
//     is_shared?: boolean
//     tenant_name?: string
// }

// export type CreateApplicationDTO = {
//     tenantId: string
//     name: string
//     description?: string
//     environment: 'production' | 'staging' | 'development'
//     url?: string
// }

// export type UpdateApplicationDTO = {
//     name?: string
//     description?: string
//     status?: 'active' | 'inactive' | 'maintenance'
//     environment?: 'production' | 'staging' | 'development'
//     url?: string
// }

// export interface ApplicationDetails extends Application {
//     custom_domain?: string | null
//     branding_color?: string
//     logo_url?: string | null
//     portal_title?: string | null
//     portal_description?: string | null
//     scenario_level?: ScenarioLevel
//     scenario_metadata?: ScenarioMetadata
//     scenario_updated_at?: string | null
// }

// export interface ApplicationMember {
//     id: string
//     user_id: string
//     application_id: string
//     role: 'owner' | 'admin' | 'developer' | 'viewer'
//     status: 'active' | 'pending'
//     created_at: string
//     user?: {
//         id: string
//         email: string
//         full_name?: string
//     }
// }

// export interface SystemApplication extends Application {
//     user_count?: number
//     org_subscriptions_count?: number
// }
