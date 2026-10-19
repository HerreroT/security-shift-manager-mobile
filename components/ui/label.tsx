import type { ReactNode } from 'react';
import { StyleSheet, Text } from 'react-native';

import { Palette } from '@/constants/theme';

export function Label({ children }: { children: ReactNode }) {
  return <Text style={styles.label}>{children}</Text>;
}

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Palette.text,
  },
});
