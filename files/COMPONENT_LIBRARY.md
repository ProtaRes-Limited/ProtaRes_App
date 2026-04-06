# COMPONENT LIBRARY - ProtaRes

## Reusable UI Components

---

## 1. BASE UI COMPONENTS

### 1.1 Button

```tsx
// src/components/ui/Button.tsx
import { Pressable, Text, ActivityIndicator, View } from 'react-native';
import { LucideIcon } from 'lucide-react-native';

type ButtonVariant = 'primary' | 'secondary' | 'emergency' | 'success' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-primary-500 active:bg-primary-600',
  secondary: 'bg-white border-2 border-primary-500 active:bg-primary-50',
  emergency: 'bg-emergency-500 active:bg-emergency-600',
  success: 'bg-success-500 active:bg-success-600',
  ghost: 'bg-transparent active:bg-gray-100',
  danger: 'bg-emergency-500 active:bg-emergency-600',
};

const variantTextStyles: Record<ButtonVariant, string> = {
  primary: 'text-white',
  secondary: 'text-primary-500',
  emergency: 'text-white',
  success: 'text-white',
  ghost: 'text-primary-500',
  danger: 'text-white',
};

const sizeStyles: Record<ButtonSize, { button: string; text: string; icon: number }> = {
  sm: { button: 'h-9 px-3', text: 'text-sm', icon: 16 },
  md: { button: 'h-11 px-4', text: 'text-base', icon: 20 },
  lg: { button: 'h-13 px-6', text: 'text-lg', icon: 24 },
  xl: { button: 'h-15 px-8', text: 'text-xl', icon: 28 },
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  onPress,
  disabled = false,
  loading = false,
  icon: Icon,
  iconPosition = 'left',
  fullWidth = false,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      className={`
        flex-row items-center justify-center rounded-lg
        ${variantStyles[variant]}
        ${sizeStyles[size].button}
        ${fullWidth ? 'w-full' : ''}
        ${isDisabled ? 'opacity-50' : ''}
      `}
    >
      {loading ? (
        <ActivityIndicator 
          color={variant === 'secondary' || variant === 'ghost' ? '#005EB8' : '#FFFFFF'} 
        />
      ) : (
        <>
          {Icon && iconPosition === 'left' && (
            <Icon 
              size={sizeStyles[size].icon} 
              color={variant === 'secondary' || variant === 'ghost' ? '#005EB8' : '#FFFFFF'}
              className="mr-2"
            />
          )}
          <Text className={`font-semibold ${variantTextStyles[variant]} ${sizeStyles[size].text}`}>
            {children}
          </Text>
          {Icon && iconPosition === 'right' && (
            <Icon 
              size={sizeStyles[size].icon} 
              color={variant === 'secondary' || variant === 'ghost' ? '#005EB8' : '#FFFFFF'}
              className="ml-2"
            />
          )}
        </>
      )}
    </Pressable>
  );
}
```

### 1.2 Input

```tsx
// src/components/ui/Input.tsx
import { View, TextInput, Text, Pressable } from 'react-native';
import { Eye, EyeOff, AlertCircle } from 'lucide-react-native';
import { useState } from 'react';

interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  helperText?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoComplete?: 'email' | 'password' | 'name' | 'tel' | 'off';
  disabled?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  maxLength?: number;
}

export function Input({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  helperText,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  autoComplete = 'off',
  disabled = false,
  multiline = false,
  numberOfLines = 1,
  maxLength,
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const borderColor = error 
    ? 'border-emergency-500' 
    : isFocused 
      ? 'border-primary-500 border-2' 
      : 'border-gray-300';
  
  return (
    <View className="mb-4">
      {label && (
        <Text className="text-gray-700 font-medium mb-1.5">{label}</Text>
      )}
      
      <View className={`
        flex-row items-center
        bg-white rounded-lg border ${borderColor}
        ${disabled ? 'bg-gray-100' : ''}
      `}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          secureTextEntry={secureTextEntry && !showPassword}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoComplete={autoComplete}
          editable={!disabled}
          multiline={multiline}
          numberOfLines={numberOfLines}
          maxLength={maxLength}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`
            flex-1 px-4 py-3 text-base text-gray-900
            ${multiline ? 'min-h-[100px] text-top' : 'h-12'}
          `}
        />
        
        {secureTextEntry && (
          <Pressable 
            onPress={() => setShowPassword(!showPassword)}
            className="px-3"
          >
            {showPassword ? (
              <EyeOff size={20} color="#6B7280" />
            ) : (
              <Eye size={20} color="#6B7280" />
            )}
          </Pressable>
        )}
        
        {error && (
          <View className="px-3">
            <AlertCircle size={20} color="#DA291C" />
          </View>
        )}
      </View>
      
      {error && (
        <Text className="text-emergency-500 text-sm mt-1">{error}</Text>
      )}
      
      {helperText && !error && (
        <Text className="text-gray-500 text-sm mt-1">{helperText}</Text>
      )}
    </View>
  );
}
```

### 1.3 Card

```tsx
// src/components/ui/Card.tsx
import { View, Pressable } from 'react-native';

type CardVariant = 'default' | 'elevated' | 'outlined' | 'emergency' | 'active';

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  onPress?: () => void;
  className?: string;
}

const variantStyles: Record<CardVariant, string> = {
  default: 'bg-white shadow-md',
  elevated: 'bg-white shadow-lg',
  outlined: 'bg-white border border-gray-200',
  emergency: 'bg-emergency-50 border-2 border-emergency-500 shadow-lg',
  active: 'bg-primary-50 border-2 border-primary-500',
};

export function Card({ 
  children, 
  variant = 'default', 
  onPress,
  className = '',
}: CardProps) {
  const Component = onPress ? Pressable : View;
  
  return (
    <Component
      onPress={onPress}
      className={`
        rounded-xl p-4
        ${variantStyles[variant]}
        ${onPress ? 'active:opacity-90' : ''}
        ${className}
      `}
    >
      {children}
    </Component>
  );
}
```

### 1.4 Badge

```tsx
// src/components/ui/Badge.tsx
import { View, Text } from 'react-native';
import { ResponderTier } from '@/types';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'tier';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  tier?: ResponderTier;
}

const variantStyles: Record<BadgeVariant, { bg: string; text: string }> = {
  default: { bg: 'bg-gray-100', text: 'text-gray-700' },
  success: { bg: 'bg-success-100', text: 'text-success-700' },
  warning: { bg: 'bg-warning-100', text: 'text-warning-700' },
  error: { bg: 'bg-emergency-100', text: 'text-emergency-700' },
  info: { bg: 'bg-primary-100', text: 'text-primary-700' },
  tier: { bg: '', text: '' }, // Handled separately
};

const tierStyles: Record<ResponderTier, { bg: string; text: string }> = {
  tier1_active_healthcare: { bg: 'bg-success-100', text: 'text-success-700' },
  tier2_retired_healthcare: { bg: 'bg-purple-100', text: 'text-purple-700' },
  tier3_first_aid: { bg: 'bg-warning-100', text: 'text-warning-700' },
  tier4_witness: { bg: 'bg-primary-100', text: 'text-primary-700' },
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
};

export function Badge({ label, variant = 'default', size = 'md', tier }: BadgeProps) {
  const styles = variant === 'tier' && tier ? tierStyles[tier] : variantStyles[variant];
  
  return (
    <View className={`rounded-full ${styles.bg} ${sizeStyles[size]}`}>
      <Text className={`font-medium ${styles.text}`}>{label}</Text>
    </View>
  );
}

// Convenience component for tier badges
export function TierBadge({ tier }: { tier: ResponderTier }) {
  const labels: Record<ResponderTier, string> = {
    tier1_active_healthcare: 'Healthcare',
    tier2_retired_healthcare: 'Retired HC',
    tier3_first_aid: 'First Aid',
    tier4_witness: 'Witness',
  };
  
  return <Badge label={labels[tier]} variant="tier" tier={tier} />;
}
```

### 1.5 Avatar

```tsx
// src/components/ui/Avatar.tsx
import { View, Image, Text } from 'react-native';
import { User } from 'lucide-react-native';

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: AvatarSize;
  showOnlineStatus?: boolean;
  isOnline?: boolean;
}

const sizeStyles: Record<AvatarSize, { container: string; text: string; icon: number }> = {
  sm: { container: 'w-8 h-8', text: 'text-sm', icon: 16 },
  md: { container: 'w-10 h-10', text: 'text-base', icon: 20 },
  lg: { container: 'w-14 h-14', text: 'text-xl', icon: 28 },
  xl: { container: 'w-20 h-20', text: 'text-2xl', icon: 40 },
};

export function Avatar({ 
  src, 
  name, 
  size = 'md', 
  showOnlineStatus = false,
  isOnline = false,
}: AvatarProps) {
  const initials = name
    ?.split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  
  return (
    <View className="relative">
      <View className={`
        ${sizeStyles[size].container} 
        rounded-full overflow-hidden 
        bg-primary-100 items-center justify-center
      `}>
        {src ? (
          <Image source={{ uri: src }} className="w-full h-full" />
        ) : initials ? (
          <Text className={`${sizeStyles[size].text} font-semibold text-primary-600`}>
            {initials}
          </Text>
        ) : (
          <User size={sizeStyles[size].icon} color="#005EB8" />
        )}
      </View>
      
      {showOnlineStatus && (
        <View className={`
          absolute bottom-0 right-0 
          w-3 h-3 rounded-full border-2 border-white
          ${isOnline ? 'bg-success-500' : 'bg-gray-400'}
        `} />
      )}
    </View>
  );
}
```

### 1.6 Modal

```tsx
// src/components/ui/Modal.tsx
import { Modal as RNModal, View, Pressable, Text } from 'react-native';
import { X } from 'lucide-react-native';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
  dismissable?: boolean;
}

export function Modal({
  visible,
  onClose,
  title,
  children,
  showCloseButton = true,
  dismissable = true,
}: ModalProps) {
  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={dismissable ? onClose : undefined}
    >
      <Pressable 
        className="flex-1 bg-black/50 justify-center items-center p-4"
        onPress={dismissable ? onClose : undefined}
      >
        <Pressable 
          className="bg-white rounded-2xl w-full max-w-md overflow-hidden"
          onPress={() => {}} // Prevent close when tapping modal content
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
              <Text className="text-lg font-semibold text-gray-900">
                {title}
              </Text>
              {showCloseButton && (
                <Pressable onPress={onClose} className="p-1">
                  <X size={24} color="#6B7280" />
                </Pressable>
              )}
            </View>
          )}
          
          {/* Content */}
          <View className="p-4">
            {children}
          </View>
        </Pressable>
      </Pressable>
    </RNModal>
  );
}
```

---

## 2. FEEDBACK COMPONENTS

### 2.1 Loading Spinner

```tsx
// src/components/ui/LoadingSpinner.tsx
import { View, ActivityIndicator, Text } from 'react-native';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  message?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({
  size = 'large',
  color = '#005EB8',
  message,
  fullScreen = false,
}: LoadingSpinnerProps) {
  const content = (
    <View className="items-center justify-center p-4">
      <ActivityIndicator size={size} color={color} />
      {message && (
        <Text className="text-gray-600 mt-2 text-center">{message}</Text>
      )}
    </View>
  );
  
  if (fullScreen) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        {content}
      </View>
    );
  }
  
  return content;
}
```

### 2.2 Empty State

```tsx
// src/components/ui/EmptyState.tsx
import { View, Text } from 'react-native';
import { LucideIcon, Inbox } from 'lucide-react-native';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center p-8">
      <View className="w-16 h-16 rounded-full bg-gray-100 items-center justify-center mb-4">
        <Icon size={32} color="#9CA3AF" />
      </View>
      
      <Text className="text-xl font-semibold text-gray-900 text-center mb-2">
        {title}
      </Text>
      
      {description && (
        <Text className="text-gray-500 text-center mb-6 max-w-xs">
          {description}
        </Text>
      )}
      
      {actionLabel && onAction && (
        <Button onPress={onAction} variant="primary">
          {actionLabel}
        </Button>
      )}
    </View>
  );
}
```

### 2.3 Error State

```tsx
// src/components/ui/ErrorState.tsx
import { View, Text } from 'react-native';
import { AlertTriangle, RefreshCw } from 'lucide-react-native';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'We couldn\'t load this content. Please try again.',
  onRetry,
}: ErrorStateProps) {
  return (
    <View className="flex-1 items-center justify-center p-8">
      <View className="w-16 h-16 rounded-full bg-emergency-100 items-center justify-center mb-4">
        <AlertTriangle size={32} color="#DA291C" />
      </View>
      
      <Text className="text-xl font-semibold text-gray-900 text-center mb-2">
        {title}
      </Text>
      
      <Text className="text-gray-500 text-center mb-6 max-w-xs">
        {message}
      </Text>
      
      {onRetry && (
        <Button onPress={onRetry} variant="secondary" icon={RefreshCw}>
          Try Again
        </Button>
      )}
    </View>
  );
}
```

### 2.4 Toast

```tsx
// src/components/ui/Toast.tsx
import { View, Text, Animated } from 'react-native';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react-native';
import { useEffect, useRef } from 'react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  visible: boolean;
  type: ToastType;
  message: string;
  duration?: number;
  onHide: () => void;
}

const toastConfig: Record<ToastType, { bg: string; icon: any; iconColor: string }> = {
  success: { bg: 'bg-success-500', icon: CheckCircle, iconColor: '#FFFFFF' },
  error: { bg: 'bg-emergency-500', icon: AlertCircle, iconColor: '#FFFFFF' },
  info: { bg: 'bg-primary-500', icon: Info, iconColor: '#FFFFFF' },
  warning: { bg: 'bg-warning-500', icon: AlertCircle, iconColor: '#FFFFFF' },
};

export function Toast({ visible, type, message, duration = 3000, onHide }: ToastProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const config = toastConfig[type];
  const Icon = config.icon;
  
  useEffect(() => {
    if (visible) {
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
      
      const timer = setTimeout(() => {
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start(() => onHide());
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [visible]);
  
  if (!visible) return null;
  
  return (
    <Animated.View 
      style={{ opacity }}
      className={`
        absolute bottom-24 left-4 right-4
        ${config.bg} rounded-lg p-4
        flex-row items-center
        shadow-lg
      `}
    >
      <Icon size={24} color={config.iconColor} />
      <Text className="flex-1 text-white font-medium ml-3">{message}</Text>
    </Animated.View>
  );
}
```

---

## 3. EMERGENCY-SPECIFIC COMPONENTS

### 3.1 Emergency Alert Card

```tsx
// src/components/emergency/EmergencyAlertCard.tsx
import { View, Text, Vibration } from 'react-native';
import { useEffect } from 'react';
import { 
  Heart, Car, Stethoscope, AlertTriangle, 
  MapPin, Clock, Users, Ambulance 
} from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Emergency } from '@/types';
import { formatDistance, formatDuration } from '@/lib/utils';

interface EmergencyAlertCardProps {
  emergency: Emergency;
  etaSeconds: number;
  distanceMeters: number;
  corridorMatch?: string; // "3 stops ahead on Route 73"
  onAccept: () => void;
  onDecline: () => void;
  timeoutSeconds?: number;
}

const emergencyIcons: Record<string, any> = {
  cardiac_arrest: Heart,
  heart_attack: Heart,
  road_accident: Car,
  pedestrian_incident: Car,
  stroke: Stethoscope,
  default: AlertTriangle,
};

const emergencyLabels: Record<string, string> = {
  cardiac_arrest: 'CARDIAC ARREST',
  heart_attack: 'HEART ATTACK',
  road_accident: 'ROAD ACCIDENT',
  pedestrian_incident: 'PEDESTRIAN INCIDENT',
  stroke: 'STROKE',
  stabbing: 'STABBING',
  default: 'EMERGENCY',
};

export function EmergencyAlertCard({
  emergency,
  etaSeconds,
  distanceMeters,
  corridorMatch,
  onAccept,
  onDecline,
  timeoutSeconds = 60,
}: EmergencyAlertCardProps) {
  const Icon = emergencyIcons[emergency.emergencyType] || emergencyIcons.default;
  const label = emergencyLabels[emergency.emergencyType] || emergencyLabels.default;
  
  // Vibrate on mount
  useEffect(() => {
    Vibration.vibrate([0, 500, 200, 500, 200, 500]);
  }, []);
  
  return (
    <Card variant="emergency" className="mx-4">
      {/* Header */}
      <View className="flex-row items-center mb-4">
        <View className="w-14 h-14 rounded-full bg-emergency-500 items-center justify-center mr-4">
          <Icon size={28} color="#FFFFFF" />
        </View>
        <View className="flex-1">
          <Text className="text-emergency-700 font-bold text-lg">{label}</Text>
          {corridorMatch ? (
            <Text className="text-emergency-600">{corridorMatch}</Text>
          ) : (
            <Text className="text-emergency-600">{formatDistance(distanceMeters)} away</Text>
          )}
        </View>
      </View>
      
      {/* Details */}
      <View className="space-y-2 mb-4">
        <View className="flex-row items-center">
          <MapPin size={16} color="#6B7280" />
          <Text className="text-gray-600 ml-2 flex-1" numberOfLines={1}>
            {emergency.locationAddress || emergency.locationDescription || 'Location shared'}
          </Text>
        </View>
        
        <View className="flex-row items-center">
          <Clock size={16} color="#6B7280" />
          <Text className="text-gray-600 ml-2">
            ETA: {formatDuration(etaSeconds)}
          </Text>
        </View>
        
        {emergency.casualtyCount > 0 && (
          <View className="flex-row items-center">
            <Users size={16} color="#6B7280" />
            <Text className="text-gray-600 ml-2">
              {emergency.casualtyCount} {emergency.casualtyCount === 1 ? 'casualty' : 'casualties'}
            </Text>
          </View>
        )}
        
        {emergency.ambulanceEtaMinutes && (
          <View className="flex-row items-center">
            <Ambulance size={16} color="#6B7280" />
            <Text className="text-gray-600 ml-2">
              Ambulance ETA: {emergency.ambulanceEtaMinutes} mins
            </Text>
          </View>
        )}
      </View>
      
      {/* Actions */}
      <View className="flex-row space-x-3">
        <Button 
          variant="secondary" 
          onPress={onDecline}
          fullWidth
        >
          Decline
        </Button>
        <Button 
          variant="emergency" 
          onPress={onAccept}
          fullWidth
        >
          Accept
        </Button>
      </View>
      
      {/* Timeout indicator */}
      <View className="mt-4 items-center">
        <Text className="text-gray-500 text-sm">
          ⏳ {timeoutSeconds} seconds to respond
        </Text>
      </View>
    </Card>
  );
}
```

### 3.2 Status Stepper

```tsx
// src/components/emergency/StatusStepper.tsx
import { View, Text } from 'react-native';
import { Check } from 'lucide-react-native';
import { ResponseStatus } from '@/types';

interface StatusStepperProps {
  currentStatus: ResponseStatus;
}

const steps: { status: ResponseStatus; label: string }[] = [
  { status: 'accepted', label: 'Accepted' },
  { status: 'en_route', label: 'En Route' },
  { status: 'on_scene', label: 'On Scene' },
  { status: 'completing', label: 'Handover' },
  { status: 'completed', label: 'Complete' },
];

export function StatusStepper({ currentStatus }: StatusStepperProps) {
  const currentIndex = steps.findIndex(s => s.status === currentStatus);
  
  return (
    <View className="flex-row items-center justify-between px-4 py-3 bg-white">
      {steps.map((step, index) => {
        const isComplete = index < currentIndex;
        const isCurrent = index === currentIndex;
        
        return (
          <View key={step.status} className="items-center flex-1">
            {/* Connector line */}
            {index > 0 && (
              <View 
                className={`absolute top-3 right-1/2 h-0.5 w-full -z-10
                  ${isComplete ? 'bg-success-500' : 'bg-gray-200'}
                `} 
              />
            )}
            
            {/* Circle */}
            <View className={`
              w-6 h-6 rounded-full items-center justify-center
              ${isComplete ? 'bg-success-500' : isCurrent ? 'bg-primary-500' : 'bg-gray-200'}
            `}>
              {isComplete ? (
                <Check size={14} color="#FFFFFF" />
              ) : (
                <Text className={`text-xs font-bold ${isCurrent ? 'text-white' : 'text-gray-500'}`}>
                  {index + 1}
                </Text>
              )}
            </View>
            
            {/* Label */}
            <Text className={`text-xs mt-1 text-center
              ${isCurrent ? 'text-primary-600 font-semibold' : 'text-gray-500'}
            `}>
              {step.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
```

### 3.3 Green Badge Display

```tsx
// src/components/credentials/GreenBadgeDisplay.tsx
import { View, Text } from 'react-native';
import { BadgeCheck } from 'lucide-react-native';
import QRCode from 'react-native-qrcode-svg';
import { TierBadge } from '@/components/ui/Badge';
import { GreenBadge } from '@/types';
import { useEffect, useState } from 'react';

interface GreenBadgeDisplayProps {
  badge: GreenBadge;
  onRefresh: () => void;
}

export function GreenBadgeDisplay({ badge, onRefresh }: GreenBadgeDisplayProps) {
  const [timeLeft, setTimeLeft] = useState(60);
  
  useEffect(() => {
    const interval = setInterval(() => {
      const expires = new Date(badge.expiresAt).getTime();
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((expires - now) / 1000));
      
      setTimeLeft(remaining);
      
      if (remaining === 0) {
        onRefresh();
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [badge.expiresAt]);
  
  return (
    <View className="bg-white rounded-2xl p-6 items-center shadow-lg">
      {/* Verified badge */}
      <View className="w-20 h-20 rounded-full bg-success-500 items-center justify-center mb-4">
        <BadgeCheck size={48} color="#FFFFFF" />
      </View>
      
      {/* Name and tier */}
      <Text className="text-xl font-bold text-gray-900 mb-2">{badge.name}</Text>
      <TierBadge tier={badge.tier} />
      
      {/* QR Code */}
      <View className="my-6 p-4 bg-white rounded-lg border border-gray-200">
        <QRCode
          value={badge.qrData}
          size={200}
          backgroundColor="white"
          color="black"
        />
      </View>
      
      {/* Timer */}
      <View className="items-center">
        <Text className="text-gray-600 mb-2">Valid for: {timeLeft} seconds</Text>
        <View className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
          <View 
            className="h-full bg-success-500 rounded-full"
            style={{ width: `${(timeLeft / 60) * 100}%` }}
          />
        </View>
      </View>
      
      {/* Instructions */}
      <Text className="text-gray-500 text-center mt-4 text-sm">
        Show this to emergency services to verify your credentials
      </Text>
    </View>
  );
}
```

---

## 4. LAYOUT COMPONENTS

### 4.1 Screen Wrapper

```tsx
// src/components/layout/Screen.tsx
import { View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ScreenProps {
  children: React.ReactNode;
  scroll?: boolean;
  padded?: boolean;
  safeArea?: boolean;
  keyboardAvoiding?: boolean;
  backgroundColor?: string;
}

export function Screen({
  children,
  scroll = false,
  padded = true,
  safeArea = true,
  keyboardAvoiding = false,
  backgroundColor = 'bg-gray-50',
}: ScreenProps) {
  const Container = safeArea ? SafeAreaView : View;
  const ContentWrapper = scroll ? ScrollView : View;
  
  const content = (
    <ContentWrapper 
      className={`flex-1 ${padded ? 'px-4' : ''}`}
      contentContainerStyle={scroll ? { flexGrow: 1 } : undefined}
      keyboardShouldPersistTaps={scroll ? 'handled' : undefined}
    >
      {children}
    </ContentWrapper>
  );
  
  if (keyboardAvoiding) {
    return (
      <Container className={`flex-1 ${backgroundColor}`}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          {content}
        </KeyboardAvoidingView>
      </Container>
    );
  }
  
  return (
    <Container className={`flex-1 ${backgroundColor}`}>
      {content}
    </Container>
  );
}
```

### 4.2 Header

```tsx
// src/components/layout/Header.tsx
import { View, Text, Pressable } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}

export function Header({ 
  title, 
  showBack = false, 
  onBack,
  rightAction,
}: HeaderProps) {
  const router = useRouter();
  
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };
  
  return (
    <View className="flex-row items-center justify-between h-14 px-4 bg-white border-b border-gray-200">
      {/* Left */}
      <View className="w-12">
        {showBack && (
          <Pressable onPress={handleBack} className="p-2 -ml-2">
            <ChevronLeft size={24} color="#111827" />
          </Pressable>
        )}
      </View>
      
      {/* Title */}
      <Text className="text-lg font-semibold text-gray-900 flex-1 text-center">
        {title}
      </Text>
      
      {/* Right */}
      <View className="w-12 items-end">
        {rightAction}
      </View>
    </View>
  );
}
```

---

*This component library provides the building blocks for the ProtaRes UI.*
