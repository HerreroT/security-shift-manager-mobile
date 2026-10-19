import { router } from 'expo-router';
import { useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';

import { ShiftCard } from '@/components/shift-card';
import { Fab } from '@/components/ui/fab';
import { DayNavigator } from '@/components/ui/period-navigator';
import { SelectField } from '@/components/ui/select-field';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/states';
import { Palette, Spacing } from '@/constants/theme';
import { useFetch } from '@/hooks/use-fetch';
import { query } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { toIsoDate } from '@/lib/dates';
import type { Guard, Service, ShiftAssignment } from '@/types/api';

export default function ShiftsScreen() {
  const { isAdmin } = useAuth();
  const [day, setDay] = useState(() => new Date());
  const [serviceId, setServiceId] = useState<number | null>(null);
  const [guardId, setGuardId] = useState<number | null>(null);

  const services = useFetch<Service[]>('/services');
  const guards = useFetch<Guard[]>('/guards');
  const isoDay = toIsoDate(day);
  const shifts = useFetch<ShiftAssignment[]>(
    `/shift-assignments${query({ from: isoDay, to: isoDay, serviceId, guardId })}`,
  );

  return (
    <View style={styles.screen}>
      <FlatList
        data={shifts.data ?? []}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={shifts.isRefreshing} onRefresh={shifts.refresh} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <DayNavigator value={day} onChange={setDay} />
            <View style={styles.filters}>
              <View style={styles.flex}>
                <SelectField
                  label="Servicio"
                  placeholder="Servicio"
                  clearLabel="Todos"
                  options={services.data ?? []}
                  selectedId={serviceId}
                  onSelect={(service) => setServiceId(service?.id ?? null)}
                  getLabel={(service) => service.name}
                  getSubtitle={(service) => service.location}
                />
              </View>
              <View style={styles.flex}>
                <SelectField
                  label="Guardia"
                  placeholder="Guardia"
                  clearLabel="Todos"
                  options={guards.data ?? []}
                  selectedId={guardId}
                  onSelect={(guard) => setGuardId(guard?.id ?? null)}
                  getLabel={(guard) => `${guard.lastName}, ${guard.firstName}`}
                  getSubtitle={(guard) => `DNI ${guard.dni}`}
                />
              </View>
            </View>
          </View>
        }
        ListEmptyComponent={
          shifts.isLoading ? (
            <LoadingState />
          ) : shifts.error ? (
            <ErrorState message={shifts.error} onRetry={shifts.refresh} />
          ) : (
            <EmptyState message="No hay turnos para este día." icon="event-busy" />
          )
        }
        renderItem={({ item }) => (
          <ShiftCard
            shift={item}
            show="both"
            onPress={
              isAdmin ? () => router.push({ pathname: '/shifts/form', params: { id: String(item.id) } }) : undefined
            }
          />
        )}
      />
      {isAdmin && (
        <Fab
          label="Turno"
          onPress={() =>
            router.push({
              pathname: '/shifts/form',
              params: {
                date: isoDay,
                ...(serviceId ? { serviceId: String(serviceId) } : {}),
                ...(guardId ? { guardId: String(guardId) } : {}),
              },
            })
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  list: {
    padding: Spacing.lg,
    gap: Spacing.md,
    paddingBottom: 96,
    flexGrow: 1,
  },
  header: {
    gap: Spacing.md,
  },
  filters: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  flex: {
    flex: 1,
  },
});
