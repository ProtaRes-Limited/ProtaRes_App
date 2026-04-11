import { QueryClient } from '@tanstack/react-query';

/**
 * React Query client. Defaults tuned for emergency workflows:
 *   • Queries stay fresh for 30s (typical emergency lasts minutes)
 *   • Mutations retry twice on network error (offline queue handles the rest)
 *   • Error state propagates to React Error Boundary so Sentry captures it
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      gcTime: 5 * 60 * 1000,
      retry: (failureCount, error) => {
        // Do not retry on explicit auth errors
        if (error && typeof error === 'object' && 'status' in error) {
          const status = (error as { status?: number }).status;
          if (status === 401 || status === 403) return false;
        }
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: (failureCount) => failureCount < 2,
    },
  },
});
