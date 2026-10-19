import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Pressable, StyleSheet, Text } from 'react-native';

import { Palette, Radius, Spacing } from '@/constants/theme';

type Props = {
  label: string;
  onPress: () => void;
};

/** Floating "+" button for creating items, shown at the bottom right of a list. */
export function Fab({ label, onPress }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.fab, pressed && styles.pressed]}>
      <MaterialIcons name="add" size={24} color="#FFFFFF" />
      <Text style={styles.text}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: Spacing.lg,
    bottom: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Palette.primary,
    borderRadius: Radius.pill,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  pressed: {
    backgroundColor: Palette.primaryDark,
  },
  text: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
});
