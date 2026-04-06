const requiredEnvVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
] as const;

function validateEnv() {
  const missing = requiredEnvVars.filter(
    key => !import.meta.env[key]
  );

  if (missing.length > 0 && import.meta.env.PROD) {
    console.error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

export const env = {
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key',
  },
  googleMaps: {
    apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  },
  app: {
    env: import.meta.env.VITE_APP_ENV || 'development',
    apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000',
    isDev: import.meta.env.DEV,
    isProd: import.meta.env.PROD,
  },
  features: {
    witnessMode: import.meta.env.VITE_ENABLE_WITNESS_MODE !== 'false',
    smsFallback: import.meta.env.VITE_ENABLE_SMS_FALLBACK !== 'false',
  },
};

validateEnv();
