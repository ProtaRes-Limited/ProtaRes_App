import { captureException } from '@/lib/sentry';
import { placeCall, type VoipCall, type VoipCallOptions } from './voip';

/**
 * Tier 3 — Dispatcher voice channel during an active emergency.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 *  DORMANT. Depends on Tier 2 being live. Add:
 *
 *  1. An admin panel operator identity in Twilio (a single pooled identity
 *     like `protares-dispatcher-001`, or per-operator).
 *
 *  2. A TwiML voice handler that routes the responder → dispatcher identity.
 *
 *  3. Server-side call recording (for clinical governance + audit) written
 *     to the `responses.call_recording_url` column (not yet added — see
 *     TODO(tier-3-live) below).
 *
 *  Until live, openDispatcherChannel throws the VoipNotConfiguredError
 *  from voip.ts which the caller surfaces as a friendly message.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const DISPATCHER_IDENTITY = 'protares-dispatcher-primary';

export interface DispatcherChannelOptions {
  /** Active emergency id the responder is responding to. */
  emergencyId: string;
  /** Active response row id. */
  responseId: string;
}

/**
 * Opens a voice channel between the current responder and the on-duty
 * dispatcher. This is a convenience wrapper around placeCall with the
 * dispatcher identity hard-coded, plus metadata so the TwiML side can
 * correlate the call with the specific emergency for recording + routing.
 */
export async function openDispatcherChannel(
  options: DispatcherChannelOptions
): Promise<VoipCall> {
  const callOptions: VoipCallOptions = {
    to: DISPATCHER_IDENTITY,
    metadata: {
      emergency_id: options.emergencyId,
      response_id: options.responseId,
      channel_type: 'dispatcher_voice',
    },
  };

  try {
    return await placeCall(callOptions);
    // TODO(tier-3-live):
    //   - Persist the call start on `responses.dispatcher_call_started_at`
    //   - Register an onDisconnect handler that writes the recording URL
    //     to `responses.dispatcher_call_recording_url` once Twilio POSTs
    //     it back to our webhook.
  } catch (err) {
    captureException(err, {
      context: 'dispatcherChannel.open',
      emergencyId: options.emergencyId,
    });
    throw err;
  }
}
