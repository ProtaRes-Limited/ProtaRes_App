# FORMS AND VALIDATION - ProtaRes

## Zod Schemas and Form Handling

---

## 1. VALIDATION SETUP

### 1.1 Dependencies

```bash
npm install zod react-hook-form @hookform/resolvers
```

### 1.2 Base Configuration

```typescript
// src/lib/validation.ts
import { z } from 'zod';

// Custom error messages
const customErrorMap: z.ZodErrorMap = (issue, ctx) => {
  if (issue.code === z.ZodIssueCode.invalid_type) {
    if (issue.expected === 'string') {
      return { message: 'This field is required' };
    }
  }
  return { message: ctx.defaultError };
};

z.setErrorMap(customErrorMap);

export { z };
```

---

## 2. AUTHENTICATION SCHEMAS

### 2.1 Login

```typescript
// src/schemas/auth.ts
import { z } from '@/lib/validation';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
```

### 2.2 Registration

```typescript
export const registerSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters')
    .regex(/^[a-zA-Z\s\-']+$/, 'First name can only contain letters, spaces, hyphens, and apostrophes'),
  
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters')
    .regex(/^[a-zA-Z\s\-']+$/, 'Last name can only contain letters, spaces, hyphens, and apostrophes'),
  
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .regex(/^(\+44|0)[0-9]{10,11}$/, 'Please enter a valid UK phone number'),
  
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  
  confirmPassword: z
    .string()
    .min(1, 'Please confirm your password'),
  
  acceptTerms: z
    .boolean()
    .refine(val => val === true, 'You must accept the terms and conditions'),
  
  acceptPrivacy: z
    .boolean()
    .refine(val => val === true, 'You must accept the privacy policy'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type RegisterFormData = z.infer<typeof registerSchema>;
```

### 2.3 Phone Verification

```typescript
export const phoneVerificationSchema = z.object({
  code: z
    .string()
    .length(6, 'Verification code must be 6 digits')
    .regex(/^[0-9]+$/, 'Verification code must contain only numbers'),
});

export type PhoneVerificationFormData = z.infer<typeof phoneVerificationSchema>;
```

### 2.4 Forgot Password

```typescript
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
});

export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  
  confirmPassword: z
    .string()
    .min(1, 'Please confirm your password'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
```

---

## 3. CREDENTIAL SCHEMAS

### 3.1 GMC Verification

```typescript
// src/schemas/credentials.ts
import { z } from '@/lib/validation';

export const gmcVerificationSchema = z.object({
  gmcNumber: z
    .string()
    .min(1, 'GMC number is required')
    .regex(/^[0-9]{7}$/, 'GMC number must be exactly 7 digits'),
  
  fullName: z
    .string()
    .min(1, 'Full name is required')
    .min(5, 'Please enter your full name as registered with the GMC'),
  
  consent: z
    .boolean()
    .refine(val => val === true, 'You must consent to credential verification'),
});

export type GMCVerificationFormData = z.infer<typeof gmcVerificationSchema>;
```

### 3.2 NMC Verification

```typescript
export const nmcVerificationSchema = z.object({
  nmcPin: z
    .string()
    .min(1, 'NMC PIN is required')
    .regex(/^[0-9]{2}[A-Z][0-9]{4}[A-Z]$/, 'Please enter a valid NMC PIN (e.g., 12A3456B)'),
  
  fullName: z
    .string()
    .min(1, 'Full name is required')
    .min(5, 'Please enter your full name as registered with the NMC'),
  
  consent: z
    .boolean()
    .refine(val => val === true, 'You must consent to credential verification'),
});

export type NMCVerificationFormData = z.infer<typeof nmcVerificationSchema>;
```

### 3.3 First Aid Certificate

```typescript
export const firstAidCertificateSchema = z.object({
  certificateType: z.enum([
    'st_john_ambulance',
    'british_red_cross',
    'hse_first_aid_at_work',
    'other',
  ], {
    required_error: 'Please select a certificate type',
  }),
  
  certificateNumber: z
    .string()
    .optional(),
  
  issueDate: z
    .string()
    .min(1, 'Issue date is required')
    .refine(val => {
      const date = new Date(val);
      return !isNaN(date.getTime());
    }, 'Please enter a valid date'),
  
  expiryDate: z
    .string()
    .min(1, 'Expiry date is required')
    .refine(val => {
      const date = new Date(val);
      return !isNaN(date.getTime()) && date > new Date();
    }, 'Certificate must not be expired'),
  
  documentUri: z
    .string()
    .min(1, 'Please upload a photo of your certificate'),
});

export type FirstAidCertificateFormData = z.infer<typeof firstAidCertificateSchema>;
```

---

## 4. PROFILE SCHEMAS

### 4.1 Profile Update

```typescript
// src/schemas/profile.ts
import { z } from '@/lib/validation';

export const profileUpdateSchema = z.object({
  firstName: z
    .string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters')
    .optional(),
  
  lastName: z
    .string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters')
    .optional(),
  
  phone: z
    .string()
    .regex(/^(\+44|0)[0-9]{10,11}$/, 'Please enter a valid UK phone number')
    .optional(),
  
  alertRadiusKm: z
    .number()
    .min(1, 'Minimum radius is 1 km')
    .max(20, 'Maximum radius is 20 km')
    .optional(),
});

export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;
```

### 4.2 Settings

```typescript
export const notificationSettingsSchema = z.object({
  pushEnabled: z.boolean(),
  smsFallbackEnabled: z.boolean(),
  soundEnabled: z.boolean(),
  vibrationEnabled: z.boolean(),
});

export const privacySettingsSchema = z.object({
  locationConsent: z.boolean(),
  analyticsConsent: z.boolean(),
  marketingConsent: z.boolean(),
  researchConsent: z.boolean(),
});

export type NotificationSettingsFormData = z.infer<typeof notificationSettingsSchema>;
export type PrivacySettingsFormData = z.infer<typeof privacySettingsSchema>;
```

---

## 5. EMERGENCY SCHEMAS

### 5.1 Report Emergency

```typescript
// src/schemas/emergency.ts
import { z } from '@/lib/validation';

export const reportEmergencySchema = z.object({
  emergencyType: z.enum([
    'cardiac_arrest',
    'heart_attack',
    'road_accident',
    'pedestrian_incident',
    'cyclist_incident',
    'stroke',
    'diabetic_emergency',
    'anaphylaxis',
    'seizure',
    'breathing_difficulty',
    'stabbing',
    'assault',
    'serious_fall',
    'choking',
    'drowning',
    'burn',
    'electrocution',
    'overdose',
    'other_medical',
    'other_trauma',
  ], {
    required_error: 'Please select an emergency type',
  }),
  
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
  
  locationDescription: z
    .string()
    .max(200, 'Description must be less than 200 characters')
    .optional(),
  
  casualtyCount: z
    .number()
    .min(1, 'At least 1 casualty')
    .max(99, 'Please contact 999 for mass casualty incidents')
    .default(1),
  
  casualtiesConscious: z
    .boolean()
    .optional(),
  
  casualtiesBreathing: z
    .boolean()
    .optional(),
  
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
});

export type ReportEmergencyFormData = z.infer<typeof reportEmergencySchema>;
```

### 5.2 Response Actions

```typescript
export const responseActionsSchema = z.object({
  interventions: z.array(z.enum([
    'cpr_started',
    'aed_applied',
    'aed_shock_delivered',
    'bleeding_controlled',
    'tourniquet_applied',
    'wound_packed',
    'recovery_position',
    'airway_cleared',
    'spinal_immobilisation',
    'medication_given',
  ])),
  
  equipmentUsed: z.array(z.enum([
    'aed',
    'trauma_kit',
    'burn_kit',
    'naloxone_kit',
    'basic_medical_kit',
  ])).optional(),
  
  notes: z
    .string()
    .max(1000, 'Notes must be less than 1000 characters')
    .optional(),
});

export type ResponseActionsFormData = z.infer<typeof responseActionsSchema>;
```

### 5.3 Handover

```typescript
export const handoverSchema = z.object({
  handoverTo: z.enum([
    'ambulance',
    'police',
    'fire',
    'family',
    'other',
  ], {
    required_error: 'Please select who you handed over to',
  }),
  
  patientConscious: z.boolean(),
  patientBreathing: z.boolean(),
  
  interventionsSummary: z
    .string()
    .min(10, 'Please provide a brief summary of interventions')
    .max(500, 'Summary must be less than 500 characters'),
  
  additionalNotes: z
    .string()
    .max(500, 'Notes must be less than 500 characters')
    .optional(),
});

export type HandoverFormData = z.infer<typeof handoverSchema>;
```

---

## 6. FORM COMPONENTS

### 6.1 Form Controller Wrapper

```tsx
// src/components/forms/FormField.tsx
import { View, Text } from 'react-native';
import { Controller, Control, FieldValues, Path } from 'react-hook-form';
import { Input } from '@/components/ui/Input';

interface FormFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  multiline?: boolean;
  numberOfLines?: number;
}

export function FormField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  multiline,
  numberOfLines,
}: FormFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <Input
          label={label}
          placeholder={placeholder}
          value={value}
          onChangeText={onChange}
          onBlur={onBlur}
          error={error?.message}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          multiline={multiline}
          numberOfLines={numberOfLines}
        />
      )}
    />
  );
}
```

### 6.2 Checkbox Field

```tsx
// src/components/forms/CheckboxField.tsx
import { View, Text, Pressable } from 'react-native';
import { Controller, Control, FieldValues, Path } from 'react-hook-form';
import { Check } from 'lucide-react-native';

interface CheckboxFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string | React.ReactNode;
}

export function CheckboxField<T extends FieldValues>({
  control,
  name,
  label,
}: CheckboxFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <View className="mb-4">
          <Pressable 
            onPress={() => onChange(!value)}
            className="flex-row items-start"
          >
            <View className={`
              w-6 h-6 rounded border-2 mr-3 items-center justify-center
              ${value ? 'bg-primary-500 border-primary-500' : 'border-gray-300'}
            `}>
              {value && <Check size={16} color="#FFFFFF" />}
            </View>
            <Text className="flex-1 text-gray-700">{label}</Text>
          </Pressable>
          {error && (
            <Text className="text-emergency-500 text-sm mt-1 ml-9">
              {error.message}
            </Text>
          )}
        </View>
      )}
    />
  );
}
```

### 6.3 Select Field

```tsx
// src/components/forms/SelectField.tsx
import { View, Text, Pressable, Modal, FlatList } from 'react-native';
import { Controller, Control, FieldValues, Path } from 'react-hook-form';
import { ChevronDown, Check } from 'lucide-react-native';
import { useState } from 'react';

interface Option {
  value: string;
  label: string;
}

interface SelectFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  placeholder?: string;
  options: Option[];
}

export function SelectField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder = 'Select an option',
  options,
}: SelectFieldProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value }, fieldState: { error } }) => {
        const selectedOption = options.find(o => o.value === value);
        
        return (
          <View className="mb-4">
            {label && (
              <Text className="text-gray-700 font-medium mb-1.5">{label}</Text>
            )}
            
            <Pressable
              onPress={() => setIsOpen(true)}
              className={`
                flex-row items-center justify-between
                h-12 px-4 rounded-lg border
                ${error ? 'border-emergency-500' : 'border-gray-300'}
                bg-white
              `}
            >
              <Text className={selectedOption ? 'text-gray-900' : 'text-gray-400'}>
                {selectedOption?.label || placeholder}
              </Text>
              <ChevronDown size={20} color="#6B7280" />
            </Pressable>
            
            {error && (
              <Text className="text-emergency-500 text-sm mt-1">{error.message}</Text>
            )}
            
            <Modal visible={isOpen} transparent animationType="slide">
              <Pressable 
                className="flex-1 bg-black/50 justify-end"
                onPress={() => setIsOpen(false)}
              >
                <View className="bg-white rounded-t-2xl max-h-[50%]">
                  <View className="p-4 border-b border-gray-200">
                    <Text className="text-lg font-semibold text-center">{label}</Text>
                  </View>
                  
                  <FlatList
                    data={options}
                    keyExtractor={item => item.value}
                    renderItem={({ item }) => (
                      <Pressable
                        onPress={() => {
                          onChange(item.value);
                          setIsOpen(false);
                        }}
                        className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100"
                      >
                        <Text className="text-gray-900">{item.label}</Text>
                        {value === item.value && (
                          <Check size={20} color="#005EB8" />
                        )}
                      </Pressable>
                    )}
                  />
                </View>
              </Pressable>
            </Modal>
          </View>
        );
      }}
    />
  );
}
```

---

## 7. FORM EXAMPLES

### 7.1 Login Form

```tsx
// app/(auth)/login.tsx
import { View, Text } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginFormData } from '@/schemas/auth';
import { FormField } from '@/components/forms/FormField';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/layout/Screen';
import { useAuthStore } from '@/stores/auth';
import { authService } from '@/services/auth';

export default function LoginScreen() {
  const { control, handleSubmit, formState: { isSubmitting } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  
  const onSubmit = async (data: LoginFormData) => {
    try {
      await authService.signIn(data.email, data.password);
      // Navigation handled by auth state listener
    } catch (error) {
      // Handle error
    }
  };
  
  return (
    <Screen scroll keyboardAvoiding>
      <View className="flex-1 justify-center py-8">
        <Text className="text-2xl font-bold text-gray-900 mb-8">
          Welcome back
        </Text>
        
        <FormField
          control={control}
          name="email"
          label="Email"
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        
        <FormField
          control={control}
          name="password"
          label="Password"
          placeholder="••••••••"
          secureTextEntry
        />
        
        <Button
          onPress={handleSubmit(onSubmit)}
          loading={isSubmitting}
          fullWidth
        >
          Sign In
        </Button>
      </View>
    </Screen>
  );
}
```

### 7.2 Report Emergency Form

```tsx
// app/witness/report.tsx
import { View, Text } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { reportEmergencySchema, ReportEmergencyFormData } from '@/schemas/emergency';
import { SelectField } from '@/components/forms/SelectField';
import { FormField } from '@/components/forms/FormField';
import { Button } from '@/components/ui/Button';
import { useLocationStore } from '@/stores/location';
import { emergencyService } from '@/services/emergencies';

const emergencyTypeOptions = [
  { value: 'road_accident', label: '🚗 Road Accident' },
  { value: 'cardiac_arrest', label: '❤️ Cardiac Arrest' },
  { value: 'stroke', label: '🧠 Stroke' },
  { value: 'stabbing', label: '🔪 Stabbing' },
  { value: 'other_medical', label: '🏥 Other Medical' },
];

export default function ReportEmergencyScreen() {
  const currentLocation = useLocationStore(s => s.currentLocation);
  
  const { control, handleSubmit, formState: { isSubmitting } } = useForm<ReportEmergencyFormData>({
    resolver: zodResolver(reportEmergencySchema),
    defaultValues: {
      location: currentLocation || { latitude: 0, longitude: 0 },
      casualtyCount: 1,
    },
  });
  
  const onSubmit = async (data: ReportEmergencyFormData) => {
    try {
      await emergencyService.reportEmergency(data);
      // Navigate to confirmation
    } catch (error) {
      // Handle error
    }
  };
  
  return (
    <Screen scroll>
      <Text className="text-xl font-bold mb-6">What's happening?</Text>
      
      <SelectField
        control={control}
        name="emergencyType"
        label="Emergency Type"
        options={emergencyTypeOptions}
      />
      
      <FormField
        control={control}
        name="locationDescription"
        label="Location Details (optional)"
        placeholder="e.g., Outside Tesco, near the bus stop"
      />
      
      <FormField
        control={control}
        name="description"
        label="Additional Details (optional)"
        placeholder="Any other important information..."
        multiline
        numberOfLines={3}
      />
      
      <Button
        onPress={handleSubmit(onSubmit)}
        loading={isSubmitting}
        variant="emergency"
        fullWidth
      >
        Report Emergency
      </Button>
    </Screen>
  );
}
```

---

## 8. ERROR MESSAGES

```typescript
// src/lib/errorMessages.ts

export const errorMessages = {
  // Authentication
  auth: {
    invalidCredentials: 'Invalid email or password. Please try again.',
    emailInUse: 'This email is already registered. Please sign in instead.',
    weakPassword: 'Password is too weak. Please choose a stronger password.',
    invalidEmail: 'Please enter a valid email address.',
    networkError: 'Network error. Please check your connection and try again.',
    tooManyAttempts: 'Too many failed attempts. Please try again later.',
  },
  
  // Credentials
  credentials: {
    gmcNotFound: 'GMC number not found. Please check and try again.',
    gmcNameMismatch: 'Name does not match GMC records. Please use your registered name.',
    nmcNotFound: 'NMC PIN not found. Please check and try again.',
    credentialExpired: 'Your credential has expired. Please renew your registration.',
    verificationFailed: 'Verification failed. Please try again or contact support.',
  },
  
  // Emergency
  emergency: {
    reportFailed: 'Failed to report emergency. Please call 999 directly.',
    acceptFailed: 'Failed to accept emergency. Please try again.',
    locationRequired: 'Location is required to report an emergency.',
  },
  
  // General
  general: {
    unknown: 'Something went wrong. Please try again.',
    networkError: 'Network error. Please check your connection.',
    serverError: 'Server error. Please try again later.',
  },
};
```

---

*This document defines all form schemas, validation rules, and form components for ProtaRes.*
