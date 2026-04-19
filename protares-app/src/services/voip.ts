import { captureException } from '@/lib/sentry';

/**
 * Tier 2 — In-app VoIP calling scaffold.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 *  DORMANT. Activating this requires all of the following:
 *
 *  1. A Twilio account with:
 *     - Account SID                   → env: TWILIO_ACCOUNT_SID
 *     - API Key + API Secret          → env: TWILIO_API_KEY / TWILIO_API_SECRET
 *     - TwiML application SID         → env: TWILIO_TWIML_APP_SID
 *     - At least one purchased number → allocated per responder
 *
 *  2. Install the Twilio Voice React Native SDK:
 *       npm install @twilio/voice-react-native-sdk
 *     (requires a native rebuild)
 *
 *  3. Implement the three methods below (marked TODO) using that SDK.
 *
 *  4. Deploy the `voip-token` Edge Function (stub at supabase/functions/voip-token
 *     — not yet scaffolded). It should mint short-lived Twilio access tokens
 *     scoped to the authenticated responder's identity.
 *
 *  5. Flip the `twilio_voip_calling` feature flag ON in the admin portal.
 *
 * Until all five are done, callers get a clean "not yet available" error
 * rather than a silent failure or a native crash.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export type VoipPlatform = 'twilio' | 'sinch' | 'vonage';

export interface VoipCall {
  id: string;
  remoteParticipant: string;
  status: 'connecting' | 'ringing' | 'active' | 'ended';
  startedAt: number;
}

export interface VoipCallOptions {
  /** The VoIP identity or phone number to dial (e.g. admin dispatcher id). */
  to: string;
  /** Optional context sent to the TwiML app — e.g. active emergency id. */
  metadata?: Record<string, string>;
}

class VoipNotConfiguredError extends Error {
  constructor() {
    super(
      'In-app calling is not yet available. Awaiting Twilio credentials and ' +
        'feature flag activation. Contact your ProtaRes administrator.'
    );
    this.name = 'VoipNotConfiguredError';
  }
}

/**
 * Request a short-lived access token from our backend. When the service
 * goes live, this will hit supabase/functions/voip-token which returns a
 * signed JWT identifying the current responder to Twilio.
 */
export async function fetchVoipAccessToken(): Promise<string> {
  // TODO(tier-2-live): invoke Supabase Edge Function `voip-token` which mints
  // a Twilio AccessToken server-side using TWILIO_API_KEY + TWILIO_API_SECRET.
  throw new VoipNotConfiguredError();
}

/**
 * Register the device for inbound VoIP calls. Call once per session.
 * When live, this uses Voice.register() on the Twilio SDK with the
 * VoIP push token (APNS on iOS, FCM on Android — separate from the
 * regular notification push token).
 */
export async function registerForInboundCalls(): Promise<void> {
  try {
    // TODO(tier-2-live):
    //   const token = await fetchVoipAccessToken();
    //   const voice = new Voice();
    //   const vpToken = await Voice.getDeviceToken();  // VoIP push token
    //   await voice.register(token, vpToken);
    //   voice.on(Voice.Event.CallInvite, handleIncomingCall);
    throw new VoipNotConfiguredError();
  } catch (err) {
    // Feature-flag gate prevents this from being called when not configured,
    // so an error here IS worth reporting — it means live config is broken.
    captureException(err, { context: 'voip.registerForInboundCalls' });
    throw err;
  }
}

/**
 * Place an outbound call. Currently only used by the admin "Call responder"
 * flow — responders don't initiate VoIP calls to other responders.
 */
export async function placeCall(options: VoipCallOptions): Promise<VoipCall> {
  try {
    // TODO(tier-2-live):
    //   const token = await fetchVoipAccessToken();
    //   const voice = new Voice();
    //   const call = await voice.connect(token, {
    //     To: options.to,
    //     ...options.metadata,
    //   });
    //   return wrapCall(call);
    throw new VoipNotConfiguredError();
  } catch (err) {
    captureException(err, { context: 'voip.placeCall', to: options.to });
    throw err;
  }
}

/**
 * Convenience check — UI can call this to show "VoIP not configured" instead
 * of the button, or to disable the button gracefully.
 */
export function isVoipConfigured(): boolean {
  // Once the Twilio SDK is installed, flip this to check SDK availability.
  // Keeping it as a hard false means the call methods above will always throw
  // the not-configured error until someone flips this after plugging in Twilio.
  return false;
}
