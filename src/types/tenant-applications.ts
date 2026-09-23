export type TenantApplicationView = {
    id: string
    name: string
    description: string | null
    status: string
    environment: string
    url: string | null
    logo_url?: string | null
    created_at: string
    updated_at: string | null
    relation: 'owned' | 'granted'
    access: null | { role: string; status: string; started_at: string; ended_at: string | null }
}