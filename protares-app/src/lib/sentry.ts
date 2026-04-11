import * as Sentry from '@sentry/react-native';

import { env, isDevelopment, isProduction } from '@/config/env';

/**
 * Sentry initialisation — §13 + §14 of master instructions.
 *
 * Privacy rules we enforce:
 *   • NEVER attach raw coordinates to breadcrumbs (strip before send)
 *   • NEVER attach email / phone to Sentry scope in plain text
 *   • Disable automatic performance traces in dev to keep Metro quiet
 */

const PII_FIELDS = ['latitude', 'longitude', 'email', 'phone', 'password', 'idToken', 'token'];

function scrub<T extends Record<string, unknown> | undefined | null>(data: T): T {
  if (!data || typeof data !== 'object') return data;
  const clean: Record<string, unknown> = { ...data };
  for (const key of Object.keys(clean)) {
    if (PII_FIELDS.includes(key.toLowerCase())) {
      clean[key] = '[redacted]';
    }
  }
  return clean as T;
}

export function initSentry() {
  if (!env.sentry.dsn) {
    if (isDevelopment) {
      console.info('[sentry] DSN not set — error tracking disabled.');
    }
    return;
  }

  Sentry.init({
    dsn: env.sentry.dsn,
    environment: env.appEnv,
    release: `protares@${env.app.version}+${env.app.buildNumber}`,
    debug: !isProduction,
    tracesSampleRate: isProduction ? 0.2 : 0,
    enableAutoSessionTracking: true,
    beforeSend(event) {
      if (event.extra) event.extra = scrub(event.extra);
      if (event.user) {
        // Retain only the opaque Supabase user id — strip email / IP.
        event.user = { id: event.user.id };
      }
      if (event.breadcrumbs) {
        event.breadcrumbs = event.breadcrumbs.map((b) => ({
          ...b,
          data: scrub(b.data),
        }));
      }
      return event;
    },
  });
}

export function captureException(error: unknown, context?: Record<string, unknown>) {
  if (!env.sentry.dsn) {
    if (isDevelopment) console.error('[capture]', error, context);
    return;
  }
  Sentry.captureException(error, {
    extra: scrub(context),
  });
}
