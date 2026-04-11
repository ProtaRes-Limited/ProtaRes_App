import Constants from 'expo-constants';

/**
 * Environment validation — fail fast on missing public env vars
 * rather than hitting null-pointer crashes deep in services.
 *
 * All client-exposed values must be prefixed `EXPO_PUBLIC_` so Expo
 * injects them into the JS bundle. Server secrets live in Edge Functions.
 */

type AppEnv = 'development' | 'staging' | 'production';

function required(name: string, value: string | undefined): string {
  if (!value || value.trim() === '') {
    // In non-production, log a loud warning but keep the app running so
    // designers can iterate on UI without a full Supabase project.
    const msg = `[env] Missing required variable: ${name}`;
    if (__DEV__) {
      console.warn(msg);
      return '';
    }
    throw new Error(msg);
  }
  return value;
}

function optional(value: string | undefined, fallback = ''): string {
  return value?.trim() ?? fallback;
}

function parseEnv(value: string | undefined, fallback: AppEnv): AppEnv {
  if (value === 'development' || value === 'staging' || value === 'production') {
    return value;
  }
  return fallback;
}

export const env = {
  appEnv: parseEnv(process.env.EXPO_PUBLIC_APP_ENV, 'development'),

  supabase: {
    url: required('EXPO_PUBLIC_SUPABASE_URL', process.env.EXPO_PUBLIC_SUPABASE_URL),
    anonKey: required(
      'EXPO_PUBLIC_SUPABASE_ANON_KEY',
      process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
    ),
  },

  google: {
    webClientId: optional(process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID),
    iosClientId: optional(process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID),
    mapsApiKey: optional(process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY),
  },

  sentry: {
    dsn: optional(process.env.EXPO_PUBLIC_SENTRY_DSN),
  },

  features: {
    witnessMode: process.env.EXPO_PUBLIC_ENABLE_WITNESS_MODE === 'true',
    smsFallback: process.env.EXPO_PUBLIC_ENABLE_SMS_FALLBACK === 'true',
  },

  app: {
    version: Constants.expoConfig?.version ?? '1.0.0',
    buildNumber:
      Constants.expoConfig?.ios?.buildNumber ??
      String(Constants.expoConfig?.android?.versionCode ?? 1),
    apiUrl: optional(process.env.EXPO_PUBLIC_API_URL, 'https://api.protares.com'),
  },
} as const;

export const isProduction = env.appEnv === 'production';
export const isDevelopment = env.appEnv === 'development';
