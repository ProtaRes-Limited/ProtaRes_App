import { useState } from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import {
  MapPin,
  BarChart3,
  Mail,
  Download,
  Trash2,
  ShieldAlert,
} from 'lucide-react-native';
import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/auth';

function Toggle({
  value,
  onToggle,
}: {
  value: boolean;
  onToggle: () => void;
}) {
  return (
    <Pressable
      onPress={onToggle}
      className={`w-12 h-7 rounded-full justify-center px-0.5 ${
        value ? 'bg-primary-500' : 'bg-gray-300'
      }`}
    >
      <View
        className={`w-6 h-6 rounded-full bg-white shadow ${
          value ? 'self-end' : 'self-start'
        }`}
      />
    </Pressable>
  );
}

export default function PrivacyScreen() {
  const user = useAuthStore((s) => s.user);
  const [locationTracking, setLocationTracking] = useState(
    user?.locationConsent ?? true
  );
  const [analyticsConsent, setAnalyticsConsent] = useState(true);
  const [marketingConsent, setMarketingConsent] = useState(false);

  const handleDownloadData = () => {
    Alert.alert(
      'Download Your Data',
      'We will prepare a copy of all your data and send it to your registered email address. This may take up to 48 hours.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Request Download',
          onPress: () => {
            Alert.alert(
              'Request Sent',
              'Your data export has been requested. You will receive it via email.'
            );
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action is irreversible. All your data including response history, credentials, and personal information will be permanently deleted. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Account Deletion Requested',
              'Your account deletion request has been submitted. You will receive a confirmation email within 24 hours.'
            );
          },
        },
      ]
    );
  };

  return (
    <Screen safeArea padded={false}>
      <Header title="Privacy" />
      <View className="flex-1 px-4">
        {/* Location */}
        <Text className="text-lg font-bold text-gray-900 mt-4 mb-3">
          Location
        </Text>

        <Card variant="outlined" className="mb-6">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-3 flex-1">
              <View className="w-10 h-10 rounded-full bg-primary-100 items-center justify-center">
                <MapPin size={20} color="#005EB8" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-medium text-gray-900">
                  Location Tracking
                </Text>
                <Text className="text-sm text-gray-500">
                  Required to receive nearby emergency alerts
                </Text>
              </View>
            </View>
            <Toggle
              value={locationTracking}
              onToggle={() => setLocationTracking(!locationTracking)}
            />
          </View>

          {!locationTracking && (
            <View className="mt-3 bg-warning-50 rounded-lg p-3">
              <View className="flex-row items-start gap-2">
                <ShieldAlert size={16} color="#D97706" />
                <Text className="flex-1 text-xs text-warning-700">
                  Disabling location tracking means you will not receive
                  emergency alerts based on proximity. You can still use the app
                  for manual reporting.
                </Text>
              </View>
            </View>
          )}
        </Card>

        {/* Consent Preferences */}
        <Text className="text-lg font-bold text-gray-900 mb-3">
          Consent Preferences
        </Text>

        <Card variant="outlined" className="mb-6">
          <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
            <View className="flex-row items-center gap-3 flex-1">
              <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center">
                <BarChart3 size={20} color="#005EB8" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-medium text-gray-900">
                  Analytics
                </Text>
                <Text className="text-sm text-gray-500">
                  Help us improve by sharing usage data
                </Text>
              </View>
            </View>
            <Toggle
              value={analyticsConsent}
              onToggle={() => setAnalyticsConsent(!analyticsConsent)}
            />
          </View>

          <View className="flex-row items-center justify-between py-3">
            <View className="flex-row items-center gap-3 flex-1">
              <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center">
                <Mail size={20} color="#005EB8" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-medium text-gray-900">
                  Marketing
                </Text>
                <Text className="text-sm text-gray-500">
                  Receive updates about new features
                </Text>
              </View>
            </View>
            <Toggle
              value={marketingConsent}
              onToggle={() => setMarketingConsent(!marketingConsent)}
            />
          </View>
        </Card>

        {/* Data Actions */}
        <Text className="text-lg font-bold text-gray-900 mb-3">
          Your Data
        </Text>

        <View className="gap-3 mb-8">
          <Button
            variant="secondary"
            fullWidth
            icon={Download}
            onPress={handleDownloadData}
          >
            Download My Data
          </Button>

          <Button
            variant="danger"
            fullWidth
            icon={Trash2}
            onPress={handleDeleteAccount}
          >
            Delete Account
          </Button>
        </View>

        {/* GDPR Note */}
        <Card variant="outlined" className="mb-8">
          <Text className="text-xs text-gray-500 leading-5">
            Your data is processed in accordance with the UK GDPR and Data
            Protection Act 2018. ProtaRes only collects data necessary for
            emergency response coordination. For more information, please review
            our Privacy Policy.
          </Text>
        </Card>
      </View>
    </Screen>
  );
}
