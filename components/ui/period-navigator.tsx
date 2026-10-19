import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { DateTimeField } from '@/components/ui/date-time-field';
import { Palette, Radius, Spacing } from '@/constants/theme';
import { addDays, addMonths, formatLongDate, formatMonth, isSameDay, startOfMonth } from '@/lib/dates';

type Props = {
  value: Date;
  onChange: (value: Date) => void;
};

/** ‹ Octubre 2026 › */
export function MonthNavigator({ value, onChange }: Props) {
  const isCurrentMonth = isSameDay(startOfMonth(value), startOfMonth(new Date()));
  return (
    <View style={styles.container}>
      <Arrow icon="chevron-left" label="Mes anterior" onPress={() => onChange(addMonths(value, -1))} />
      <Pressable style={styles.center} onPress={() => onChange(startOfMonth(new Date()))}>
        <Text style={styles.title}>{formatMonth(value)}</Text>
        {!isCurrentMonth && <Text style={styles.hint}>Tocá para volver al mes actual</Text>}
      </Pressable>
      <Arrow icon="chevron-right" label="Mes siguiente" onPress={() => onChange(addMonths(value, 1))} />
    </View>
  );
}

/** ‹ lunes 12 de octubre › with a date picker. */
export function DayNavigator({ value, onChange }: Props) {
  const isToday = isSameDay(value, new Date());
  return (
    <View style={styles.container}>
      <Arrow icon="chevron-left" label="Día anterior" onPress={() => onChange(addDays(value, -1))} />
      <View style={styles.center}>
        <Text style={styles.title}>{isToday ? `Hoy, ${formatLongDate(value)}` : formatLongDate(value)}</Text>
        <View style={styles.dayActions}>
          <DateTimeField value={value} onChange={onChange} mode="date" />
          {!isToday && (
            <Pressable onPress={() => onChange(new Date())} hitSlop={8}>
              <Text style={styles.link}>Hoy</Text>
            </Pressable>
          )}
        </View>
      </View>
      <Arrow icon="chevron-right" label="Día siguiente" onPress={() => onChange(addDays(value, 1))} />
    </View>
  );
}

type ArrowProps = {
  icon: 'chevron-left' | 'chevron-right';
  label: string;
  onPress: () => void;
};

function Arrow({ icon, label, onPress }: ArrowProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={label}
      hitSlop={8}
      style={({ pressed }) => [styles.arrow, pressed && styles.pressed]}>
      <MaterialIcons name={icon} size={28} color={Palette.primary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Palette.border,
    padding: Spacing.sm,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: Palette.text,
    textAlign: 'center',
  },
  hint: {
    fontSize: 12,
    color: Palette.textMuted,
  },
  dayActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  link: {
    color: Palette.primary,
    fontWeight: '600',
    fontSize: 15,
  },
  arrow: {
    padding: Spacing.sm,
    borderRadius: Radius.pill,
  },
  pressed: {
    backgroundColor: Palette.primarySoft,
  },
});
