import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Linking, StyleSheet, Text, View } from 'react-native';

import { ShiftCard } from '@/components/shift-card';
import { ActiveBadge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { CustomButton } from '@/components/ui/custom-button';
import { MonthNavigator } from '@/components/ui/period-navigator';
import { ScreenContainer } from '@/components/ui/screen-container';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/states';
import { Palette, Spacing } from '@/constants/theme';
import { useFetch } from '@/hooks/use-fetch';
import { api, errorMessage, query } from '@/lib/api';
import { endOfMonth, formatHours, formatMonth, startOfMonth, toIsoDate } from '@/lib/dates';
import type { Guard, GuardHoursReport } from '@/types/api';

export default function GuardDetailScreen() {
  const params = useLocalSearchParams<{ id: string; month?: string }>();
  const [month, setMonth] = useState(() => {
    if (params.month) {
      const [year, monthNumber] = params.month.split('-').map(Number);
      return new Date(year, monthNumber - 1, 1);
    }
    return startOfMonth(new Date());
  });

  const guard = useFetch<Guard>(`/guards/${params.id}`);
  const hours = useFetch<GuardHoursReport>(
    `/guards/${params.id}/hours${query({ from: toIsoDate(month), to: toIsoDate(endOfMonth(month)) })}`,
  );

  if (guard.isLoading) {
    return <LoadingState />;
  }
  if (guard.error || !guard.data) {
    return <ErrorState message={guard.error ?? 'No se encontró el guardia.'} onRetry={guard.refresh} />;
  }

  const current = guard.data;
  const fullName = `${current.firstName} ${current.lastName}`;

  const toggleActive = () => {
    const action = current.active ? 'Desactivar' : 'Activar';
    Alert.alert(
      `${action} guardia`,
      current.active
        ? `${fullName} no va a poder recibir turnos nuevos. Su historial se mantiene.`
        : `${fullName} va a poder recibir turnos nuevamente.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: action,
          style: current.active ? 'destructive' : 'default',
          onPress: async () => {
            try {
              if (current.active) {
                await api.delete(`/guards/${current.id}`);
              } else {
                await api.patch(`/guards/${current.id}/activate`);
              }
              guard.reload();
            } catch (e) {
              Alert.alert('Error', errorMessage(e));
            }
          },
        },
      ],
    );
  };

  return (
    <ScreenContainer scroll refreshing={hours.isRefreshing} onRefresh={hours.refresh}>
      <Stack.Screen options={{ title: fullName }} />

      <Card>
        <View style={styles.row}>
          <Text style={styles.name}>{fullName}</Text>
          <ActiveBadge active={current.active} />
        </View>
        <Text style={styles.detail}>DNI {current.dni}</Text>
        <Text style={styles.detail}>Tel. {current.phone}</Text>
        <View style={styles.buttons}>
          <CustomButton
            title="Llamar"
            icon="phone"
            variant="secondary"
            onPress={() => Linking.openURL(`tel:${current.phone}`)}
            style={styles.flex}
          />
          <CustomButton
            title="Editar"
            icon="edit"
            variant="secondary"
            onPress={() => router.push({ pathname: '/guards/form', params: { id: String(current.id) } })}
            style={styles.flex}
          />
        </View>
      </Card>

      <Text style={styles.sectionTitle}>Horas trabajadas</Text>
      <MonthNavigator value={month} onChange={setMonth} />

      {hours.isLoading ? (
        <LoadingState />
      ) : hours.error || !hours.data ? (
        <ErrorState message={hours.error ?? 'Error al cargar las horas.'} onRetry={hours.refresh} />
      ) : (
        <>
          <Card style={styles.summary}>
            <Text style={styles.summaryValue}>{formatHours(hours.data.totalHours)}</Text>
            <Text style={styles.summaryLabel}>
              {hours.data.shiftCount} {hours.data.shiftCount === 1 ? 'turno' : 'turnos'} en {formatMonth(month)}
            </Text>
          </Card>
          {hours.data.shifts.length === 0 ? (
            <EmptyState message="No tiene turnos en este mes." icon="event-busy" />
          ) : (
            hours.data.shifts.map((shift) => (
              <ShiftCard
                key={shift.id}
                shift={shift}
                show="service"
                showDate
                onPress={() => router.push({ pathname: '/shifts/form', params: { id: String(shift.id) } })}
              />
            ))
          )}
        </>
      )}

      <CustomButton
        title={current.active ? 'Desactivar guardia' : 'Activar guardia'}
        icon={current.active ? 'person-off' : 'person-add'}
        variant={current.active ? 'danger' : 'secondary'}
        onPress={toggleActive}
        style={styles.toggle}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  name: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: Palette.text,
  },
  detail: {
    fontSize: 15,
    color: Palette.textMuted,
  },
  buttons: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  flex: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Palette.text,
    marginTop: Spacing.sm,
  },
  summary: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 34,
    fontWeight: '700',
    color: Palette.primary,
  },
  summaryLabel: {
    fontSize: 15,
    color: Palette.textMuted,
  },
  toggle: {
    marginTop: Spacing.xl,
  },
});
