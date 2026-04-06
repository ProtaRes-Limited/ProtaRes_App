# DESIGN SYSTEM - ProtaRes

## Visual Design Specification

---

## 1. BRAND IDENTITY

### Brand Personality
- **Trustworthy:** Professional, reliable, authoritative
- **Urgent:** Time-critical, action-oriented, decisive
- **Compassionate:** Human-centred, caring, supportive
- **Modern:** Tech-forward, innovative, clean

### Design Principles
1. **Clarity First:** Emergency situations require instant comprehension
2. **High Contrast:** Must be readable in all lighting conditions
3. **Accessible:** WCAG 2.1 AA compliant minimum
4. **Consistent:** Predictable patterns reduce cognitive load
5. **Calm Efficiency:** Professional, not panic-inducing

---

## 2. COLOR PALETTE

### Primary Colors (NHS-Inspired)
```javascript
const colors = {
  primary: {
    50:  '#E6F0F7',
    100: '#CCE1EF',
    200: '#99C3DF',
    300: '#66A5CF',
    400: '#3387BF',
    500: '#005EB8', // NHS Blue - Primary brand color
    600: '#004B93',
    700: '#00386E',
    800: '#002649',
    900: '#001324',
  },
}
```

### Secondary Colors (Action/Status)
```javascript
const colors = {
  // Emergency Red - Critical alerts, urgent actions
  emergency: {
    50:  '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#DA291C', // Primary emergency red
    600: '#B91C1C',
    700: '#991B1B',
    800: '#7F1D1D',
    900: '#450A0A',
  },
  
  // Success Green - Positive confirmations
  success: {
    50:  '#ECFDF5',
    100: '#D1FAE5',
    200: '#A7F3D0',
    300: '#6EE7B7',
    400: '#34D399',
    500: '#009639', // NHS Green
    600: '#047857',
    700: '#065F46',
    800: '#064E3B',
    900: '#022C22',
  },
  
  // Warning Amber - Caution, attention needed
  warning: {
    50:  '#FFFBEB',
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
}
```

### Responder Tier Colors
```javascript
const tierColors = {
  tier1: '#009639', // Active Healthcare - Green
  tier2: '#7B2D8E', // Retired Healthcare - Purple
  tier3: '#F5A623', // First Aid Trained - Yellow/Gold
  tier4: '#005EB8', // Community Witness - Blue
}
```

### Neutral Colors
```javascript
const neutrals = {
  white: '#FFFFFF',
  gray: {
    50:  '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  black: '#000000',
}
```

### Semantic Colors
```javascript
const semantic = {
  background: {
    primary: '#FFFFFF',
    secondary: '#F9FAFB',
    tertiary: '#F3F4F6',
    inverse: '#1F2937',
  },
  text: {
    primary: '#111827',
    secondary: '#4B5563',
    tertiary: '#9CA3AF',
    inverse: '#FFFFFF',
    link: '#005EB8',
  },
  border: {
    light: '#E5E7EB',
    medium: '#D1D5DB',
    dark: '#9CA3AF',
  },
}
```

---

## 3. TYPOGRAPHY

### Font Family
```javascript
const fonts = {
  // Primary: System fonts for performance and native feel
  primary: {
    ios: 'SF Pro Display',
    android: 'Roboto',
    fallback: 'system-ui, -apple-system, sans-serif',
  },
  // Monospace for codes, badges
  mono: {
    ios: 'SF Mono',
    android: 'Roboto Mono',
    fallback: 'monospace',
  },
}
```

### Type Scale
```javascript
const typography = {
  // Display - Hero text, emergency alerts
  display: {
    large: { fontSize: 48, lineHeight: 56, fontWeight: '700' },
    medium: { fontSize: 40, lineHeight: 48, fontWeight: '700' },
    small: { fontSize: 32, lineHeight: 40, fontWeight: '700' },
  },
  
  // Headings
  heading: {
    h1: { fontSize: 28, lineHeight: 36, fontWeight: '700' },
    h2: { fontSize: 24, lineHeight: 32, fontWeight: '600' },
    h3: { fontSize: 20, lineHeight: 28, fontWeight: '600' },
    h4: { fontSize: 18, lineHeight: 26, fontWeight: '600' },
  },
  
  // Body text
  body: {
    large: { fontSize: 18, lineHeight: 28, fontWeight: '400' },
    medium: { fontSize: 16, lineHeight: 24, fontWeight: '400' },
    small: { fontSize: 14, lineHeight: 20, fontWeight: '400' },
  },
  
  // Labels and captions
  label: {
    large: { fontSize: 14, lineHeight: 20, fontWeight: '500' },
    medium: { fontSize: 12, lineHeight: 16, fontWeight: '500' },
    small: { fontSize: 11, lineHeight: 14, fontWeight: '500' },
  },
  
  // Buttons
  button: {
    large: { fontSize: 18, lineHeight: 24, fontWeight: '600' },
    medium: { fontSize: 16, lineHeight: 22, fontWeight: '600' },
    small: { fontSize: 14, lineHeight: 20, fontWeight: '600' },
  },
}
```

---

## 4. SPACING

### Base Unit: 4px
```javascript
const spacing = {
  0: 0,
  0.5: 2,   // 0.5 * 4
  1: 4,     // 1 * 4
  1.5: 6,   // 1.5 * 4
  2: 8,     // 2 * 4
  2.5: 10,  // 2.5 * 4
  3: 12,    // 3 * 4
  3.5: 14,  // 3.5 * 4
  4: 16,    // 4 * 4
  5: 20,    // 5 * 4
  6: 24,    // 6 * 4
  7: 28,    // 7 * 4
  8: 32,    // 8 * 4
  9: 36,    // 9 * 4
  10: 40,   // 10 * 4
  11: 44,   // 11 * 4
  12: 48,   // 12 * 4
  14: 56,   // 14 * 4
  16: 64,   // 16 * 4
  20: 80,   // 20 * 4
  24: 96,   // 24 * 4
  28: 112,  // 28 * 4
  32: 128,  // 32 * 4
}
```

### Common Spacing Patterns
```javascript
const patterns = {
  screenPadding: 16,      // Horizontal padding for screens
  cardPadding: 16,        // Internal card padding
  sectionGap: 24,         // Gap between sections
  itemGap: 12,            // Gap between list items
  inputGap: 16,           // Gap between form inputs
  buttonGap: 12,          // Gap between buttons
}
```

---

## 5. BORDER RADIUS

```javascript
const borderRadius = {
  none: 0,
  sm: 4,      // Small elements, tags
  md: 8,      // Buttons, inputs
  lg: 12,     // Cards
  xl: 16,     // Large cards, modals
  '2xl': 24,  // Bottom sheets
  full: 9999, // Circular (avatars, badges)
}
```

---

## 6. SHADOWS / ELEVATION

```javascript
const shadows = {
  none: 'none',
  
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
  
  // Emergency alert shadow - attention-grabbing
  emergency: {
    shadowColor: '#DA291C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
}
```

---

## 7. COMPONENT STYLES

### Buttons
```javascript
const buttons = {
  // Primary - Main actions
  primary: {
    default: {
      backgroundColor: '#005EB8',
      textColor: '#FFFFFF',
      borderRadius: 8,
    },
    pressed: {
      backgroundColor: '#004B93',
    },
    disabled: {
      backgroundColor: '#E5E7EB',
      textColor: '#9CA3AF',
    },
  },
  
  // Emergency - Critical actions (Accept emergency)
  emergency: {
    default: {
      backgroundColor: '#DA291C',
      textColor: '#FFFFFF',
      borderRadius: 8,
    },
    pressed: {
      backgroundColor: '#B91C1C',
    },
  },
  
  // Success - Positive actions
  success: {
    default: {
      backgroundColor: '#009639',
      textColor: '#FFFFFF',
      borderRadius: 8,
    },
    pressed: {
      backgroundColor: '#047857',
    },
  },
  
  // Secondary - Less prominent actions
  secondary: {
    default: {
      backgroundColor: '#FFFFFF',
      textColor: '#005EB8',
      borderColor: '#005EB8',
      borderWidth: 1.5,
      borderRadius: 8,
    },
    pressed: {
      backgroundColor: '#E6F0F7',
    },
  },
  
  // Ghost - Subtle actions
  ghost: {
    default: {
      backgroundColor: 'transparent',
      textColor: '#005EB8',
    },
    pressed: {
      backgroundColor: '#E6F0F7',
    },
  },
  
  // Sizes
  sizes: {
    sm: { height: 36, paddingHorizontal: 12, fontSize: 14 },
    md: { height: 44, paddingHorizontal: 16, fontSize: 16 },
    lg: { height: 52, paddingHorizontal: 24, fontSize: 18 },
    xl: { height: 60, paddingHorizontal: 32, fontSize: 20 }, // Emergency actions
  },
}
```

### Inputs
```javascript
const inputs = {
  default: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D1D5DB',
    borderWidth: 1,
    borderRadius: 8,
    height: 48,
    paddingHorizontal: 16,
    fontSize: 16,
    textColor: '#111827',
    placeholderColor: '#9CA3AF',
  },
  
  focused: {
    borderColor: '#005EB8',
    borderWidth: 2,
  },
  
  error: {
    borderColor: '#DA291C',
    borderWidth: 2,
  },
  
  disabled: {
    backgroundColor: '#F3F4F6',
    textColor: '#9CA3AF',
  },
}
```

### Cards
```javascript
const cards = {
  // Default card
  default: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadow: 'md',
  },
  
  // Emergency alert card
  emergency: {
    backgroundColor: '#FEF2F2',
    borderColor: '#DA291C',
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    shadow: 'emergency',
  },
  
  // Active/selected card
  active: {
    backgroundColor: '#E6F0F7',
    borderColor: '#005EB8',
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
  },
}
```

### Badges
```javascript
const badges = {
  // Status badges
  status: {
    available: { backgroundColor: '#D1FAE5', textColor: '#065F46' },
    busy: { backgroundColor: '#FEF3C7', textColor: '#92400E' },
    offline: { backgroundColor: '#F3F4F6', textColor: '#4B5563' },
    emergency: { backgroundColor: '#FEE2E2', textColor: '#991B1B' },
  },
  
  // Tier badges
  tier: {
    tier1: { backgroundColor: '#D1FAE5', textColor: '#065F46', label: 'Healthcare' },
    tier2: { backgroundColor: '#F3E8FF', textColor: '#6B21A8', label: 'Retired HC' },
    tier3: { backgroundColor: '#FEF3C7', textColor: '#92400E', label: 'First Aid' },
    tier4: { backgroundColor: '#DBEAFE', textColor: '#1E40AF', label: 'Witness' },
  },
  
  // General
  sizes: {
    sm: { height: 20, paddingHorizontal: 6, fontSize: 11 },
    md: { height: 24, paddingHorizontal: 8, fontSize: 12 },
    lg: { height: 28, paddingHorizontal: 10, fontSize: 14 },
  },
}
```

---

## 8. ICONS

### Recommended Library
**Lucide React Native** - Consistent, clean, MIT licensed

```bash
npm install lucide-react-native react-native-svg
```

### Icon Sizes
```javascript
const iconSizes = {
  xs: 12,   // Inline with small text
  sm: 16,   // List items, small buttons
  md: 20,   // Default, most UI elements
  lg: 24,   // Large buttons, headers
  xl: 32,   // Feature icons
  '2xl': 48, // Empty states, illustrations
}
```

### Common Icons Mapping
```javascript
const iconMap = {
  // Navigation
  home: 'Home',
  alerts: 'Bell',
  map: 'Map',
  history: 'Clock',
  profile: 'User',
  settings: 'Settings',
  
  // Emergency types
  cardiac: 'Heart',
  accident: 'Car',
  medical: 'Stethoscope',
  trauma: 'AlertTriangle',
  
  // Actions
  accept: 'Check',
  decline: 'X',
  call: 'Phone',
  navigate: 'Navigation',
  video: 'Video',
  camera: 'Camera',
  
  // Status
  online: 'Wifi',
  offline: 'WifiOff',
  location: 'MapPin',
  time: 'Clock',
  
  // Credentials
  verified: 'BadgeCheck',
  qrCode: 'QrCode',
}
```

---

## 9. ANIMATIONS

### Duration
```javascript
const duration = {
  instant: 0,
  fast: 150,      // Micro-interactions
  normal: 300,    // Standard transitions
  slow: 500,      // Emphasis animations
  verySlow: 1000, // Loading states
}
```

### Easing
```javascript
const easing = {
  linear: 'linear',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  
  // Spring-like for interactive elements
  spring: { damping: 15, stiffness: 150 },
}
```

### Animation Patterns
```javascript
const animations = {
  // Screen transitions
  screenFadeIn: { opacity: [0, 1], duration: 300 },
  screenSlideUp: { translateY: [50, 0], duration: 300 },
  
  // Emergency pulse (attention)
  emergencyPulse: {
    scale: [1, 1.05, 1],
    duration: 1000,
    repeat: Infinity,
  },
  
  // Button press
  buttonPress: { scale: 0.96, duration: 100 },
  
  // Loading spinner
  spinner: { rotate: [0, 360], duration: 1000, repeat: Infinity },
}
```

---

## 10. ACCESSIBILITY

### Touch Targets
- Minimum touch target: 44x44 points (iOS) / 48x48 dp (Android)
- Spacing between targets: minimum 8 points

### Color Contrast
- Normal text: 4.5:1 minimum contrast ratio
- Large text (18pt+): 3:1 minimum
- UI components: 3:1 minimum
- All emergency alerts: 7:1 (AAA standard)

### Screen Reader
- All images have alt text
- All buttons have accessible labels
- Form inputs have associated labels
- Loading states announced
- Focus management on modals

### Reduced Motion
- Respect `prefers-reduced-motion`
- Provide static alternatives to animations
- No auto-playing animations

---

## 11. DARK MODE (Future)

```javascript
const darkMode = {
  background: {
    primary: '#111827',
    secondary: '#1F2937',
    tertiary: '#374151',
  },
  text: {
    primary: '#F9FAFB',
    secondary: '#D1D5DB',
    tertiary: '#9CA3AF',
  },
  // Colours remain vibrant for emergency visibility
  emergency: '#EF4444', // Brighter red for dark mode
  success: '#10B981',   // Brighter green
  primary: '#3B82F6',   // Brighter blue
}
```

---

## 12. TAILWIND / NATIVEWIND CONFIG

### tailwind.config.js
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary (NHS Blue)
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
        // Emergency Red
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
        // Success Green
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
        // Responder Tiers
        tier: {
          1: '#009639',
          2: '#7B2D8E',
          3: '#F5A623',
          4: '#005EB8',
        },
      },
      fontFamily: {
        sans: ['System'],
        mono: ['SpaceMono'],
      },
      borderRadius: {
        'card': '12px',
        'button': '8px',
        'input': '8px',
        'badge': '9999px',
      },
      spacing: {
        'screen': '16px',
        'card': '16px',
        'section': '24px',
      },
    },
  },
  plugins: [],
}
```

---

## 13. COMPONENT EXAMPLES

### Emergency Alert Card
```tsx
<View className="bg-emergency-50 border-2 border-emergency-500 rounded-card p-4 shadow-lg">
  <View className="flex-row items-center mb-3">
    <View className="w-12 h-12 rounded-full bg-emergency-500 items-center justify-center mr-3">
      <Heart size={24} color="white" />
    </View>
    <View className="flex-1">
      <Text className="text-emergency-700 font-bold text-lg">CARDIAC ARREST</Text>
      <Text className="text-emergency-600 text-sm">3 stops ahead on Route 73</Text>
    </View>
  </View>
  
  <View className="flex-row justify-between items-center mb-4">
    <Text className="text-gray-600">ETA: 4 minutes</Text>
    <Badge variant="tier1" label="You're closest" />
  </View>
  
  <View className="flex-row gap-3">
    <Button variant="secondary" className="flex-1">Decline</Button>
    <Button variant="emergency" className="flex-1">Accept</Button>
  </View>
</View>
```

### Green Badge Display
```tsx
<View className="bg-white rounded-xl p-6 shadow-lg items-center">
  <View className="w-24 h-24 rounded-full bg-success-500 items-center justify-center mb-4">
    <BadgeCheck size={48} color="white" />
  </View>
  
  <Text className="text-xl font-bold text-gray-900 mb-1">Dr. Sarah Johnson</Text>
  <Badge variant="tier1" label="Active Healthcare" />
  
  <View className="my-6">
    <QRCode value={encryptedCredentials} size={200} />
  </View>
  
  <Text className="text-gray-500 text-sm">Valid for 60 seconds</Text>
  <Text className="text-gray-400 text-xs">Scan to verify credentials</Text>
</View>
```

---

*This design system ensures ProtaRes is professional, accessible, and optimized for emergency situations.*
