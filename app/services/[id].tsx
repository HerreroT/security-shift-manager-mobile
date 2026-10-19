import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { ShiftCard } from '@/components/shift-card';
import { ActiveBadge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { CustomButton } from '@/components/ui/custom-button';
import { DayNavigator } from '@/components/ui/period-navigator';
import { ScreenContainer } from '@/components/ui/screen-container';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/states';
import { Palette, Spacing } from '@/constants/theme';
import { useFetch } from '@/hooks/use-fetch';
import { api, errorMessage, query } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { toIsoDate } from '@/lib/dates';
import type { Service, ShiftAssignment } from '@/types/api';

export default function ServiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isAdmin } = useAuth();
  const [day, setDay] = useState(() => new Date());
  const isoDay = toIsoDate(day);

  const service = useFetch<Service>(`/services/${id}`);
  const shifts = useFetch<ShiftAssignment[]>(
    `/shift-assignments${query({ serviceId: id, from: isoDay, to: isoDay })}`,
  );

  if (service.isLoading) {
    return <LoadingState />;
  }
  if (service.error || !service.data) {
    return <ErrorState message={service.error ?? 'No se encontró el servicio.'} onRetry={service.refresh} />;
  }

  const current = service.data;

  const toggleActive = () => {
    const action = current.active ? 'Desactivar' : 'Activar';
    Alert.alert(
      `${action} servicio`,
      current.active
        ? `No se van a poder asignar turnos nuevos a ${current.name}. El historial se mantiene.`
        : `Se van a poder asignar turnos a ${current.name} nuevamente.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: action,
          style: current.active ? 'destructive' : 'default',
          onPress: async () => {
            try {
              if (current.active) {
                await api.delete(`/services/${current.id}`);
              } else {
                await api.patch(`/services/${current.id}/activate`);
              }
              service.reload();
            } catch (e) {
              Alert.alert('Error', errorMessage(e));
            }
          },
        },
      ],
    );
  };

  return (
    <ScreenContainer scroll refreshing={shifts.isRefreshing} onRefresh={shifts.refresh}>
      <Stack.Screen options={{ title: current.name }} />

      <Card>
        <View style={styles.row}>
          <Text style={styles.name}>{current.name}</Text>
          <ActiveBadge active={current.active} />
        </View>
        <Text style={styles.detail}>{current.location}</Text>
        {current.description ? <Text style={styles.description}>{current.description}</Text> : null}
        <View style={styles.buttons}>
          <CustomButton
            title="¿Quién estuvo?"
            icon="person-search"
            onPress={() => router.navigate({ pathname: '/who', params: { serviceId: String(current.id) } })}
            style={styles.flex}
          />
          {isAdmin && (
            <CustomButton
              title="Editar"
              icon="edit"
              variant="secondary"
              onPress={() => router.push({ pathname: '/services/form', params: { id: String(current.id) } })}
            />
          )}
        </View>
      </Card>

      <Text style={styles.sectionTitle}>Turnos</Text>
      <DayNavigator value={day} onChange={setDay} />

      {shifts.isLoading ? (
        <LoadingState />
      ) : shifts.error ? (
        <ErrorState message={shifts.error} onRetry={shifts.refresh} />
      ) : (shifts.data ?? []).length === 0 ? (
        <EmptyState message="No hay turnos asignados este día." icon="event-busy" />
      ) : (
        (shifts.data ?? []).map((shift) => (
          <ShiftCard
            key={shift.id}
            shift={shift}
            show="guard"
            onPress={
              isAdmin ? () => router.push({ pathname: '/shifts/form', params: { id: String(shift.id) } }) : undefined
            }
          />
        ))
      )}

      {isAdmin && current.active && (
        <CustomButton
          title="Asignar turno"
          icon="add"
          variant="secondary"
          onPress={() =>
            router.push({ pathname: '/shifts/form', params: { serviceId: String(current.id), date: isoDay } })
          }
        />
      )}

      {isAdmin && (
        <CustomButton
          title={current.active ? 'Desactivar servicio' : 'Activar servicio'}
          icon={current.active ? 'block' : 'check-circle'}
          variant={current.active ? 'danger' : 'secondary'}
          onPress={toggleActive}
          style={styles.toggle}
        />
      )}
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
  description: {
    fontSize: 14,
    color: Palette.text,
    marginTop: Spacing.xs,
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
  toggle: {
    marginTop: Spacing.xl,
  },
});
