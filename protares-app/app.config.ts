import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'ProtaRes',
  slug: 'protares-app',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  scheme: 'protares',
  newArchEnabled: true,
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#005EB8',
  },
  ios: {
    supportsTablet: false,
    bundleIdentifier: 'com.protares.app',
    infoPlist: {
      NSLocationWhenInUseUsageDescription:
        'ProtaRes needs your location to alert you to nearby emergencies.',
      NSLocationAlwaysAndWhenInUseUsageDescription:
        'ProtaRes needs background location access to alert you to emergencies even when the app is closed.',
      NSCameraUsageDescription:
        'ProtaRes needs camera access for Witness Mode video streaming.',
      NSMicrophoneUsageDescription:
        'ProtaRes needs microphone access for Witness Mode audio.',
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#005EB8',
    },
    package: 'com.protares.app',
    permissions: [
      'ACCESS_COARSE_LOCATION',
      'ACCESS_FINE_LOCATION',
      'ACCESS_BACKGROUND_LOCATION',
      'CAMERA',
      'RECORD_AUDIO',
      'VIBRATE',
    ],
  },
  plugins: [
    'expo-router',
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
        cameraPermission: 'Allow ProtaRes to use your camera for Witness Mode.',
        microphonePermission: 'Allow ProtaRes to use your microphone for Witness Mode.',
        recordAudioAndroid: true,
      },
    ],
    'expo-secure-store',
  ],
  extra: {
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    eas: {
      projectId: process.env.EAS_PROJECT_ID || 'your-eas-project-id',
    },
  },
});
