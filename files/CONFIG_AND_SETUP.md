# CONFIG AND SETUP - ProtaRes

## Environment and Project Configuration

---

## 1. ENVIRONMENT VARIABLES

### 1.1 Required Variables

Create `.env` file in project root:

```bash
# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Google Maps
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-key

# App Configuration
EXPO_PUBLIC_APP_ENV=development  # development | staging | production
EXPO_PUBLIC_API_URL=https://api.protares.com

# Feature Flags
EXPO_PUBLIC_ENABLE_WITNESS_MODE=true
EXPO_PUBLIC_ENABLE_SMS_FALLBACK=true
```

### 1.2 Server-Side Only (for Edge Functions)

```bash
# Supabase Service Role (NEVER expose to client)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Credential Verification APIs
GMC_API_KEY=your-gmc-api-key
GMC_API_URL=https://api.gmc-uk.org/v1
NMC_API_KEY=your-nmc-api-key
NMC_API_URL=https://api.nmc.org.uk/v1

# SMS (Twilio)
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+44xxxxxxxxxx

# Error Tracking
SENTRY_DSN=https://xxx@sentry.io/xxx
SENTRY_AUTH_TOKEN=your-sentry-token

# Email (if using Resend)
RESEND_API_KEY=your-resend-key
```

### 1.3 Environment Config Helper

```typescript
// src/config/env.ts

const requiredEnvVars = [
  'EXPO_PUBLIC_SUPABASE_URL',
  'EXPO_PUBLIC_SUPABASE_ANON_KEY',
  'EXPO_PUBLIC_GOOGLE_MAPS_API_KEY',
] as const;

function validateEnv() {
  const missing = requiredEnvVars.filter(
    key => !process.env[key]
  );
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }
}

export const env = {
  supabase: {
    url: process.env.EXPO_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  },
  googleMaps: {
    apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY!,
  },
  app: {
    env: process.env.EXPO_PUBLIC_APP_ENV || 'development',
    apiUrl: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000',
    isDev: process.env.EXPO_PUBLIC_APP_ENV === 'development',
    isProd: process.env.EXPO_PUBLIC_APP_ENV === 'production',
  },
  features: {
    witnessMode: process.env.EXPO_PUBLIC_ENABLE_WITNESS_MODE === 'true',
    smsFallback: process.env.EXPO_PUBLIC_ENABLE_SMS_FALLBACK === 'true',
  },
};

// Validate on import in non-production
if (process.env.NODE_ENV !== 'production') {
  validateEnv();
}
```

---

## 2. APP CONFIGURATION

### 2.1 app.config.js

```javascript
// app.config.js
export default ({ config }) => ({
  ...config,
  name: 'ProtaRes',
  slug: 'protares',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#005EB8',
  },
  assetBundlePatterns: ['**/*'],
  
  ios: {
    supportsTablet: false,
    bundleIdentifier: 'com.protares.app',
    buildNumber: '1',
    infoPlist: {
      NSLocationWhenInUseUsageDescription: 
        'ProtaRes needs your location to alert you to nearby emergencies.',
      NSLocationAlwaysAndWhenInUseUsageDescription: 
        'ProtaRes needs background location access to alert you to emergencies even when the app is closed.',
      NSCameraUsageDescription: 
        'ProtaRes needs camera access for Witness Mode video streaming.',
      NSMicrophoneUsageDescription: 
        'ProtaRes needs microphone access for Witness Mode audio.',
      UIBackgroundModes: ['location', 'fetch', 'remote-notification'],
    },
    config: {
      googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
    },
  },
  
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#005EB8',
    },
    package: 'com.protares.app',
    versionCode: 1,
    permissions: [
      'ACCESS_COARSE_LOCATION',
      'ACCESS_FINE_LOCATION',
      'ACCESS_BACKGROUND_LOCATION',
      'CAMERA',
      'RECORD_AUDIO',
      'VIBRATE',
      'RECEIVE_BOOT_COMPLETED',
      'FOREGROUND_SERVICE',
    ],
    config: {
      googleMaps: {
        apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
      },
    },
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
    [
      'expo-notifications',
      {
        icon: './assets/notification-icon.png',
        color: '#005EB8',
        sounds: ['./assets/sounds/emergency_alert.wav'],
        mode: 'production',
      },
    ],
    'expo-secure-store',
  ],
  
  extra: {
    eas: {
      projectId: 'your-eas-project-id',
    },
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  },
  
  updates: {
    fallbackToCacheTimeout: 0,
    url: 'https://u.expo.dev/your-project-id',
  },
  
  runtimeVersion: {
    policy: 'sdkVersion',
  },
});
```

### 2.2 eas.json

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": true
      },
      "env": {
        "EXPO_PUBLIC_APP_ENV": "development"
      }
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": false
      },
      "env": {
        "EXPO_PUBLIC_APP_ENV": "staging"
      }
    },
    "production": {
      "distribution": "store",
      "env": {
        "EXPO_PUBLIC_APP_ENV": "production"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@email.com",
        "ascAppId": "your-app-store-connect-app-id"
      },
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json",
        "track": "internal"
      }
    }
  }
}
```

---

## 3. TYPESCRIPT CONFIGURATION

### 3.1 tsconfig.json

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@/components/*": ["src/components/*"],
      "@/hooks/*": ["src/hooks/*"],
      "@/services/*": ["src/services/*"],
      "@/stores/*": ["src/stores/*"],
      "@/types/*": ["src/types/*"],
      "@/lib/*": ["src/lib/*"],
      "@/config/*": ["src/config/*"],
      "@/schemas/*": ["src/schemas/*"]
    }
  },
  "include": [
    "**/*.ts",
    "**/*.tsx",
    ".expo/types/**/*.ts",
    "expo-env.d.ts"
  ],
  "exclude": [
    "node_modules"
  ]
}
```

---

## 4. TAILWIND / NATIVEWIND CONFIGURATION

### 4.1 tailwind.config.js

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#E6F0F7',
          100: '#CCE1EF',
          200: '#99C3DF',
          300: '#66A5CF',
          400: '#3387BF',
          500: '#005EB8',
          600: '#004B93',
          700: '#00386E',
          800: '#002649',
          900: '#001324',
        },
        emergency: {
          50: '#FEF2F2',
          100: '#FEE2E2',
          200: '#FECACA',
          300: '#FCA5A5',
          400: '#F87171',
          500: '#DA291C',
          600: '#B91C1C',
          700: '#991B1B',
          800: '#7F1D1D',
          900: '#450A0A',
        },
        success: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#009639',
          600: '#047857',
          700: '#065F46',
          800: '#064E3B',
          900: '#022C22',
        },
        warning: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#451A03',
        },
      },
      fontFamily: {
        sans: ['System'],
      },
    },
  },
  plugins: [],
};
```

### 4.2 babel.config.js

```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './src',
          },
        },
      ],
      'react-native-reanimated/plugin',
    ],
  };
};
```

### 4.3 metro.config.js

```javascript
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: './global.css' });
```

### 4.4 global.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

## 5. PACKAGE.JSON

### 5.1 Scripts

```json
{
  "scripts": {
    "start": "expo start",
    "dev": "expo start --dev-client",
    "android": "expo run:android",
    "ios": "expo run:ios",
    "web": "expo start --web",
    "build:dev": "eas build --profile development",
    "build:preview": "eas build --profile preview",
    "build:prod": "eas build --profile production",
    "submit:ios": "eas submit -p ios",
    "submit:android": "eas submit -p android",
    "lint": "eslint . --ext .js,.jsx,.ts,.tsx",
    "lint:fix": "eslint . --ext .js,.jsx,.ts,.tsx --fix",
    "typecheck": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch",
    "db:types": "supabase gen types typescript --project-id your-project-id > src/types/database.ts",
    "db:push": "supabase db push",
    "db:reset": "supabase db reset"
  }
}
```

### 5.2 Dependencies

```json
{
  "dependencies": {
    "expo": "~51.0.0",
    "expo-router": "~3.5.0",
    "expo-status-bar": "~1.12.1",
    "expo-location": "~17.0.0",
    "expo-notifications": "~0.28.0",
    "expo-camera": "~15.0.0",
    "expo-av": "~14.0.0",
    "expo-secure-store": "~13.0.0",
    "expo-constants": "~16.0.0",
    "expo-linking": "~6.3.0",
    "expo-device": "~6.0.0",
    
    "react": "18.2.0",
    "react-native": "0.74.0",
    "react-native-screens": "~3.31.0",
    "react-native-safe-area-context": "4.10.1",
    "react-native-gesture-handler": "~2.16.0",
    "react-native-reanimated": "~3.10.0",
    "react-native-maps": "1.14.0",
    "react-native-svg": "15.2.0",
    
    "@supabase/supabase-js": "^2.42.0",
    "@tanstack/react-query": "^5.28.0",
    "zustand": "^4.5.2",
    
    "react-hook-form": "^7.51.0",
    "@hookform/resolvers": "^3.3.4",
    "zod": "^3.22.4",
    
    "nativewind": "^4.0.0",
    "tailwindcss": "^3.4.0",
    
    "lucide-react-native": "^0.358.0",
    "@gorhom/bottom-sheet": "^4.6.0",
    "react-native-qrcode-svg": "^6.2.0",
    
    "date-fns": "^3.3.1",
    "lodash": "^4.17.21",
    
    "@sentry/react-native": "^5.19.0"
  },
  "devDependencies": {
    "@babel/core": "^7.24.0",
    "@types/react": "~18.2.0",
    "@types/lodash": "^4.17.0",
    "typescript": "^5.3.0",
    "eslint": "^8.57.0",
    "eslint-config-expo": "^7.0.0",
    "@typescript-eslint/eslint-plugin": "^7.0.0",
    "@typescript-eslint/parser": "^7.0.0",
    "jest": "^29.7.0",
    "jest-expo": "~51.0.0"
  }
}
```

---

## 6. ESLINT CONFIGURATION

### 6.1 .eslintrc.js

```javascript
module.exports = {
  root: true,
  extends: [
    'expo',
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  rules: {
    // TypeScript
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/explicit-function-return-type': 'off',
    
    // React
    'react/prop-types': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    
    // General
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'prefer-const': 'error',
    'no-var': 'error',
  },
  ignorePatterns: [
    'node_modules/',
    '.expo/',
    'dist/',
    'build/',
  ],
};
```

---

## 7. GIT CONFIGURATION

### 7.1 .gitignore

```gitignore
# Dependencies
node_modules/

# Expo
.expo/
dist/
web-build/

# Native builds
*.orig.*
*.jks
*.p8
*.p12
*.key
*.mobileprovision
*.orig.*
android/
ios/

# Environment
.env
.env.*
!.env.example

# IDE
.idea/
.vscode/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
npm-debug.*
yarn-debug.*
yarn-error.*

# Testing
coverage/

# Build
*.tsbuildinfo

# Supabase
supabase/.branches
supabase/.temp
```

### 7.2 .env.example

```bash
# Copy this file to .env and fill in your values

# Supabase
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=

# Google Maps
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=

# App Configuration
EXPO_PUBLIC_APP_ENV=development
EXPO_PUBLIC_API_URL=

# Feature Flags
EXPO_PUBLIC_ENABLE_WITNESS_MODE=true
EXPO_PUBLIC_ENABLE_SMS_FALLBACK=true
```

---

## 8. SUPABASE CONFIGURATION

### 8.1 supabase/config.toml

```toml
[api]
enabled = true
port = 54321
schemas = ["public"]
extra_search_path = ["public", "extensions"]
max_rows = 1000

[db]
port = 54322
shadow_port = 54320
major_version = 15

[studio]
enabled = true
port = 54323

[auth]
enabled = true
site_url = "exp://localhost:8081"
additional_redirect_urls = ["protares://", "exp://localhost:8081"]
jwt_expiry = 3600
enable_refresh_token_rotation = true
refresh_token_reuse_interval = 10

[auth.email]
enable_signup = true
double_confirm_changes = true
enable_confirmations = true

[auth.sms]
enable_signup = true
enable_confirmations = true

[storage]
enabled = true
```

---

*This document contains all configuration needed to set up a ProtaRes development environment.*
