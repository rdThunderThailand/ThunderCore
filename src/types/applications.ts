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


export interface Application {
  id: string
  name: string
  description?: string | null
  tenant_id?: string | null
  tenant_name?: string | null
  // is_shared?: boolean
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
  // Present on tenant-scoped listings (see TenantApplicationView) — absent on app-management views.
  relation?: 'owned' | 'granted'
}

export type ApplicationDetails = Application

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
  // memberships.id — the tenant membership this access row grants, used to dedupe against the invite picker.
  membershipId: string
  name: string
  email: string
  role: 'Owner' | 'Admin' | 'Developer' | 'Viewer'
  status: 'Active' | 'Inactive'
  tenantName?: string
}

// Mirrors the `member_app_access` table: membership_id -> memberships.id, application_id -> applications.id.
export interface MemberAppAccessRow {
  id: string
  membership_id: string
  application_id: string
  role: string
  is_active: boolean
  created_at: string
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
