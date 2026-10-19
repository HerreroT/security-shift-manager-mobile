import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Tabs } from 'expo-router';
import type { ColorValue } from 'react-native';
import type { ComponentProps } from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { Palette } from '@/constants/theme';

type IconName = ComponentProps<typeof MaterialIcons>['name'];

function tabIcon(name: IconName) {
  return function TabIcon({ color }: { color: ColorValue }) {
    return <MaterialIcons size={26} name={name} color={color} />;
  };
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Palette.primary,
        tabBarInactiveTintColor: Palette.textMuted,
        headerTitleStyle: { color: Palette.text },
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen name="index" options={{ title: 'Inicio', tabBarIcon: tabIcon('home') }} />
      <Tabs.Screen
        name="who"
        options={{ title: '¿Quién estuvo?', tabBarLabel: 'Consultar', tabBarIcon: tabIcon('person-search') }}
      />
      <Tabs.Screen name="shifts" options={{ title: 'Turnos', tabBarIcon: tabIcon('event') }} />
      <Tabs.Screen name="guards" options={{ title: 'Guardias', tabBarIcon: tabIcon('badge') }} />
      <Tabs.Screen name="services" options={{ title: 'Servicios', tabBarIcon: tabIcon('business') }} />
    </Tabs>
  );
}
