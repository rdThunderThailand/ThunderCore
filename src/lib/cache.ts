import { unstable_cache } from 'next/cache';
import { SupabaseClient } from '@supabase/supabase-js';

// Cache wrapper for Tenant Data fetching to prevent N+1 DB crashes
export const getCachedTenantData = unstable_cache(
  async (adminClient: SupabaseClient, tenantId: string) => {
    const { data: tenant } = await adminClient
      .from('tenants')
      .select('id, name, type, status')
      .eq('id', tenantId)
      .single();

    const { data: orgMembers } = await adminClient
      .from('memberships')
      .select('id, user_id, joined_at, membership_roles(roles(code))')
      .eq('tenant_id', tenantId);

    let profiles: any[] = [];
    const memberIds = (orgMembers || []).map(m => m.user_id);
    if (memberIds.length > 0) {
      const { data } = await adminClient
        .from('users')
        .select('id, first_name, last_name, email')
        .in('id', memberIds);
      profiles = data || [];
    }

    const { data: ownedApps } = await adminClient
      .from('applications')
      .select('id, name, status')
      .eq('tenant_id', tenantId);

    return { tenant, orgMembers, profiles, ownedApps };
  },
  ['tenant-dashboard-data'],
  {
    revalidate: 60, // Cache for 60 seconds
    tags: ['tenant-data']
  }
);
