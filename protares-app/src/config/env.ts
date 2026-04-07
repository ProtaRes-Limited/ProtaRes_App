export const env = {
  supabase: {
    url: process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key',
  },
  app: {
    env: process.env.EXPO_PUBLIC_APP_ENV || 'development',
    isDev: process.env.EXPO_PUBLIC_APP_ENV === 'development' || !process.env.EXPO_PUBLIC_APP_ENV,
    isProd: process.env.EXPO_PUBLIC_APP_ENV === 'production',
  },
  features: {
    witnessMode: process.env.EXPO_PUBLIC_ENABLE_WITNESS_MODE !== 'false',
    smsFallback: process.env.EXPO_PUBLIC_ENABLE_SMS_FALLBACK !== 'false',
  },
};
