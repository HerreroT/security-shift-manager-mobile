import { StyleSheet, Text, View } from 'react-native';

import { Palette, Radius, Spacing } from '@/constants/theme';

type Tone = 'success' | 'danger' | 'night' | 'primary';

const TONES: Record<Tone, { background: string; text: string }> = {
  success: { background: Palette.successSoft, text: Palette.success },
  danger: { background: Palette.dangerSoft, text: Palette.danger },
  night: { background: Palette.nightSoft, text: Palette.night },
  primary: { background: Palette.primarySoft, text: Palette.primaryDark },
};

export function Badge({ label, tone }: { label: string; tone: Tone }) {
  const colors = TONES[tone];
  return (
    <View style={[styles.badge, { backgroundColor: colors.background }]}>
      <Text style={[styles.text, { color: colors.text }]}>{label}</Text>
    </View>
  );
}

export function ActiveBadge({ active }: { active: boolean }) {
  return active ? <Badge label="Activo" tone="success" /> : <Badge label="Inactivo" tone="danger" />;
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.pill,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});
