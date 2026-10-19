import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ShiftCard } from '@/components/shift-card';
import { Card } from '@/components/ui/card';
import { CustomButton } from '@/components/ui/custom-button';
import { ScreenContainer } from '@/components/ui/screen-container';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/states';
import { Palette, Radius, Spacing } from '@/constants/theme';
import { useFetch } from '@/hooks/use-fetch';
import { query } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { formatHours, formatLongDate, parseDateTime, toIsoDate } from '@/lib/dates';
import type { ShiftAssignment } from '@/types/api';

export default function HomeScreen() {
  const { session, signOut } = useAuth();
  const today = toIsoDate(new Date());
  const { data, error, isLoading, isRefreshing, refresh } = useFetch<ShiftAssignment[]>(
    `/shift-assignments${query({ from: today, to: today })}`,
  );

  const now = new Date();
  const shifts = data ?? [];
  const onDutyNow = shifts.filter(
    (shift) => parseDateTime(shift.startDateTime) <= now && now < parseDateTime(shift.endDateTime),
  );
  const startingToday = shifts.filter((shift) => shift.startDateTime.startsWith(today));
  const plannedHours = startingToday.reduce((total, shift) => total + shift.totalHours, 0);

  return (
    <ScreenContainer scroll refreshing={isRefreshing} onRefresh={refresh}>
      <View>
        <Text style={styles.greeting}>Hola, {session?.username ?? 'admin'}</Text>
        <Text style={styles.date}>Hoy es {formatLongDate(now)}</Text>
      </View>

      <View style={styles.actions}>
        <QuickAction icon="person-search" label="¿Quién estuvo?" onPress={() => router.push('/who')} />
        <QuickAction icon="add-circle-outline" label="Nuevo turno" onPress={() => router.push('/shifts/form')} />
        <QuickAction icon="bar-chart" label="Horas del mes" onPress={() => router.push('/reports/monthly')} />
      </View>

      {isLoading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={refresh} />
      ) : (
        <>
          <View style={styles.stats}>
            <Card style={styles.stat}>
              <Text style={styles.statValue}>{onDutyNow.length}</Text>
              <Text style={styles.statLabel}>en servicio ahora</Text>
            </Card>
            <Card style={styles.stat}>
              <Text style={styles.statValue}>{startingToday.length}</Text>
              <Text style={styles.statLabel}>turnos hoy ({formatHours(plannedHours)})</Text>
            </Card>
          </View>

          <Text style={styles.sectionTitle}>En servicio ahora</Text>
          {onDutyNow.length === 0 ? (
            <EmptyState message="No hay guardias en servicio en este momento." icon="nightlight" />
          ) : (
            onDutyNow.map((shift) => (
              <ShiftCard
                key={shift.id}
                shift={shift}
                show="both"
                onPress={() => router.push({ pathname: '/guards/[id]', params: { id: String(shift.guard.id) } })}
              />
            ))
          )}
        </>
      )}

      <CustomButton title="Cerrar sesión" variant="danger" icon="logout" onPress={signOut} style={styles.logout} />
    </ScreenContainer>
  );
}

type QuickActionProps = {
  icon: ComponentProps<typeof MaterialIcons>['name'];
  label: string;
  onPress: () => void;
};

function QuickAction({ icon, label, onPress }: QuickActionProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.action, pressed && styles.actionPressed]}>
      <MaterialIcons name={icon} size={28} color={Palette.primary} />
      <Text style={styles.actionLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: Palette.text,
  },
  date: {
    fontSize: 15,
    color: Palette.textMuted,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  action: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Palette.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Palette.border,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xs,
  },
  actionPressed: {
    backgroundColor: Palette.primarySoft,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Palette.text,
    textAlign: 'center',
  },
  stats: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: Palette.primary,
  },
  statLabel: {
    fontSize: 13,
    color: Palette.textMuted,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Palette.text,
    marginTop: Spacing.sm,
  },
  logout: {
    marginTop: Spacing.xl,
  },
});
