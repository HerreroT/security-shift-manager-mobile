import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import type { ComponentProps } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, type ViewStyle } from 'react-native';

import { Palette, Radius, Spacing } from '@/constants/theme';

type Variant = 'primary' | 'secondary' | 'danger';

type Props = {
  title: string;
  onPress: () => void;
  variant?: Variant;
  icon?: ComponentProps<typeof MaterialIcons>['name'];
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
};

const VARIANTS: Record<Variant, { background: string; text: string; border: string }> = {
  primary: { background: Palette.primary, text: '#FFFFFF', border: Palette.primary },
  secondary: { background: Palette.card, text: Palette.primary, border: Palette.border },
  danger: { background: Palette.card, text: Palette.danger, border: Palette.dangerSoft },
};

export function CustomButton({ title, onPress, variant = 'primary', icon, loading, disabled, style }: Props) {
  const colors = VARIANTS[variant];
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: colors.background, borderColor: colors.border },
        (pressed || isDisabled) && styles.dimmed,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={colors.text} />
      ) : (
        <>
          {icon && <MaterialIcons name={icon} size={20} color={colors.text} />}
          <Text style={[styles.text, { color: colors.text }]}>{title}</Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    minHeight: 48,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  dimmed: {
    opacity: 0.6,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
});
