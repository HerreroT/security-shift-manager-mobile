import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StyleSheet, Text, View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Palette, Spacing } from '@/constants/theme';
import { formatHours, formatLongDate, formatShiftRange, isOvernight, parseDateTime } from '@/lib/dates';
import type { ShiftAssignment } from '@/types/api';

type Props = {
  shift: ShiftAssignment;
  /** What the title shows: the guard, the service, or both (guard as title, service below). */
  show: 'guard' | 'service' | 'both';
  showDate?: boolean;
  onPress?: () => void;
};

export function ShiftCard({ shift, show, showDate = false, onPress }: Props) {
  const guardName = `${shift.guard.firstName} ${shift.guard.lastName}`;
  const start = parseDateTime(shift.startDateTime);
  const end = parseDateTime(shift.endDateTime);
  const now = new Date();
  const inProgress = start <= now && now < end;

  return (
    <Card onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>
          {show === 'service' ? shift.service.name : guardName}
        </Text>
        <Text style={styles.hours}>{formatHours(shift.totalHours)}</Text>
      </View>
      {show === 'both' && <Text style={styles.subtitle}>{shift.service.name}</Text>}
      {showDate && <Text style={styles.subtitle}>{formatLongDate(start)}</Text>}
      <View style={styles.row}>
        <MaterialIcons name="schedule" size={16} color={Palette.textMuted} />
        <Text style={styles.time}>{formatShiftRange(shift.startDateTime, shift.endDateTime)}</Text>
      </View>
      <View style={styles.badges}>
        {inProgress && <Badge label="En curso" tone="success" />}
        {isOvernight(shift.startDateTime, shift.endDateTime) && <Badge label="Nocturno" tone="night" />}
        {shift.actualEndTime ? (
          <Badge label="Con salida registrada" tone="primary" />
        ) : shift.actualStartTime ? (
          <Badge label="Con entrada registrada" tone="primary" />
        ) : null}
      </View>
      {shift.notes ? <Text style={styles.notes}>{shift.notes}</Text> : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: Palette.text,
  },
  hours: {
    fontSize: 15,
    fontWeight: '700',
    color: Palette.primary,
  },
  subtitle: {
    fontSize: 14,
    color: Palette.textMuted,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  time: {
    fontSize: 15,
    color: Palette.text,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  notes: {
    fontSize: 13,
    color: Palette.textMuted,
    fontStyle: 'italic',
  },
});
