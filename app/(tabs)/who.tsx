import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { CustomButton } from '@/components/ui/custom-button';
import { DateTimeField } from '@/components/ui/date-time-field';
import { ScreenContainer } from '@/components/ui/screen-container';
import { SelectField } from '@/components/ui/select-field';
import { EmptyState, ErrorState } from '@/components/ui/states';
import { Palette, Spacing } from '@/constants/theme';
import { useFetch } from '@/hooks/use-fetch';
import { api, errorMessage, query } from '@/lib/api';
import { formatLongDate, formatShiftRange, formatTime, toIsoDateTime } from '@/lib/dates';
import type { Service, ShiftAssignment } from '@/types/api';

type Result = {
  service: Service;
  at: Date;
  shifts: ShiftAssignment[];
};

/** Main use case: which guard was at a service at a given date and time. */
export default function WhoWasThereScreen() {
  const params = useLocalSearchParams<{ serviceId?: string }>();
  const services = useFetch<Service[]>('/services');

  const [serviceId, setServiceId] = useState<number | null>(params.serviceId ? Number(params.serviceId) : null);
  const [lastParam, setLastParam] = useState(params.serviceId);
  const [at, setAt] = useState(() => {
    const now = new Date();
    now.setSeconds(0, 0);
    return now;
  });
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Coming from a service detail ("¿Quién estuvo acá?") preselects that service.
  if (params.serviceId !== lastParam) {
    setLastParam(params.serviceId);
    if (params.serviceId) {
      setServiceId(Number(params.serviceId));
      setResult(null);
    }
  }

  const search = async () => {
    const service = services.data?.find((s) => s.id === serviceId);
    if (!service) {
      setError('Elegí un servicio.');
      return;
    }
    setError(null);
    setIsSearching(true);
    try {
      const shifts = await api.get<ShiftAssignment[]>(
        `/services/${service.id}/on-duty${query({ at: toIsoDateTime(at) })}`,
      );
      setResult({ service, at, shifts });
    } catch (e) {
      setError(errorMessage(e));
      setResult(null);
    } finally {
      setIsSearching(false);
    }
  };

  if (services.error) {
    return <ErrorState message={services.error} onRetry={services.refresh} />;
  }

  return (
    <ScreenContainer scroll>
      <Text style={styles.intro}>Elegí el servicio, el día y la hora para ver qué guardia estaba de turno.</Text>

      <SelectField
        label="Servicio"
        placeholder={services.isLoading ? 'Cargando servicios...' : 'Elegí un servicio'}
        options={services.data ?? []}
        selectedId={serviceId}
        onSelect={(service) => {
          setServiceId(service?.id ?? null);
          setResult(null);
        }}
        getLabel={(service) => service.name}
        getSubtitle={(service) => service.location}
      />

      <View style={styles.row}>
        <View style={styles.flex}>
          <DateTimeField label="Día" mode="date" value={at} onChange={setAt} />
        </View>
        <View style={styles.flex}>
          <DateTimeField label="Hora" mode="time" value={at} onChange={setAt} />
        </View>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <CustomButton title="Consultar" icon="search" onPress={search} loading={isSearching} />

      {result && (
        <View style={styles.results}>
          <Text style={styles.resultTitle}>
            {result.service.name} · {formatLongDate(result.at)} · {formatTime(result.at)} hs
          </Text>
          {result.shifts.length === 0 ? (
            <EmptyState message="No había ningún guardia asignado en ese horario." icon="person-off" />
          ) : (
            result.shifts.map((shift) => (
              <Card
                key={shift.id}
                onPress={() => router.push({ pathname: '/guards/[id]', params: { id: String(shift.guard.id) } })}>
                <Text style={styles.guardName}>
                  {shift.guard.firstName} {shift.guard.lastName}
                </Text>
                <Text style={styles.detail}>DNI {shift.guard.dni}</Text>
                <Text style={styles.detail}>
                  Turno: {formatShiftRange(shift.startDateTime, shift.endDateTime)}
                </Text>
                <Pressable
                  style={styles.phone}
                  hitSlop={8}
                  onPress={() => Linking.openURL(`tel:${shift.guard.phone}`)}>
                  <MaterialIcons name="phone" size={18} color={Palette.primary} />
                  <Text style={styles.phoneText}>{shift.guard.phone}</Text>
                </Pressable>
              </Card>
            ))
          )}
        </View>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  intro: {
    fontSize: 15,
    color: Palette.textMuted,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  flex: {
    flex: 1,
  },
  error: {
    color: Palette.danger,
    fontSize: 14,
  },
  results: {
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Palette.text,
  },
  guardName: {
    fontSize: 18,
    fontWeight: '700',
    color: Palette.text,
  },
  detail: {
    fontSize: 15,
    color: Palette.textMuted,
  },
  phone: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  phoneText: {
    fontSize: 15,
    color: Palette.primary,
    fontWeight: '600',
  },
});
