import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
const serviceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY as string;

// Standard client — used for auth (admin login)
export const supabase = createClient(url, anonKey);

// Admin client — bypasses RLS, used for all data queries after login
export const adminSupabase = createClient(url, serviceKey || anonKey, {
  auth: { persistSession: false },
});
