import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { captureException } from '@/lib/sentry';
import { colors, radii, spacing, touchTargets, typography } from '@/config/theme';
import { APP_NAME, EMERGENCY_SERVICE_NUMBER } from '@/lib/constants';

interface State {
  hasError: boolean;
  error: Error | null;
}

interface Props {
  children: ReactNode;
}

/**
 * App-wide error boundary.
 *
 * The master instructions say this app must NEVER crash during an active
 * emergency — if React throws, we must still show a visible 999 CTA so
 * the responder can fall back to calling emergency services directly.
 *
 * Error boundaries only catch render-phase errors; async failures are
 * captured via Sentry inside the query client's onError hooks.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    captureException(error, {
      componentStack: info.componentStack,
      source: 'ErrorBoundary',
    });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  private handleCall999 = async () => {
    try {
      await Linking.openURL(`tel:${EMERGENCY_SERVICE_NUMBER}`);
    } catch {
      // no-op — if even the dialer fails, we've exhausted options
    }
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <View style={styles.container} accessible accessibilityRole="alert">
        <View style={styles.card}>
          <Text style={styles.title}>{APP_NAME} hit an unexpected problem</Text>
          <Text style={styles.body}>
            Something went wrong on this screen. You can try again, or if you
            need emergency help right now, call {EMERGENCY_SERVICE_NUMBER}.
          </Text>

          <TouchableOpacity
            style={styles.emergencyButton}
            onPress={this.handleCall999}
            accessibilityRole="button"
            accessibilityLabel={`Call emergency services on ${EMERGENCY_SERVICE_NUMBER}`}
          >
            <Text style={styles.emergencyButtonText}>
              Call {EMERGENCY_SERVICE_NUMBER}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.retryButton}
            onPress={this.handleReset}
            accessibilityRole="button"
            accessibilityLabel="Try again"
          >
            <Text style={styles.retryButtonText}>Try again</Text>
          </TouchableOpacity>

          {__DEV__ && this.state.error && (
            <Text style={styles.devError} selectable>
              {this.state.error.message}
            </Text>
          )}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.xl,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  body: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  emergencyButton: {
    backgroundColor: colors.emergencyRed,
    borderRadius: radii.md,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: touchTargets.emergency,
    marginBottom: spacing.md,
  },
  emergencyButtonText: {
    ...typography.buttonLarge,
    color: colors.textInverse,
  },
  retryButton: {
    backgroundColor: 'transparent',
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: touchTargets.minimum,
    borderWidth: 2,
    borderColor: colors.nhsBlue,
  },
  retryButtonText: {
    ...typography.button,
    color: colors.nhsBlue,
  },
  devError: {
    ...typography.caption,
    color: colors.grey3,
    marginTop: spacing.lg,
    fontFamily: 'monospace',
  },
});
