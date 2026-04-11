/**
 * Supabase client — Section 4.5 of master instructions.
 *
 * CRITICAL CONFIGURATION RULES:
 *
 *   1. `detectSessionInUrl: false`
 *      React Native has no browser URL. Setting this true causes the client
 *      to parse the deep link on every launch, leading to white screens and
 *      infinite loops.
 *
 *   2. `storage: localStorage`
 *      We use the `expo-sqlite/localStorage/install` polyfill. SQLite is
 *      backed by the iOS Keychain / Android secure storage and satisfies
 *      NHS DSPT encryption-at-rest for auth tokens — AsyncStorage does not.
 *
 *   3. `autoRefreshToken: true`
 *      Sessions refresh transparently so responders are never logged out
 *      mid-incident.
 *
 *   4. `persistSession: true`
 *      Session survives app kills and cold starts — essential for push
 *      notification → tap → open flow.
 */

// MUST be imported before createClient so `globalThis.localStorage` exists.
import 'expo-sqlite/localStorage/install';
import { createClient } from '@supabase/supabase-js';

import { env } from '@/config/env';
import type { Database } from '@/types/database.types';

export const supabase = createClient<Database>(env.supabase.url, env.supabase.anonKey, {
  auth: {
    storage: globalThis.localStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  global: {
    headers: {
      'x-application-name': 'protares-app',
      'x-application-version': env.app.version,
    },
  },
  db: {
    schema: 'public',
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});
