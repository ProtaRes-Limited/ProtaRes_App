# NOTIFICATIONS AND ANALYTICS - ProtaRes

## Push Notifications, SMS, and Analytics

---

## 1. PUSH NOTIFICATION SETUP

### 1.1 Expo Notifications Configuration

```typescript
// src/services/notifications.ts
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { supabase } from './supabase';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    const data = notification.request.content.data;
    
    // Emergency alerts should always show
    if (data?.type === 'emergency_alert') {
      return {
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        priority: Notifications.AndroidNotificationPriority.MAX,
      };
    }
    
    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    };
  },
});

export async function registerForPushNotifications(): Promise<string | null> {
  // Only works on physical devices
  if (!Device.isDevice) {
    console.log('Push notifications require a physical device');
    return null;
  }
  
  // Check existing permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  // Request if not already granted
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    console.log('Push notification permission denied');
    return null;
  }
  
  // Get Expo push token
  const tokenData = await Notifications.getExpoPushTokenAsync({
    projectId: 'your-expo-project-id', // From app.config.js
  });
  
  const token = tokenData.data;
  
  // Store token in database
  await savePushToken(token);
  
  // Android-specific channel setup
  if (Platform.OS === 'android') {
    await setupAndroidChannels();
  }
  
  return token;
}

async function savePushToken(token: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  
  await supabase
    .from('push_tokens')
    .upsert({
      responder_id: user.id,
      token,
      platform: Platform.OS,
      is_active: true,
      last_used_at: new Date().toISOString(),
    }, {
      onConflict: 'responder_id,token',
    });
}

async function setupAndroidChannels() {
  // Emergency channel - highest priority
  await Notifications.setNotificationChannelAsync('emergency', {
    name: 'Emergency Alerts',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 500, 200, 500, 200, 500],
    lightColor: '#DA291C',
    sound: 'emergency_alert.wav',
    bypassDnd: true,
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
  });
  
  // Updates channel - normal priority
  await Notifications.setNotificationChannelAsync('updates', {
    name: 'Updates',
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: 'default',
  });
  
  // Reminders channel
  await Notifications.setNotificationChannelAsync('reminders', {
    name: 'Reminders',
    importance: Notifications.AndroidImportance.LOW,
  });
}
```

### 1.2 Notification Listeners

```typescript
// src/hooks/useNotifications.ts
import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { useEmergencyStore } from '@/stores/emergency';

export function useNotificationListeners() {
  const router = useRouter();
  const addPendingAlert = useEmergencyStore(s => s.addPendingAlert);
  
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();
  
  useEffect(() => {
    // Handle notifications received while app is foregrounded
    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        const data = notification.request.content.data;
        
        if (data?.type === 'emergency_alert' && data?.emergency) {
          // Add to pending alerts for in-app handling
          addPendingAlert(data.emergency);
        }
      }
    );
    
    // Handle notification taps (opens app)
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;
        
        if (data?.type === 'emergency_alert' && data?.emergencyId) {
          // Navigate directly to emergency
          router.push(`/emergency/${data.emergencyId}`);
        }
      }
    );
    
    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);
}
```

---

## 2. NOTIFICATION TYPES

### 2.1 Emergency Alert

```typescript
// Backend: supabase/functions/send-emergency-alert/index.ts

interface EmergencyAlertPayload {
  to: string; // Expo push token
  title: string;
  body: string;
  data: {
    type: 'emergency_alert';
    emergencyId: string;
    emergencyType: string;
    location: { latitude: number; longitude: number };
    etaSeconds: number;
    distanceMeters: number;
    corridorMatch?: string;
  };
  priority: 'high';
  sound: 'emergency_alert.wav';
  channelId: 'emergency';
  ttl: 60; // Expires in 60 seconds
}

const emergencyAlertTemplates = {
  cardiac_arrest: {
    title: '🔴 CARDIAC ARREST',
    body: (data: any) => 
      `Person collapsed ${formatDistance(data.distanceMeters)} away. CPR needed urgently.`,
  },
  road_accident: {
    title: '🚗 ROAD ACCIDENT',
    body: (data: any) => 
      data.corridorMatch 
        ? `${data.corridorMatch}. ${data.casualtyCount} casualties.`
        : `${formatDistance(data.distanceMeters)} away. ${data.casualtyCount} casualties.`,
  },
  stroke: {
    title: '🧠 SUSPECTED STROKE',
    body: (data: any) => 
      `${formatDistance(data.distanceMeters)} away. Time-critical emergency.`,
  },
  default: {
    title: '🚨 EMERGENCY',
    body: (data: any) => 
      `${formatDistance(data.distanceMeters)} away. Your help is needed.`,
  },
};
```

### 2.2 Status Updates

```typescript
const statusUpdateTemplates = {
  responder_en_route: {
    title: 'Responder On The Way',
    body: (data: any) => 
      `${data.responderName} is en route. ETA: ${data.etaMinutes} minutes.`,
  },
  responder_arrived: {
    title: 'Responder Arrived',
    body: (data: any) => 
      `${data.responderName} has arrived on scene.`,
  },
  ambulance_dispatched: {
    title: 'Ambulance Dispatched',
    body: (data: any) => 
      `Ambulance is on the way. ETA: ${data.etaMinutes} minutes.`,
  },
  emergency_resolved: {
    title: 'Emergency Resolved',
    body: 'Thank you for your response. The emergency has been resolved.',
  },
};
```

### 2.3 Credential Reminders

```typescript
const credentialReminders = {
  expiring_soon: {
    title: 'Credential Expiring Soon',
    body: (data: any) => 
      `Your ${data.credentialType} expires in ${data.daysRemaining} days. Please renew to continue responding.`,
  },
  expired: {
    title: 'Credential Expired',
    body: (data: any) => 
      `Your ${data.credentialType} has expired. You've been moved to Tier 4 until renewed.`,
  },
  verification_complete: {
    title: 'Credential Verified ✓',
    body: (data: any) => 
      `Your ${data.credentialType} has been verified. You're now Tier ${data.tier}.`,
  },
};
```

---

## 3. SMS FALLBACK

### 3.1 Twilio Integration

```typescript
// supabase/functions/send-sms-alert/index.ts
import { Twilio } from 'twilio';

const twilioClient = new Twilio(
  Deno.env.get('TWILIO_ACCOUNT_SID'),
  Deno.env.get('TWILIO_AUTH_TOKEN')
);

interface SmsAlertParams {
  to: string;
  emergencyId: string;
  emergencyType: string;
  location: string;
  distance: string;
}

export async function sendSmsAlert(params: SmsAlertParams) {
  const message = `PROTARES ALERT
${formatEmergencyType(params.emergencyType)} at ${params.location}
${params.distance} away
Reply YES to accept
Or open: protares.com/e/${params.emergencyId}`;

  await twilioClient.messages.create({
    body: message,
    from: Deno.env.get('TWILIO_PHONE_NUMBER'),
    to: params.to,
  });
}

// Handle incoming SMS responses
export async function handleIncomingSms(from: string, body: string) {
  const normalizedBody = body.trim().toUpperCase();
  
  // Find the most recent alert for this phone number
  const { data: responder } = await supabase
    .from('responders')
    .select('id')
    .eq('phone', from)
    .single();
  
  if (!responder) return { success: false, message: 'Unknown number' };
  
  const { data: latestAlert } = await supabase
    .from('responses')
    .select('id, emergency_id, status')
    .eq('responder_id', responder.id)
    .eq('status', 'alerted')
    .order('alerted_at', { ascending: false })
    .limit(1)
    .single();
  
  if (!latestAlert) {
    return { success: false, message: 'No pending alert' };
  }
  
  if (normalizedBody === 'YES' || normalizedBody === 'Y') {
    await supabase
      .from('responses')
      .update({ status: 'accepted', accepted_at: new Date().toISOString() })
      .eq('id', latestAlert.id);
    
    return { 
      success: true, 
      reply: 'Alert accepted. Open the app for navigation.' 
    };
  }
  
  if (normalizedBody === 'NO' || normalizedBody === 'N') {
    await supabase
      .from('responses')
      .update({ status: 'declined', declined_at: new Date().toISOString() })
      .eq('id', latestAlert.id);
    
    return { success: true, reply: 'Alert declined.' };
  }
  
  return { 
    success: false, 
    reply: 'Reply YES to accept or NO to decline.' 
  };
}
```

---

## 4. ANALYTICS EVENTS

### 4.1 Event Definitions

```typescript
// src/lib/analytics.ts

export const AnalyticsEvents = {
  // Authentication
  AUTH_SIGN_UP_STARTED: 'auth_sign_up_started',
  AUTH_SIGN_UP_COMPLETED: 'auth_sign_up_completed',
  AUTH_SIGN_IN: 'auth_sign_in',
  AUTH_SIGN_OUT: 'auth_sign_out',
  
  // Onboarding
  ONBOARDING_STARTED: 'onboarding_started',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  ONBOARDING_SKIPPED: 'onboarding_skipped',
  
  // Credentials
  CREDENTIAL_VERIFICATION_STARTED: 'credential_verification_started',
  CREDENTIAL_VERIFICATION_COMPLETED: 'credential_verification_completed',
  CREDENTIAL_VERIFICATION_FAILED: 'credential_verification_failed',
  
  // Availability
  AVAILABILITY_CHANGED: 'availability_changed',
  
  // Emergency Response
  EMERGENCY_ALERT_RECEIVED: 'emergency_alert_received',
  EMERGENCY_ALERT_VIEWED: 'emergency_alert_viewed',
  EMERGENCY_ACCEPTED: 'emergency_accepted',
  EMERGENCY_DECLINED: 'emergency_declined',
  EMERGENCY_TIMED_OUT: 'emergency_timed_out',
  EMERGENCY_ARRIVED_ON_SCENE: 'emergency_arrived_on_scene',
  EMERGENCY_HANDOVER_COMPLETED: 'emergency_handover_completed',
  EMERGENCY_RESPONSE_COMPLETED: 'emergency_response_completed',
  
  // Witness Mode
  WITNESS_EMERGENCY_REPORTED: 'witness_emergency_reported',
  WITNESS_VIDEO_STARTED: 'witness_video_started',
  WITNESS_VIDEO_ENDED: 'witness_video_ended',
  WITNESS_EQUIPMENT_REQUESTED: 'witness_equipment_requested',
  
  // Green Badge
  GREEN_BADGE_VIEWED: 'green_badge_viewed',
  GREEN_BADGE_SCANNED: 'green_badge_scanned',
  
  // Settings
  SETTINGS_CHANGED: 'settings_changed',
  PRIVACY_CONSENT_CHANGED: 'privacy_consent_changed',
  
  // Data Requests
  DATA_EXPORT_REQUESTED: 'data_export_requested',
  ACCOUNT_DELETION_REQUESTED: 'account_deletion_requested',
  
  // Errors
  ERROR_OCCURRED: 'error_occurred',
  API_ERROR: 'api_error',
  LOCATION_ERROR: 'location_error',
} as const;

export type AnalyticsEvent = typeof AnalyticsEvents[keyof typeof AnalyticsEvents];
```

### 4.2 Analytics Service

```typescript
// src/services/analytics.ts
import { AnalyticsEvent, AnalyticsEvents } from '@/lib/analytics';
import * as Sentry from '@sentry/react-native';
import { env } from '@/config/env';

interface EventProperties {
  [key: string]: string | number | boolean | undefined;
}

class AnalyticsService {
  private userId: string | null = null;
  private userProperties: Record<string, any> = {};
  
  setUser(userId: string, properties?: Record<string, any>) {
    this.userId = userId;
    if (properties) {
      this.userProperties = properties;
    }
    
    // Set user in Sentry
    Sentry.setUser({ id: userId, ...properties });
  }
  
  clearUser() {
    this.userId = null;
    this.userProperties = {};
    Sentry.setUser(null);
  }
  
  track(event: AnalyticsEvent, properties?: EventProperties) {
    // Don't track in development
    if (env.app.isDev) {
      console.log('[Analytics]', event, properties);
      return;
    }
    
    const payload = {
      event,
      properties: {
        ...properties,
        timestamp: new Date().toISOString(),
        platform: Platform.OS,
        appVersion: Constants.expoConfig?.version,
      },
      userId: this.userId,
      userProperties: this.userProperties,
    };
    
    // Send to your analytics backend
    // This could be Mixpanel, Amplitude, PostHog, etc.
    this.sendToBackend(payload);
  }
  
  private async sendToBackend(payload: any) {
    try {
      await fetch(`${env.app.apiUrl}/analytics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      // Silently fail - analytics shouldn't break the app
      console.error('Analytics error:', error);
    }
  }
  
  // Convenience methods
  trackEmergencyAlert(emergencyId: string, emergencyType: string, distance: number, eta: number) {
    this.track(AnalyticsEvents.EMERGENCY_ALERT_RECEIVED, {
      emergencyId,
      emergencyType,
      distanceMeters: distance,
      etaSeconds: eta,
    });
  }
  
  trackEmergencyResponse(
    emergencyId: string, 
    action: 'accepted' | 'declined' | 'timed_out',
    responseTimeSeconds?: number
  ) {
    const event = action === 'accepted' 
      ? AnalyticsEvents.EMERGENCY_ACCEPTED
      : action === 'declined'
        ? AnalyticsEvents.EMERGENCY_DECLINED
        : AnalyticsEvents.EMERGENCY_TIMED_OUT;
    
    this.track(event, {
      emergencyId,
      responseTimeSeconds,
    });
  }
  
  trackError(error: Error, context?: Record<string, any>) {
    this.track(AnalyticsEvents.ERROR_OCCURRED, {
      errorMessage: error.message,
      errorStack: error.stack?.substring(0, 500),
      ...context,
    });
    
    // Also report to Sentry
    Sentry.captureException(error, { extra: context });
  }
}

export const analytics = new AnalyticsService();
```

---

## 5. SENTRY ERROR TRACKING

### 5.1 Setup

```typescript
// App.tsx or app/_layout.tsx
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  environment: process.env.EXPO_PUBLIC_APP_ENV,
  enableAutoSessionTracking: true,
  sessionTrackingIntervalMillis: 30000,
  tracesSampleRate: 0.2, // 20% of transactions for performance monitoring
  
  // Filter out PII from error reports
  beforeSend(event) {
    // Remove location data from breadcrumbs
    if (event.breadcrumbs) {
      event.breadcrumbs = event.breadcrumbs.map(breadcrumb => {
        if (breadcrumb.data?.location) {
          delete breadcrumb.data.location;
        }
        return breadcrumb;
      });
    }
    return event;
  },
});
```

### 5.2 Error Boundary

```tsx
// src/components/ErrorBoundary.tsx
import * as Sentry from '@sentry/react-native';
import { View, Text } from 'react-native';
import { Button } from '@/components/ui/Button';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    Sentry.captureException(error, {
      extra: { componentStack: errorInfo.componentStack },
    });
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <View className="flex-1 items-center justify-center p-8">
          <Text className="text-xl font-bold text-gray-900 mb-2">
            Something went wrong
          </Text>
          <Text className="text-gray-500 text-center mb-6">
            We've been notified and are working on a fix.
          </Text>
          <Button 
            onPress={() => this.setState({ hasError: false })}
            variant="primary"
          >
            Try Again
          </Button>
        </View>
      );
    }
    
    return this.props.children;
  }
}
```

---

## 6. DEEP LINKING

### 6.1 URL Scheme Configuration

```typescript
// app.config.js (add to existing config)
export default {
  // ...
  scheme: 'protares',
  
  ios: {
    // ...
    associatedDomains: ['applinks:protares.com'],
  },
  
  android: {
    // ...
    intentFilters: [
      {
        action: 'VIEW',
        autoVerify: true,
        data: [
          {
            scheme: 'https',
            host: 'protares.com',
            pathPrefix: '/e/',
          },
        ],
        category: ['BROWSABLE', 'DEFAULT'],
      },
    ],
  },
};
```

### 6.2 Deep Link Handling

```typescript
// src/hooks/useDeepLinking.ts
import { useEffect } from 'react';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';

export function useDeepLinking() {
  const router = useRouter();
  
  useEffect(() => {
    // Handle deep link when app is opened from a link
    const handleDeepLink = (event: { url: string }) => {
      const { path, queryParams } = Linking.parse(event.url);
      
      if (path?.startsWith('e/')) {
        // Emergency deep link: protares://e/{emergencyId}
        const emergencyId = path.replace('e/', '');
        router.push(`/emergency/${emergencyId}`);
      } else if (path?.startsWith('badge/')) {
        // Badge verification deep link
        const badgeData = path.replace('badge/', '');
        router.push(`/credentials/verify?data=${badgeData}`);
      }
    };
    
    // Handle link that opened the app
    Linking.getInitialURL().then(url => {
      if (url) handleDeepLink({ url });
    });
    
    // Listen for links while app is open
    const subscription = Linking.addEventListener('url', handleDeepLink);
    
    return () => subscription.remove();
  }, []);
}
```

---

## 7. METRICS TO TRACK

### 7.1 Key Performance Indicators

```typescript
// Tracked automatically via analytics events

const kpis = {
  // Response Metrics
  alertAcceptanceRate: 'emergency_accepted / emergency_alert_received',
  averageResponseTime: 'time between alert_received and accepted',
  averageArrivalTime: 'time between accepted and arrived_on_scene',
  completionRate: 'response_completed / emergency_accepted',
  
  // User Engagement
  dailyActiveResponders: 'unique users with availability_changed to available',
  weeklyActiveResponders: 'unique users with any activity in 7 days',
  averageSessionDuration: 'time between app_opened and app_closed',
  
  // Credential Health
  verificationSuccessRate: 'verification_completed / verification_started',
  activeVerifiedResponders: 'users with valid credentials',
  
  // Witness Mode
  witnessReportRate: 'witness_emergency_reported per day',
  videoStreamRate: 'witness_video_started / witness_emergency_reported',
  
  // Technical
  pushDeliveryRate: 'delivered / sent',
  smsFallbackRate: 'sms_sent / push_failed',
  apiErrorRate: 'api_errors / api_calls',
};
```

---

*This document defines the notification system, analytics tracking, and error monitoring for ProtaRes.*
