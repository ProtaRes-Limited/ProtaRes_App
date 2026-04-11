/**
 * User-facing error mapping. Master instructions §13 require that NO
 * raw server errors ever surface to a responder during an active
 * emergency. Every caught error goes through this mapper.
 */

import type { PostgrestError } from '@supabase/supabase-js';

interface MappedError {
  title: string;
  message: string;
  /** If true, the UI should show a retry CTA. */
  retryable: boolean;
  /** If true, this is an emergency-critical error — escalate to Sentry. */
  critical: boolean;
}

const GENERIC: MappedError = {
  title: 'Something went wrong',
  message: 'We hit an unexpected problem. Please try again in a moment.',
  retryable: true,
  critical: false,
};

export function mapError(error: unknown): MappedError {
  if (!error) return GENERIC;

  // Native network failures
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    if (msg.includes('network') || msg.includes('fetch')) {
      return {
        title: 'No connection',
        message:
          "We couldn't reach the ProtaRes servers. Check your signal and try again.",
        retryable: true,
        critical: false,
      };
    }
    if (msg.includes('timeout')) {
      return {
        title: 'Connection slow',
        message: 'The server took too long to respond. Please retry.',
        retryable: true,
        critical: false,
      };
    }
  }

  // Supabase auth errors
  if (hasStatusAndMessage(error)) {
    const { status, message } = error;
    if (status === 400 && /invalid login/i.test(message)) {
      return {
        title: 'Sign-in failed',
        message: 'Your email or password is incorrect.',
        retryable: true,
        critical: false,
      };
    }
    if (status === 401) {
      return {
        title: 'Session expired',
        message: 'Please sign in again to continue.',
        retryable: false,
        critical: false,
      };
    }
    if (status === 422 && /already registered/i.test(message)) {
      return {
        title: 'Email already in use',
        message: 'An account with this email already exists. Try signing in.',
        retryable: false,
        critical: false,
      };
    }
    if (status === 429) {
      return {
        title: 'Too many attempts',
        message: 'Please wait a few minutes before trying again.',
        retryable: false,
        critical: false,
      };
    }
    if (status && status >= 500) {
      return {
        title: 'Server issue',
        message: "We're having trouble reaching the ProtaRes service. We've been notified.",
        retryable: true,
        critical: true,
      };
    }
  }

  // Postgrest errors
  if (isPostgrestError(error)) {
    if (error.code === '23505') {
      return {
        title: 'Already exists',
        message: 'A record with this value already exists.',
        retryable: false,
        critical: false,
      };
    }
    if (error.code === '42501') {
      return {
        title: 'Not allowed',
        message: "You don't have permission to perform this action.",
        retryable: false,
        critical: false,
      };
    }
  }

  return GENERIC;
}

function hasStatusAndMessage(
  e: unknown
): e is { status?: number; message: string } {
  return (
    typeof e === 'object' &&
    e !== null &&
    'message' in e &&
    typeof (e as { message: unknown }).message === 'string'
  );
}

function isPostgrestError(e: unknown): e is PostgrestError {
  return (
    typeof e === 'object' &&
    e !== null &&
    'code' in e &&
    'details' in e &&
    'hint' in e
  );
}
