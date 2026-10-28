import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { CustomButton } from '@/components/ui/custom-button';
import { DateTimeField } from '@/components/ui/date-time-field';
import { InputField } from '@/components/ui/input-field';
import { ScreenContainer } from '@/components/ui/screen-container';
import { SelectField } from '@/components/ui/select-field';
import { ErrorState, LoadingState } from '@/components/ui/states';
import { Palette, Radius, Spacing } from '@/constants/theme';
import { useFetch } from '@/hooks/use-fetch';
import { api, errorMessage } from '@/lib/api';
import {
  formatHours,
  formatLongDate,
  formatShortDate,
  formatTime,
  isSameDay,
  parseDateTime,
  toIsoDateTime,
} from '@/lib/dates';
import { confirmAction, showError } from '@/lib/dialogs';
import type { Guard, Service, ShiftAssignment, ShiftAssignmentRequest } from '@/types/api';

type Params = {
  id?: string;
  serviceId?: string;
  guardId?: string;
  date?: string;
};

/** Create a shift, or edit/delete it and register check-in/check-out when an id is received. */
export default function ShiftFormScreen() {
  const params = useLocalSearchParams<Params>();
  const guards = useFetch<Guard[]>('/guards?active=true');
  const services = useFetch<Service[]>('/services?active=true');
  const shift = useFetch<ShiftAssignment>(params.id ? `/shift-assignments/${params.id}` : null);

  const isLoading = guards.isLoading || services.isLoading || (params.id !== undefined && shift.isLoading);
  const error = guards.error ?? services.error ?? shift.error;

  if (isLoading) {
    return <LoadingState />;
  }
  if (error || !guards.data || !services.data || (params.id && !shift.data)) {
    return (
      <ErrorState
        message={error ?? 'No se encontró el turno.'}
        onRetry={() => {
          guards.refresh();
          services.refresh();
          shift.refresh();
        }}
      />
    );
  }

  // Inactive guards/services are not offered for new shifts, but an existing shift keeps showing them.
  const existing = shift.data;
  const guardOptions =
    existing && !guards.data.some((g) => g.id === existing.guard.id) ? [existing.guard, ...guards.data] : guards.data;
  const serviceOptions =
    existing && !services.data.some((s) => s.id === existing.service.id)
      ? [existing.service, ...services.data]
      : services.data;

  return (
    <ShiftForm
      existing={existing}
      guards={guardOptions}
      services={serviceOptions}
      defaults={params}
      onChanged={shift.reload}
    />
  );
}

type FormProps = {
  existing: ShiftAssignment | null;
  guards: Guard[];
  services: Service[];
  defaults: Params;
  onChanged: () => void;
};

function initialStart(existing: ShiftAssignment | null, date?: string): Date {
  if (existing) return parseDateTime(existing.startDateTime);
  const start = date ? parseDateTime(`${date}T08:00:00`) : new Date();
  start.setHours(8, 0, 0, 0);
  return start;
}

function initialEndTime(existing: ShiftAssignment | null, start: Date): Date {
  if (existing) return parseDateTime(existing.endDateTime);
  const end = new Date(start);
  end.setHours(20, 0, 0, 0);
  return end;
}

/** The end is the chosen time on the start day, or on the next day if it is not after the start. */
function computeEnd(start: Date, endTime: Date): Date {
  const end = new Date(start);
  end.setHours(endTime.getHours(), endTime.getMinutes(), 0, 0);
  if (end <= start) {
    end.setDate(end.getDate() + 1);
  }
  return end;
}

function ShiftForm({ existing, guards, services, defaults, onChanged }: FormProps) {
  const [guardId, setGuardId] = useState<number | null>(
    existing?.guard.id ?? (defaults.guardId ? Number(defaults.guardId) : null),
  );
  const [serviceId, setServiceId] = useState<number | null>(
    existing?.service.id ?? (defaults.serviceId ? Number(defaults.serviceId) : null),
  );
  const [start, setStart] = useState(() => initialStart(existing, defaults.date));
  const [endTime, setEndTime] = useState(() => initialEndTime(existing, initialStart(existing, defaults.date)));
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const end = computeEnd(start, endTime);
  const durationHours = (end.getTime() - start.getTime()) / 3_600_000;
  const endsNextDay = !isSameDay(start, end);

  const save = async () => {
    const nextErrors: Record<string, string> = {};
    if (!guardId) nextErrors.guardId = 'Elegí un guardia.';
    if (!serviceId) nextErrors.serviceId = 'Elegí un servicio.';
    setErrors(nextErrors);
    if (!guardId || !serviceId) return;

    const body: ShiftAssignmentRequest = {
      guardId,
      serviceId,
      startDateTime: toIsoDateTime(start),
      endDateTime: toIsoDateTime(end),
      notes: notes.trim() || null,
    };
    setGeneralError(null);
    setIsSaving(true);
    try {
      if (existing) {
        await api.put(`/shift-assignments/${existing.id}`, body);
      } else {
        await api.post('/shift-assignments', body);
      }
      router.back();
    } catch (e) {
      // 409 explains which shift overlaps, so the message from the backend is shown as is.
      setGeneralError(errorMessage(e));
      setIsSaving(false);
    }
  };

  const remove = () => {
    if (!existing) return;
    confirmAction({
      title: 'Eliminar turno',
      message: '¿Seguro que querés eliminar este turno?',
      confirmLabel: 'Eliminar',
      destructive: true,
      onConfirm: async () => {
        try {
          await api.delete(`/shift-assignments/${existing.id}`);
          router.back();
        } catch (e) {
          showError(errorMessage(e));
        }
      },
    });
  };

  const registerAttendance = async (action: 'check-in' | 'check-out') => {
    if (!existing) return;
    try {
      await api.post(`/shift-assignments/${existing.id}/${action}`);
      onChanged();
    } catch (e) {
      showError(errorMessage(e));
    }
  };

  return (
    <ScreenContainer scroll>
      <Stack.Screen options={{ title: existing ? 'Editar turno' : 'Nuevo turno' }} />

      <SelectField
        label="Guardia"
        placeholder="Elegí un guardia"
        options={guards}
        selectedId={guardId}
        onSelect={(guard) => setGuardId(guard?.id ?? null)}
        getLabel={(guard) => `${guard.lastName}, ${guard.firstName}`}
        getSubtitle={(guard) => `DNI ${guard.dni}`}
        error={errors.guardId}
      />
      <SelectField
        label="Servicio"
        placeholder="Elegí un servicio"
        options={services}
        selectedId={serviceId}
        onSelect={(service) => setServiceId(service?.id ?? null)}
        getLabel={(service) => service.name}
        getSubtitle={(service) => service.location}
        error={errors.serviceId}
      />

      <DateTimeField label="Día de inicio" mode="date" value={start} onChange={setStart} />
      <View style={styles.row}>
        <View style={styles.flex}>
          <DateTimeField label="Entrada" mode="time" value={start} onChange={setStart} />
        </View>
        <View style={styles.flex}>
          <DateTimeField label="Salida" mode="time" value={endTime} onChange={setEndTime} />
        </View>
      </View>

      <View style={styles.summary}>
        <Text style={styles.summaryText}>
          {formatLongDate(start)} {formatTime(start)} → {endsNextDay ? `${formatShortDate(end)} ` : ''}
          {formatTime(end)}
        </Text>
        <View style={styles.summaryBadges}>
          <Badge label={formatHours(durationHours)} tone="primary" />
          {endsNextDay && <Badge label="Termina al día siguiente" tone="night" />}
        </View>
      </View>

      <InputField
        label="Notas (opcional)"
        value={notes}
        onChangeText={setNotes}
        multiline
        maxLength={500}
        style={styles.multiline}
      />

      {generalError ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{generalError}</Text>
        </View>
      ) : null}

      <CustomButton title="Guardar" icon="save" onPress={save} loading={isSaving} />

      {existing && (
        <>
          <Card style={styles.attendance}>
            <Text style={styles.attendanceTitle}>Asistencia real</Text>
            <Text style={styles.attendanceText}>
              Entrada:{' '}
              {existing.actualStartTime ? formatShortDateTime(existing.actualStartTime) : 'sin registrar'}
            </Text>
            <Text style={styles.attendanceText}>
              Salida: {existing.actualEndTime ? formatShortDateTime(existing.actualEndTime) : 'sin registrar'}
            </Text>
            {!existing.actualStartTime && (
              <CustomButton
                title="Registrar entrada ahora"
                icon="login"
                variant="secondary"
                onPress={() => registerAttendance('check-in')}
              />
            )}
            {existing.actualStartTime && !existing.actualEndTime && (
              <CustomButton
                title="Registrar salida ahora"
                icon="logout"
                variant="secondary"
                onPress={() => registerAttendance('check-out')}
              />
            )}
          </Card>
          <CustomButton title="Eliminar turno" icon="delete" variant="danger" onPress={remove} />
        </>
      )}
    </ScreenContainer>
  );
}

function formatShortDateTime(value: string): string {
  const date = parseDateTime(value);
  return `${formatShortDate(date)} ${formatTime(date)}`;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  flex: {
    flex: 1,
  },
  summary: {
    backgroundColor: Palette.primarySoft,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  summaryText: {
    fontSize: 15,
    color: Palette.text,
    fontWeight: '600',
  },
  summaryBadges: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  multiline: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  errorBox: {
    backgroundColor: Palette.dangerSoft,
    borderRadius: Radius.sm,
    padding: Spacing.md,
  },
  errorText: {
    color: Palette.danger,
    fontSize: 14,
  },
  attendance: {
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  attendanceTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Palette.text,
  },
  attendanceText: {
    fontSize: 14,
    color: Palette.textMuted,
  },
});
