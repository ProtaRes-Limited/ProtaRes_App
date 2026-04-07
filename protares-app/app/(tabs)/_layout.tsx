import { Tabs } from 'expo-router';
import { Home, Bell, Map, Clock, User } from 'lucide-react-native';
import { useEmergencyStore } from '@/stores/emergency';
import { View, Text } from 'react-native';

export default function TabLayout() {
  const pendingAlerts = useEmergencyStore((s) => s.pendingAlerts);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#005EB8',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          title: 'Alerts',
          tabBarIcon: ({ color, size }) => (
            <View>
              <Bell size={size} color={color} />
              {pendingAlerts.length > 0 && (
                <View className="absolute -top-1 -right-2 w-4 h-4 bg-emergency-500 rounded-full items-center justify-center">
                  <Text className="text-white text-[9px] font-bold">
                    {pendingAlerts.length}
                  </Text>
                </View>
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Map',
          tabBarIcon: ({ color, size }) => <Map size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color, size }) => <Clock size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
