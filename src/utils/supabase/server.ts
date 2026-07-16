import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export const createClient = async () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        const missing = [];
        if (!supabaseUrl) missing.push('NEXT_PUBLIC_SUPABASE_URL');
        if (!supabaseAnonKey) missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');

        throw new Error(
            `Missing required environment variables: ${missing.join(', ')}\n` +
            `Please check your .env.local file and ensure these variables are set.`
        );
    }

    const cookieStore = await cookies()
    return createServerClient(
        supabaseUrl,
        supabaseAnonKey,
        {
            cookies:
            {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach((cookie) => {
                            cookieStore.set(cookie)
                        })
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    } catch (error) {
                        // Expected: cookies are read-only in Server Components
                    }
                }
            }
        })
}

export const createAdminClient = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    return createSupabaseClient(supabaseUrl, serviceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        },
        global: {
            fetch: (url, options) => {
                return fetch(url, { ...options, cache: 'no-store' });
            }
        }
    });
}