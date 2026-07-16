// Legacy types for dashboard compatibility
export type AppStatus = 'Healthy' | 'Warning' | 'Error';
export type AppLoad = 'Low' | 'Normal' | 'High';

export interface AppData {
    id: string;
    name: string;
    org: string;
    users: string; // Keeps consistency with dashboard mock (e.g., '1.2k')
    status: AppStatus;
    load: AppLoad;
}

/**
 * Application entity from the database
 * Used throughout the dashboard for managing applications
 */
export interface Application {
    id: string
    name: string
    description?: string | null
    tenant_id: string | null
    tenant_name?: string | null
    status: 'active' | 'inactive' | 'maintenance'
    environment: 'production' | 'staging' | 'development'
    url?: string | null
    created_at: string
    updated_at: string
    user_count?: number
    is_shared?: boolean
    custom_domain?: string | null
    branding_color?: string
    logo_url?: string | null
    portal_title?: string | null
    portal_description?: string | null
}

/**
 * @deprecated Use Application instead
 * Alias for backwards compatibility
 */
export type SystemApplication = Application

export interface IAppModule {
  id: string;
  name: string;
  description: string;
  category: 'CORE' | 'SYSTEM' | 'ADDON' | 'RECOMMENDED';
  icon: any; // using any for lucide react icon component
  status: 'ACTIVE' | 'INACTIVE' | 'LOCKED';
  href?: string;
  requiredRole?: string[];
}
