import { createAdminClient, createClient } from "@/utils/supabase/server";

export async function getTenantId(): Promise<string | null> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;
    
    let tenantId = user.user_metadata?.tenant_id;
    
    if (!tenantId) {
        const adminSupabase = createAdminClient();
        const { data: membership } = await adminSupabase
            .from('memberships')
            .select('tenant_id')
            .eq('user_id', user.id)
            .limit(1)
            .single();
            
        if (membership) {
            tenantId = membership.tenant_id;
        }
    }
    
    return tenantId || null;
}
