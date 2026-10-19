import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import type { ComponentProps } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { CustomButton } from '@/components/ui/custom-button';
import { Palette, Spacing } from '@/constants/theme';

export function LoadingState({ message = 'Cargando...' }: { message?: string }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Palette.primary} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

type EmptyProps = {
  message: string;
  icon?: ComponentProps<typeof MaterialIcons>['name'];
};

export function EmptyState({ message, icon = 'inbox' }: EmptyProps) {
  return (
    <View style={styles.container}>
      <MaterialIcons name={icon} size={40} color={Palette.textMuted} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

type ErrorProps = {
  message: string;
  onRetry?: () => void;
};

export function ErrorState({ message, onRetry }: ErrorProps) {
  return (
    <View style={styles.container}>
      <MaterialIcons name="error-outline" size={40} color={Palette.danger} />
      <Text style={styles.message}>{message}</Text>
      {onRetry && <CustomButton title="Reintentar" variant="secondary" icon="refresh" onPress={onRetry} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    padding: Spacing.xl,
  },
  message: {
    fontSize: 15,
    color: Palette.textMuted,
    textAlign: 'center',
  },
});
