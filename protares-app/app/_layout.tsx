/**
 * Root layout — Section 4.6 of master instructions.
 *
 *   • `GoogleSignin.configure(...)` MUST run once, synchronously, before
 *     any component that might trigger a sign-in renders.
 *   • The QueryClientProvider wraps the entire navigation tree so every
 *     screen shares a single cache.
 *   • The ErrorBoundary is the outermost wrapper so a render-phase crash
 *     still leaves a visible 999 CTA for the responder.
 *   • Navigation guards below redirect unauthenticated users to /login
 *     and prevent authenticated users from visiting (auth) routes.
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
import { GoogleSignin } from '@react-native-google-signin/google-signin';

import { env } from '@/config/env';
import { initSentry } from '@/lib/sentry';
import { queryClient } from '@/lib/queryClient';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import { colors } from '@/config/theme';

// Run these once, module-scope, before any component mounts.
SplashScreen.preventAutoHideAsync().catch(() => {});
initSentry();

// Only configure Google Sign-In if webClientId is available.
// Without it, offlineAccess: true throws a fatal error that kills the app.
if (env.google.webClientId) {
  GoogleSignin.configure({
    webClientId: env.google.webClientId,
    iosClientId: env.google.iosClientId || undefined,
    offlineAccess: true,
    scopes: [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ],
  });
}

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

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={styles.flex}>
        <SafeAreaProvider>
          <QueryClientProvider client={queryClient}>
            <StatusBar style="dark" backgroundColor={colors.background} />
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
