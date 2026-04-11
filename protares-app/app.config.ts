import type { ExpoConfig, ConfigContext } from 'expo/config';

/**
 * ProtaRes — Expo dynamic config.
 *
 * CRITICAL (Section 4 of master instructions):
 *   - The `@react-native-google-signin/google-signin` plugin MUST declare
 *     `iosUrlScheme` = reversed iOS OAuth client ID, or iOS crashes
 *     the moment the Google Sign-In button is tapped.
 *   - After editing this file, run `npx expo prebuild --clean` to regenerate
 *     native iOS/Android projects with the new URL schemes.
 */
export default ({ config }: ConfigContext): ExpoConfig => {
  const iosUrlScheme =
    process.env.EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME ??
    'com.googleusercontent.apps.PLACEHOLDER_IOS_CLIENT_ID';

  return {
    ...config,
    name: 'ProtaRes',
    slug: 'protares-app',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    scheme: 'protares',
    newArchEnabled: true,
    platforms: ['ios', 'android'],

    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#005EB8', // NHS Blue
    },

    assetBundlePatterns: ['**/*'],

    ios: {
      supportsTablet: false,
      bundleIdentifier: 'com.protares.app',
      buildNumber: '1',
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        NSLocationWhenInUseUsageDescription:
          'ProtaRes needs your location to alert you to nearby emergencies.',
        NSLocationAlwaysAndWhenInUseUsageDescription:
          'ProtaRes needs background location access to alert you to emergencies even when the app is closed.',
        NSCameraUsageDescription:
          'ProtaRes needs camera access for Witness Mode video streaming to dispatch.',
        NSMicrophoneUsageDescription:
          'ProtaRes needs microphone access for Witness Mode audio relay.',
        NSPhotoLibraryUsageDescription:
          'ProtaRes needs photo library access to save emergency evidence.',
        NSFaceIDUsageDescription:
          'ProtaRes uses Face ID to protect your Green Badge and response history.',
        UIBackgroundModes: ['location', 'fetch', 'remote-notification'],
      },
      config: {
        googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
      },
    },

    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon-foreground.png',
        backgroundColor: '#005EB8', // NHS Blue
      },
      googleServicesFile: './google-services.json',
      package: 'com.protares.app',
      versionCode: 1,
      permissions: [
        'ACCESS_COARSE_LOCATION',
        'ACCESS_FINE_LOCATION',
        'ACCESS_BACKGROUND_LOCATION',
        'CAMERA',
        'RECORD_AUDIO',
        'VIBRATE',
        'POST_NOTIFICATIONS',
        'RECEIVE_BOOT_COMPLETED',
        'FOREGROUND_SERVICE',
        'FOREGROUND_SERVICE_LOCATION',
        'USE_BIOMETRIC',
        'USE_FINGERPRINT',
      ],
      config: {
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
        },
      },
    },

    plugins: [
      'expo-router',
      'expo-secure-store',
      'expo-sqlite',
      [
        'expo-location',
        {
          locationAlwaysAndWhenInUsePermission:
            'Allow ProtaRes to use your location to alert you to nearby emergencies.',
          isAndroidBackgroundLocationEnabled: true,
          isAndroidForegroundServiceEnabled: true,
        },
      ],
      [
        'expo-camera',
        {
          cameraPermission:
            'Allow ProtaRes to use your camera for Witness Mode.',
          microphonePermission:
            'Allow ProtaRes to use your microphone for Witness Mode.',
          recordAudioAndroid: true,
        },
      ],
      [
        'expo-notifications',
        {
          icon: './assets/notification-icon.png',
          color: '#005EB8',
          sounds: ['./assets/sounds/emergency_alert.wav'],
        },
      ],
      [
        'expo-local-authentication',
        {
          faceIDPermission:
            'ProtaRes uses Face ID to protect your Green Badge and credentials.',
        },
      ],
      [
        'expo-build-properties',
        {
          ios: { deploymentTarget: '15.1' },
          android: { compileSdkVersion: 35, targetSdkVersion: 35, minSdkVersion: 24 },
        },
      ],
      [
        '@react-native-google-signin/google-signin',
        {
          // MUST be reversed iOS OAuth client ID from Google Cloud Console.
          // Without this, iOS crashes on Google sign-in button tap.
          iosUrlScheme,
        },
      ],
      [
        '@sentry/react-native/expo',
        {
          organization: 'protares',
          project: 'protares-app',
        },
      ],
    ],

    extra: {
  router: { origin: false },
  eas: {
    projectId: '8a3ab225-22ca-452b-bac9-f6ee745a17f8',
  },
},

    experiments: {
      typedRoutes: true,
    },

    runtimeVersion: {
      policy: 'appVersion',
    },
  };
};
