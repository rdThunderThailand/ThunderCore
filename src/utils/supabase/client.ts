import { createBrowserClient } from "@supabase/ssr";

// Get environment variables with validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  const missing = [];
  if (!supabaseUrl) missing.push('NEXT_PUBLIC_SUPABASE_URL');
  if (!supabaseAnonKey) missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');

  // Log strictly to console to see if it appears in terminal
  console.error(`[Supabase Client] Missing env vars: ${missing.join(', ')}`);
  console.error(`[Supabase Client] NODE_ENV: ${process.env.NODE_ENV}`);

  throw new Error(
    `Missing required environment variables: ${missing.join(', ')}\n` +
    `Please check your .env.local file and ensure these variables are set.`
  );
}

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)