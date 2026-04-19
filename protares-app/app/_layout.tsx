/**
 * Root layout — keeps cold-start as close to native speed as possible.
 *
 *   • Nothing heavy runs at module scope: Sentry, Google Sign-In, and the
 *     background-location task are all deferred. Sentry runs one tick after
 *     first paint (DeferredInit). Google Sign-In configures lazily on the
 *     first sign-in/out call (see src/services/auth.ts). The background task
 *     registers when useLocation first runs (inside (tabs)/_layout.tsx).
 *   • QueryClientProvider wraps the entire navigation tree so every screen
 *     shares a single cache.
 *   • ErrorBoundary is the outermost wrapper so a render-phase crash still
 *     leaves a visible 999 CTA for the responder.
 *   • AuthGate redirects unauthenticated users to /login and prevents
 *     authenticated users from seeing (auth) routes.
 */

import 'react-native-gesture-handler';

import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { Slot, useRouter, useSegments } from 'expo-router';
import { QueryClientProvider } from '@tanstack/react-query';

import { initSentry } from '@/lib/sentry';
import { loadFeatureFlags, subscribeFeatureFlags } from '@/services/featureFlags';
import { queryClient } from '@/lib/queryClient';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import { colors } from '@/config/theme';

// Keep the splash screen visible until we know which route to show.
// Heavy init (Sentry, Google Sign-In, background tasks) is deferred to
// after first paint so cold-start is as close to native speed as possible.
SplashScreen.preventAutoHideAsync().catch(() => {});

function AuthGate({ children }: { children: React.ReactNode }) {
  const { session, initialised, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!initialised) return;

    SplashScreen.hideAsync().catch(() => {});

    const inAuthGroup = segments[0] === '(auth)';

    if (!session && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (session && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [initialised, session, segments, router]);

  if (!initialised || loading) {
    return (
      <View style={styles.loading}>
        <LoadingSpinner label="Starting ProtaRes…" />
      </View>
    );
  }

  return <>{children}</>;
}

/**
 * Kicks off non-critical initialisation one tick after the tree mounts.
 * Runs ~16 ms after first paint — invisible to the user, but moves
 * Sentry + Google Sign-In out of the cold-start blocking path.
 */
function DeferredInit() {
  useEffect(() => {
    const timer = setTimeout(() => {
      initSentry();
      void loadFeatureFlags();
    }, 0);
    const unsubscribe = subscribeFeatureFlags();
    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, []);
  return null;
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={styles.flex}>
        <SafeAreaProvider>
          <QueryClientProvider client={queryClient}>
            <StatusBar style="dark" backgroundColor={colors.background} />
            <DeferredInit />
            <AuthGate>
              <Slot />
            </AuthGate>
          </QueryClientProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
