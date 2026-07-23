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


// export type ScenarioLevel = 'normal' | 'watch' | 'crisis' | 'lockdown'

// export interface ScenarioMetadata {
//   message?: string
//   affected_areas?: string[]
//   instructions?: string
//   [key: string]: unknown
// }

export interface Application {
  id: string
  name: string
  description?: string | null
  tenant_id?: string | null
  status?: 'active' | 'inactive' | 'maintenance'
  environment?: 'production' | 'staging' | 'development'
  url?: string | null
  created_at: Date
  updated_at: Date
  api_key?: string | null
  api_key_generated_at?: Date | null
  custom_domain?: string | null
  branding_color?: string
  logo_url?: string | null
  portal_title?: string | null
  portal_description?: string | null
  allow_self_registration?: boolean
  // tenant_name?: string | null
  // is_shared?: boolean
}

export type UpdateApplicationDTO = {
  name?: string
  description?: string
  status?: 'active' | 'inactive' | 'maintenance'
  environment?: 'production' | 'staging' | 'development'
  url?: string | null
  custom_domain?: string | null
  logo_url?: string | null
  branding_color?: string
  portal_title?: string | null
  portal_description?: string | null
}


export interface ApplicationTenantsAccess {
  id: string
  tenant_id: string
  tenant_name: string | null
  role: string
  status: string
  started_at: string
  created_at: string
  ended_at: string | null
}

export interface ApplicationTenantAccess {
  appId: string
  tenantId: string
  startsAt?: string
  endsAt?: string
}

export interface AppMember {
  id: string
  name: string
  email: string
  role: 'Admin' | 'Developer' | 'Viewer'
  status: 'Active' | 'Pending'
  tenantName?: string
}


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
