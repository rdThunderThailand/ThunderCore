export interface AuditLog {
    id: string
    action: string
    user_email?: string
    user_id?: string
    target?: string
    ip_address?: string
    status: 'Success' | 'Warning' | 'Critical'
    category: 'Auth' | 'App' | 'Security' | 'User' | 'Tenant'
    details?: string
    created_at: string
}

export interface ApplicationLog {
    id: string
    action: string
    status: 'Success' | 'Warning' | 'Error'
    created_at: string
    user_email?: string
}
