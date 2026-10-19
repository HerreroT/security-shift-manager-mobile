import type { ReactNode } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';

import { Palette, Spacing } from '@/constants/theme';

type Props = {
  children: ReactNode;
  /** Wraps the content in a ScrollView. Do not use it for screens with a FlatList. */
  scroll?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  style?: ViewStyle;
};

export function ScreenContainer({ children, scroll = false, refreshing, onRefresh, style }: Props) {
  if (scroll) {
    return (
      <ScrollView
        style={styles.screen}
        contentContainerStyle={[styles.content, style]}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          onRefresh ? <RefreshControl refreshing={refreshing ?? false} onRefresh={onRefresh} /> : undefined
        }>
        {children}
      </ScrollView>
    );
  }
  return <View style={[styles.screen, styles.content, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  content: {
    padding: Spacing.lg,
    gap: Spacing.md,
    flexGrow: 1,
  },
});
