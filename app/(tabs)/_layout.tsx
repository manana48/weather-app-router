import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: '#4A90E2' }}>
      <Tabs.Screen
        name="index"
        options={{
          title: '오늘 날씨',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🌤️</Text>,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: '도시 검색',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🔍</Text>,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="forecast"
        options={{
          title: '예보',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>📅</Text>,
          headerShown: false,
        }}
      />
    </Tabs>
  );
}

import { Text } from 'react-native';
